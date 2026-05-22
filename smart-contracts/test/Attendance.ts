import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";
import { getAddress, parseUnits } from "viem";

describe("Attendance", async function () {
  const { viem } = await network.create();
  const publicClient = await viem.getPublicClient();
  const testClient = await viem.getTestClient();
  const [owner, alice, bob] = await viem.getWalletClients();

  const POOL_AMOUNT = parseUnits("1000", 6);
  const MAX_UINT = 2n ** 256n - 1n;

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
    it("sets the GPBR token, owner, default config, and seeds initialOwner as creator", async () => {
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
      assert.equal(
        await attendance.read.isCreator([owner.account.address]),
        true,
      );
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

  describe("allowlist", () => {
    it("only owner can add or remove creators", async () => {
      const { attendance } = await deployFixture();
      const attendanceAsAlice = await viem.getContractAt(
        "Attendance",
        attendance.address,
        { client: { wallet: alice } },
      );

      await viem.assertions.revertWithCustomError(
        attendanceAsAlice.write.addCreator([bob.account.address]),
        attendance,
        "OwnableUnauthorizedAccount",
      );

      await viem.assertions.revertWithCustomError(
        attendanceAsAlice.write.removeCreator([owner.account.address]),
        attendance,
        "OwnableUnauthorizedAccount",
      );
    });

    it("owner can add a creator and that address can create distributions", async () => {
      const { attendance } = await deployFixture();

      await attendance.write.addCreator([alice.account.address]);
      assert.equal(
        await attendance.read.isCreator([alice.account.address]),
        true,
      );

      const attendanceAsAlice = await viem.getContractAt(
        "Attendance",
        attendance.address,
        { client: { wallet: alice } },
      );

      await attendanceAsAlice.write.createDistribution([0n]);
      assert.equal(await attendance.read.distributionsCount(), 1n);
    });

    it("owner can remove a creator and that address can no longer create", async () => {
      const { attendance } = await deployFixture();

      await attendance.write.addCreator([alice.account.address]);
      await attendance.write.removeCreator([alice.account.address]);
      assert.equal(
        await attendance.read.isCreator([alice.account.address]),
        false,
      );

      const attendanceAsAlice = await viem.getContractAt(
        "Attendance",
        attendance.address,
        { client: { wallet: alice } },
      );

      await viem.assertions.revertWithCustomError(
        attendanceAsAlice.write.createDistribution([0n]),
        attendance,
        "NotAllowedCreator",
      );
    });

    it("rejects invalid add/remove operations", async () => {
      const { attendance } = await deployFixture();

      await viem.assertions.revertWithCustomError(
        attendance.write.addCreator(["0x0000000000000000000000000000000000000000"]),
        attendance,
        "InvalidConfig",
      );

      await viem.assertions.revertWithCustomError(
        attendance.write.addCreator([owner.account.address]),
        attendance,
        "InvalidConfig",
      );

      await viem.assertions.revertWithCustomError(
        attendance.write.removeCreator([alice.account.address]),
        attendance,
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
    it("only allowlisted creator can call createDistribution", async () => {
      const { attendance } = await deployFixture();
      const attendanceAsAlice = await viem.getContractAt(
        "Attendance",
        attendance.address,
        { client: { wallet: alice } },
      );

      await viem.assertions.revertWithCustomError(
        attendanceAsAlice.write.createDistribution([0n]),
        attendance,
        "NotAllowedCreator",
      );

      await attendance.write.createDistribution([0n]);
      assert.equal(await attendance.read.distributionsCount(), 1n);
    });

    it("stores unlimited maxClaimers when 0 is passed", async () => {
      const { attendance } = await deployFixture();

      await attendance.write.createDistribution([0n]);
      const dist = await attendance.read.distributions([0n]);
      assert.equal(dist.maxClaimers, MAX_UINT);
    });

    it("snapshots current amount/period and emits DistributionCreated", async () => {
      const { attendance } = await deployFixture();

      const txHash = await attendance.write.createDistribution([5n]);
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      const expectedEnd = receipt.blockNumber + 5_400n;

      const dist = await attendance.read.distributions([0n]);
      assert.equal(dist.amount, 1_000_000n);
      assert.equal(dist.startBlock, receipt.blockNumber);
      assert.equal(dist.endBlock, expectedEnd);
      assert.equal(dist.maxClaimers, 5n);
      assert.equal(dist.claimsCount, 0n);
      assert.equal(dist.cancelled, false);
      assert.equal(await attendance.read.distributionsCount(), 1n);
      assert.equal(await attendance.read.isActive([0n]), true);
    });

    it("later setConfig does not retroactively affect open distributions", async () => {
      const { attendance } = await deployFixture();

      await attendance.write.createDistribution([3n]);
      const distBefore = await attendance.read.distributions([0n]);

      await attendance.write.setConfig([9_999_999n, 99n]);

      const distAfter = await attendance.read.distributions([0n]);
      assert.equal(distAfter.amount, distBefore.amount);
      assert.equal(distAfter.endBlock, distBefore.endBlock);
      assert.equal(distAfter.maxClaimers, distBefore.maxClaimers);

      await attendance.write.createDistribution([0n]);
      const dist2 = await attendance.read.distributions([1n]);
      assert.equal(dist2.amount, 9_999_999n);
      assert.equal(dist2.endBlock - dist2.startBlock, 99n);
      assert.equal(dist2.maxClaimers, MAX_UINT);
    });
  });

  describe("cancelDistribution", () => {
    it("only allowlisted creator can cancel", async () => {
      const { attendance } = await deployFixture();
      await attendance.write.createDistribution([0n]);

      const attendanceAsAlice = await viem.getContractAt(
        "Attendance",
        attendance.address,
        { client: { wallet: alice } },
      );

      await viem.assertions.revertWithCustomError(
        attendanceAsAlice.write.cancelDistribution([0n]),
        attendance,
        "NotAllowedCreator",
      );
    });

    it("cancels a distribution and emits DistributionCancelled", async () => {
      const { attendance } = await deployFixture();
      await attendance.write.createDistribution([0n]);

      await viem.assertions.emitWithArgs(
        attendance.write.cancelDistribution([0n]),
        attendance,
        "DistributionCancelled",
        [0n],
      );

      const dist = await attendance.read.distributions([0n]);
      assert.equal(dist.cancelled, true);
      assert.equal(await attendance.read.isActive([0n]), false);
    });

    it("reverts when cancelling an already cancelled distribution", async () => {
      const { attendance } = await deployFixture();
      await attendance.write.createDistribution([0n]);
      await attendance.write.cancelDistribution([0n]);

      await viem.assertions.revertWithCustomError(
        attendance.write.cancelDistribution([0n]),
        attendance,
        "NotActive",
      );
    });
  });

  describe("claim", () => {
    it("transfers the snapshotted amount and marks the user as claimed", async () => {
      const { mock, attendance } = await deployFixture();
      await attendance.write.createDistribution([0n]);

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

      const dist = await attendance.read.distributions([0n]);
      assert.equal(dist.claimsCount, 1n);
    });

    it("reverts when max claimers is reached", async () => {
      const { attendance } = await deployFixture();
      await attendance.write.createDistribution([2n]);

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

      const [charlie] = await viem.getWalletClients({ accountCount: 4 });
      const attendanceAsCharlie = await viem.getContractAt(
        "Attendance",
        attendance.address,
        { client: { wallet: charlie } },
      );

      await viem.assertions.revertWithCustomError(
        attendanceAsCharlie.write.claim([0n]),
        attendance,
        "MaxClaimersReached",
      );

      assert.equal(await attendance.read.isActive([0n]), false);
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
      await attendance.write.createDistribution([0n]);

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
      await attendance.write.createDistribution([0n]);

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

    it("reverts on cancelled distribution", async () => {
      const { attendance } = await deployFixture();
      await attendance.write.createDistribution([0n]);
      await attendance.write.cancelDistribution([0n]);

      const attendanceAsAlice = await viem.getContractAt(
        "Attendance",
        attendance.address,
        { client: { wallet: alice } },
      );

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
      await attendance.write.createDistribution([0n]);

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
      await attendance.write.createDistribution([0n]);

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
