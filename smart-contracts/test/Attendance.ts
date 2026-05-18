import assert from "node:assert/strict";
import { describe, it, before } from "node:test";

import { network } from "hardhat";
import { getAddress, parseUnits } from "viem";

describe("Attendance", async function () {
  const { viem } = await network.create();
  const publicClient = await viem.getPublicClient();
  const testClient = await viem.getTestClient();
  const [owner, alice, bob] = await viem.getWalletClients();

  const POOL_AMOUNT = parseUnits("1000", 6);

  async function deployFixture() {
    const mock = await viem.deployContract("MockGPBR");
    await mock.write.mint([owner.account.address, POOL_AMOUNT]);

    const attendance = await viem.deployContract("Attendance", [
      mock.address,
      owner.account.address,
    ]);

    await mock.write.transfer([attendance.address, POOL_AMOUNT]);

    return { mock, attendance };
  }

  describe("deployment & defaults", () => {
    it("sets the GPBR token, owner, and default config", async () => {
      const { mock, attendance } = await deployFixture();

      assert.equal(
        (await attendance.read.rewardToken()).toLowerCase(),
        mock.address.toLowerCase(),
      );
      assert.equal(
        (await attendance.read.owner()).toLowerCase(),
        owner.account.address.toLowerCase(),
      );
      assert.equal(await attendance.read.amount(), 1_000_000n);
      assert.equal(await attendance.read.period(), 5_400n);
      assert.equal(await attendance.read.distributionsCount(), 0n);
    });

    it("reverts on zero token address", async () => {
      const helper = await viem.deployContract("Attendance", [
        (await viem.deployContract("MockGPBR")).address,
        owner.account.address,
      ]);

      await viem.assertions.revertWithCustomError(
        viem.deployContract("Attendance", [
          "0x0000000000000000000000000000000000000000",
          owner.account.address,
        ]) as unknown as Promise<`0x${string}`>,
        helper,
        "InvalidConfig",
      );
    });
  });

  describe("setConfig", () => {
    it("only owner can call setConfig", async () => {
      const { attendance } = await deployFixture();

      const attendanceAsAlice = await viem.getContractAt(
        "Attendance",
        attendance.address,
        { client: { wallet: alice } },
      );

      await viem.assertions.revertWithCustomError(
        attendanceAsAlice.write.setConfig([2_000_000n, 1_000n]),
        attendance,
        "OwnableUnauthorizedAccount",
      );
    });

    it("rejects zero values", async () => {
      const { attendance } = await deployFixture();

      await viem.assertions.revertWithCustomError(
        attendance.write.setConfig([0n, 100n]),
        attendance,
        "InvalidConfig",
      );

      await viem.assertions.revertWithCustomError(
        attendance.write.setConfig([100n, 0n]),
        attendance,
        "InvalidConfig",
      );
    });

    it("updates config and emits ConfigUpdated", async () => {
      const { attendance } = await deployFixture();

      await viem.assertions.emitWithArgs(
        attendance.write.setConfig([2_500_000n, 1_000n]),
        attendance,
        "ConfigUpdated",
        [2_500_000n, 1_000n],
      );

      assert.equal(await attendance.read.amount(), 2_500_000n);
      assert.equal(await attendance.read.period(), 1_000n);
    });
  });

  describe("createDistribution", () => {
    it("only owner can call createDistribution", async () => {
      const { attendance } = await deployFixture();
      const attendanceAsAlice = await viem.getContractAt(
        "Attendance",
        attendance.address,
        { client: { wallet: alice } },
      );

      await viem.assertions.revertWithCustomError(
        attendanceAsAlice.write.createDistribution(),
        attendance,
        "OwnableUnauthorizedAccount",
      );
    });

    it("snapshots current amount/period and emits DistributionCreated", async () => {
      const { attendance } = await deployFixture();

      const txHash = await attendance.write.createDistribution();
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      const expectedEnd = receipt.blockNumber + 5_400n;

      const dist = await attendance.read.distributions([0n]);
      assert.equal(dist.amount, 1_000_000n);
      assert.equal(dist.startBlock, receipt.blockNumber);
      assert.equal(dist.endBlock, expectedEnd);
      assert.equal(await attendance.read.distributionsCount(), 1n);
      assert.equal(await attendance.read.isActive([0n]), true);
    });

    it("later setConfig does not retroactively affect open distributions", async () => {
      const { attendance } = await deployFixture();

      await attendance.write.createDistribution();
      const distBefore = await attendance.read.distributions([0n]);

      await attendance.write.setConfig([9_999_999n, 99n]);

      const distAfter = await attendance.read.distributions([0n]);
      assert.equal(distAfter.amount, distBefore.amount);
      assert.equal(distAfter.endBlock, distBefore.endBlock);

      await attendance.write.createDistribution();
      const dist2 = await attendance.read.distributions([1n]);
      assert.equal(dist2.amount, 9_999_999n);
      assert.equal(dist2.endBlock - dist2.startBlock, 99n);
    });
  });

  describe("claim", () => {
    it("transfers the snapshotted amount and marks the user as claimed", async () => {
      const { mock, attendance } = await deployFixture();
      await attendance.write.createDistribution();

      const attendanceAsAlice = await viem.getContractAt(
        "Attendance",
        attendance.address,
        { client: { wallet: alice } },
      );

      const before = await mock.read.balanceOf([alice.account.address]);

      await viem.assertions.emitWithArgs(
        attendanceAsAlice.write.claim([0n]),
        attendance,
        "Claim",
        [0n, getAddress(alice.account.address), 1_000_000n],
      );

      const after = await mock.read.balanceOf([alice.account.address]);
      assert.equal(after - before, 1_000_000n);
      assert.equal(
        await attendance.read.hasClaimed([0n, alice.account.address]),
        true,
      );
    });

    it("reverts on unknown distribution id", async () => {
      const { attendance } = await deployFixture();
      await viem.assertions.revertWithCustomError(
        attendance.write.claim([42n]),
        attendance,
        "UnknownDistribution",
      );
    });

    it("reverts when user already claimed", async () => {
      const { attendance } = await deployFixture();
      await attendance.write.createDistribution();

      const attendanceAsAlice = await viem.getContractAt(
        "Attendance",
        attendance.address,
        { client: { wallet: alice } },
      );

      await attendanceAsAlice.write.claim([0n]);
      await viem.assertions.revertWithCustomError(
        attendanceAsAlice.write.claim([0n]),
        attendance,
        "AlreadyClaimed",
      );
    });

    it("reverts after the claim window has expired", async () => {
      const { attendance } = await deployFixture();
      await attendance.write.setConfig([1_000_000n, 10n]);
      await attendance.write.createDistribution();

      await testClient.mine({ blocks: 11 });

      const attendanceAsAlice = await viem.getContractAt(
        "Attendance",
        attendance.address,
        { client: { wallet: alice } },
      );

      assert.equal(await attendance.read.isActive([0n]), false);

      await viem.assertions.revertWithCustomError(
        attendanceAsAlice.write.claim([0n]),
        attendance,
        "NotActive",
      );
    });

    it("reverts when the pool cannot cover the amount", async () => {
      const mock = await viem.deployContract("MockGPBR");
      const attendance = await viem.deployContract("Attendance", [
        mock.address,
        owner.account.address,
      ]);
      await attendance.write.createDistribution();

      const attendanceAsAlice = await viem.getContractAt(
        "Attendance",
        attendance.address,
        { client: { wallet: alice } },
      );

      await viem.assertions.revertWithCustomError(
        attendanceAsAlice.write.claim([0n]),
        attendance,
        "InsufficientPool",
      );
    });

    it("supports independent claims by different users on the same distribution", async () => {
      const { mock, attendance } = await deployFixture();
      await attendance.write.createDistribution();

      const attendanceAsAlice = await viem.getContractAt(
        "Attendance",
        attendance.address,
        { client: { wallet: alice } },
      );
      const attendanceAsBob = await viem.getContractAt(
        "Attendance",
        attendance.address,
        { client: { wallet: bob } },
      );

      await attendanceAsAlice.write.claim([0n]);
      await attendanceAsBob.write.claim([0n]);

      assert.equal(
        await mock.read.balanceOf([alice.account.address]),
        1_000_000n,
      );
      assert.equal(
        await mock.read.balanceOf([bob.account.address]),
        1_000_000n,
      );
    });
  });

  describe("withdraw", () => {
    it("only owner can withdraw", async () => {
      const { attendance } = await deployFixture();
      const attendanceAsAlice = await viem.getContractAt(
        "Attendance",
        attendance.address,
        { client: { wallet: alice } },
      );

      await viem.assertions.revertWithCustomError(
        attendanceAsAlice.write.withdraw([1n]),
        attendance,
        "OwnableUnauthorizedAccount",
      );
    });

    it("transfers GPBR to the owner and emits Withdrawn", async () => {
      const { mock, attendance } = await deployFixture();

      const before = await mock.read.balanceOf([owner.account.address]);

      await viem.assertions.emitWithArgs(
        attendance.write.withdraw([POOL_AMOUNT]),
        attendance,
        "Withdrawn",
        [getAddress(owner.account.address), POOL_AMOUNT],
      );

      const after = await mock.read.balanceOf([owner.account.address]);
      assert.equal(after - before, POOL_AMOUNT);
      assert.equal(await mock.read.balanceOf([attendance.address]), 0n);
    });
  });
});
