import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";
import { parseUnits } from "viem";

describe("GPBRVSwapper", async function () {
  const { viem } = await network.create();
  const [deployer, user, minipay, stranger] = await viem.getWalletClients();

  const GPBRV_DECIMALS = 6;
  const USDM_DECIMALS = 18;

  // Generous reserves so the mock pool / router never run dry.
  const RESERVE = parseUnits("1000000", 18);
  const GPBRV_RESERVE = parseUnits("1000000", 6);

  const WITHDRAW_AMOUNT = parseUnits("10", GPBRV_DECIMALS); // 10 GPBRV
  const EXPECTED_USDM_OUT = parseUnits("10", USDM_DECIMALS); // 1:1 value
  const DEPOSIT_AMOUNT = parseUnits("10", USDM_DECIMALS); // 10 USDM
  const EXPECTED_GPBRV_OUT = parseUnits("10", GPBRV_DECIMALS); // 1:1 value

  async function deployFixture() {
    const gpbrv = await viem.deployContract("MockERC20", ["GPBRV", "GPBRV", GPBRV_DECIMALS]);
    const brlm = await viem.deployContract("MockERC20", ["BRLM", "BRLM", 18]);
    const usdm = await viem.deployContract("MockERC20", ["USDM", "USDM", USDM_DECIMALS]);

    const pool = await viem.deployContract("MockSwapPool");
    const router = await viem.deployContract("MockMentoRouter");

    const swapper = await viem.deployContract("GPBRVSwapper", [
      gpbrv.address,
      brlm.address,
      usdm.address,
      pool.address,
      router.address,
      // factory address is opaque to the mock router.
      "0x0000000000000000000000000000000000000001",
    ]);

    // Pool needs BRLM (for withdraw GPBRV->BRLM) and GPBRV (for deposit BRLM->GPBRV).
    await brlm.write.mint([pool.address, RESERVE]);
    await gpbrv.write.mint([pool.address, GPBRV_RESERVE]);

    // Router needs USDM (for withdraw BRLM->USDM) and BRLM (for deposit USDM->BRLM).
    await usdm.write.mint([router.address, RESERVE]);
    await brlm.write.mint([router.address, RESERVE]);

    // Seed end users.
    await gpbrv.write.mint([user.account.address, GPBRV_RESERVE]);
    await usdm.write.mint([minipay.account.address, RESERVE]);

    return { gpbrv, brlm, usdm, pool, router, swapper };
  }

  function asWallet<T extends { address: `0x${string}` }>(
    contractName: "GPBRVSwapper" | "MockERC20",
    contract: T,
    wallet: typeof user,
  ) {
    return viem.getContractAt(contractName, contract.address, { client: { wallet } });
  }

  describe("configure", () => {
    it("stores both forward and reverse mappings", async () => {
      const { swapper } = await deployFixture();
      const swapperAsUser = await asWallet("GPBRVSwapper", swapper, user);

      await swapperAsUser.write.configure([minipay.account.address]);

      assert.equal(
        (await swapper.read.userToMinipay([user.account.address])).toLowerCase(),
        minipay.account.address.toLowerCase(),
      );
      assert.equal(
        (await swapper.read.minipayToUser([minipay.account.address])).toLowerCase(),
        user.account.address.toLowerCase(),
      );
    });

    it("reverts on zero address", async () => {
      const { swapper } = await deployFixture();
      const swapperAsUser = await asWallet("GPBRVSwapper", swapper, user);

      await viem.assertions.revertWithCustomError(
        swapperAsUser.write.configure(["0x0000000000000000000000000000000000000000"]),
        swapper,
        "InvalidAddress",
      );
    });

    it("reverts when linking a minipay equal to the caller", async () => {
      const { swapper } = await deployFixture();
      const swapperAsUser = await asWallet("GPBRVSwapper", swapper, user);

      await viem.assertions.revertWithCustomError(
        swapperAsUser.write.configure([user.account.address]),
        swapper,
        "InvalidAddress",
      );
    });

    it("reverts when the minipay is already linked to another user", async () => {
      const { swapper } = await deployFixture();
      const swapperAsUser = await asWallet("GPBRVSwapper", swapper, user);
      const swapperAsStranger = await asWallet("GPBRVSwapper", swapper, stranger);

      await swapperAsUser.write.configure([minipay.account.address]);

      await viem.assertions.revertWithCustomError(
        swapperAsStranger.write.configure([minipay.account.address]),
        swapper,
        "MinipayAlreadyLinked",
      );
    });

    it("clears the previous reverse mapping when re-configuring", async () => {
      const { swapper } = await deployFixture();
      const swapperAsUser = await asWallet("GPBRVSwapper", swapper, user);

      await swapperAsUser.write.configure([minipay.account.address]);
      await swapperAsUser.write.configure([stranger.account.address]);

      assert.equal(
        await swapper.read.minipayToUser([minipay.account.address]),
        "0x0000000000000000000000000000000000000000",
      );
      assert.equal(
        (await swapper.read.minipayToUser([stranger.account.address])).toLowerCase(),
        user.account.address.toLowerCase(),
      );
    });
  });

  describe("withdraw", () => {
    it("converts user GPBRV into USDM sent to the configured minipay", async () => {
      const { gpbrv, usdm, swapper } = await deployFixture();
      const swapperAsUser = await asWallet("GPBRVSwapper", swapper, user);
      const gpbrvAsUser = await asWallet("MockERC20", gpbrv, user);

      await swapperAsUser.write.configure([minipay.account.address]);
      await gpbrvAsUser.write.approve([swapper.address, WITHDRAW_AMOUNT]);

      const userBefore = await gpbrv.read.balanceOf([user.account.address]);
      const minipayBefore = await usdm.read.balanceOf([minipay.account.address]);

      await swapperAsUser.write.withdraw([WITHDRAW_AMOUNT, parseUnits("9.9", USDM_DECIMALS)]);

      assert.equal(
        userBefore - (await gpbrv.read.balanceOf([user.account.address])),
        WITHDRAW_AMOUNT,
      );
      assert.equal(
        (await usdm.read.balanceOf([minipay.account.address])) - minipayBefore,
        EXPECTED_USDM_OUT,
      );
    });

    it("reverts when the caller has no configured minipay", async () => {
      const { gpbrv, swapper } = await deployFixture();
      const swapperAsUser = await asWallet("GPBRVSwapper", swapper, user);
      const gpbrvAsUser = await asWallet("MockERC20", gpbrv, user);

      await gpbrvAsUser.write.approve([swapper.address, WITHDRAW_AMOUNT]);

      await viem.assertions.revertWithCustomError(
        swapperAsUser.write.withdraw([WITHDRAW_AMOUNT, 0n]),
        swapper,
        "NotConfigured",
      );
    });

    it("reverts when the user lacks GPBRV balance", async () => {
      const { gpbrv, swapper } = await deployFixture();
      const swapperAsStranger = await asWallet("GPBRVSwapper", swapper, stranger);
      const gpbrvAsStranger = await asWallet("MockERC20", gpbrv, stranger);

      await swapperAsStranger.write.configure([minipay.account.address]);
      await gpbrvAsStranger.write.approve([swapper.address, WITHDRAW_AMOUNT]);

      await viem.assertions.revertWithCustomError(
        swapperAsStranger.write.withdraw([WITHDRAW_AMOUNT, 0n]),
        gpbrv,
        "ERC20InsufficientBalance",
      );
    });

    it("reverts when minUsdmOut exceeds the swap output", async () => {
      const { gpbrv, router, swapper } = await deployFixture();
      const swapperAsUser = await asWallet("GPBRVSwapper", swapper, user);
      const gpbrvAsUser = await asWallet("MockERC20", gpbrv, user);

      await swapperAsUser.write.configure([minipay.account.address]);
      await gpbrvAsUser.write.approve([swapper.address, WITHDRAW_AMOUNT]);

      await viem.assertions.revertWithCustomError(
        swapperAsUser.write.withdraw([WITHDRAW_AMOUNT, parseUnits("11", USDM_DECIMALS)]),
        router,
        "InsufficientOutputAmount",
      );
    });
  });

  describe("deposit", () => {
    it("converts minipay USDM into GPBRV sent to the linked user", async () => {
      const { gpbrv, usdm, swapper } = await deployFixture();
      const swapperAsUser = await asWallet("GPBRVSwapper", swapper, user);
      const swapperAsMinipay = await asWallet("GPBRVSwapper", swapper, minipay);
      const usdmAsMinipay = await asWallet("MockERC20", usdm, minipay);

      await swapperAsUser.write.configure([minipay.account.address]);
      await usdmAsMinipay.write.approve([swapper.address, DEPOSIT_AMOUNT]);

      const minipayBefore = await usdm.read.balanceOf([minipay.account.address]);
      const userBefore = await gpbrv.read.balanceOf([user.account.address]);

      await swapperAsMinipay.write.deposit([DEPOSIT_AMOUNT, parseUnits("9.9", GPBRV_DECIMALS)]);

      assert.equal(
        minipayBefore - (await usdm.read.balanceOf([minipay.account.address])),
        DEPOSIT_AMOUNT,
      );
      assert.equal(
        (await gpbrv.read.balanceOf([user.account.address])) - userBefore,
        EXPECTED_GPBRV_OUT,
      );
    });

    it("reverts when the sender is not a registered minipay", async () => {
      const { usdm, swapper } = await deployFixture();
      const swapperAsMinipay = await asWallet("GPBRVSwapper", swapper, minipay);
      const usdmAsMinipay = await asWallet("MockERC20", usdm, minipay);

      await usdmAsMinipay.write.approve([swapper.address, DEPOSIT_AMOUNT]);

      await viem.assertions.revertWithCustomError(
        swapperAsMinipay.write.deposit([DEPOSIT_AMOUNT, 0n]),
        swapper,
        "NotConfigured",
      );
    });

    it("reverts when minGpbrvOut exceeds the swap output", async () => {
      const { usdm, swapper } = await deployFixture();
      const swapperAsUser = await asWallet("GPBRVSwapper", swapper, user);
      const swapperAsMinipay = await asWallet("GPBRVSwapper", swapper, minipay);
      const usdmAsMinipay = await asWallet("MockERC20", usdm, minipay);

      await swapperAsUser.write.configure([minipay.account.address]);
      await usdmAsMinipay.write.approve([swapper.address, DEPOSIT_AMOUNT]);

      await viem.assertions.revertWithCustomError(
        swapperAsMinipay.write.deposit([DEPOSIT_AMOUNT, parseUnits("11", GPBRV_DECIMALS)]),
        swapper,
        "InsufficientOutput",
      );
    });
  });
});
