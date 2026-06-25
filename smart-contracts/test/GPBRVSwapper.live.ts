import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";
import { createWalletClient, encodeFunctionData, erc20Abi, http, parseUnits, Hex } from "viem";

/**
 * Live tests executed against a local anvil node forked from Celo.
 *
 * Required runtime setup:
 *   anvil --fork-url https://forno.celo.org --chain-id 42220
 *
 * The suite skips itself when anvil is unreachable or the whale env vars are unset,
 * so it does not break the default `hardhat test` flow.
 *
 * Note: the real Sarafu pool and Mento router enforce liquidity and per-swap limits.
 * Keep WITHDRAW_AMOUNT / DEPOSIT_AMOUNT small; tune them to the live pool reserves.
 */

const GPBRV_ADDRESS = "0x6ec3d6e693526108990c6d5cbd2195e051321d32" as const;
const BRLM_ADDRESS = "0xe8537a3d056da446677b9e9d6c5db704eaab4787" as const;
const USDM_ADDRESS = "0x765de816845861e75a25fca122bb6898b8b1282a" as const;
const SARAFU_POOL = "0xD12F1aE0C018210d18F6cB01cD6c7bd669eF7529" as const;
const MENTO_ROUTER = "0x4861840C2EfB2b98312B0aE34d86fD73E8f9B6f6" as const;
const MENTO_FACTORY = "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3" as const;

const WITHDRAW_AMOUNT = parseUnits("1", 6); // 1 GPBRV
const DEPOSIT_AMOUNT = parseUnits("0.1", 18); // 0.1 USDM

const gpbrvWhale = "0xd12f1ae0c018210d18f6cb01cd6c7bd669ef7529" as Hex; //GPBRV SWAP POOL (RICH IN GPBRV)
const usdmWhale = "0xaa8299FC6A685B5f9Ce9bdA8d0B3ea3D54731976" as Hex; //USDM whale got from celoscan holders

function logStep(test: string, step: number, total: number, label: string) {
  console.log(`[GPBRVSwapper.live] ${test} | step ${step}/${total}: ${label} — ok`);
}

async function tryConnect() {
  try {
    const conn = await network.create({ network: "localFork", chainType: "l1" });
    const viem = conn.viem;
    const publicClient = await viem.getPublicClient();
    await publicClient.getChainId();
    return { conn, viem, publicClient };
  } catch (err) {
    if (process.env.GPBRV_LIVE_DEBUG === "1") {
      console.error("[GPBRVSwapper.live] connect failed:", err);
    }
    return null;
  }
}

describe("GPBRVSwapper (live, forked Celo)", async function () {
  const ready = await tryConnect();

  if (ready === null) {
    it("skipped: local anvil fork is not reachable on 127.0.0.1:8545", { skip: true }, () => {});
    return;
  }

  if (gpbrvWhale === undefined || usdmWhale === undefined) {
    it("skipped: GPBRV_WHALE and/or USDM_WHALE env vars not set", { skip: true }, () => {});
    return;
  }

  const { viem, publicClient } = ready;
  const testClient = await viem.getTestClient({ mode: "anvil" });
  const [owner, minipay] = await viem.getWalletClients();

  console.log("[GPBRVSwapper.live] connected to anvil fork");
  console.log("[GPBRVSwapper.live] owner:", owner.account.address);
  console.log("[GPBRVSwapper.live] minipay:", minipay.account.address);

  // Bypass Hardhat's local-accounts handler by talking to anvil directly.
  const rawAnvil = createWalletClient({ transport: http("http://127.0.0.1:8545") });

  async function seedToken(token: `0x${string}`, whale: `0x${string}`, to: `0x${string}`, value: bigint) {
    await testClient.impersonateAccount({ address: whale });
    await testClient.setBalance({ address: whale, value: 10n ** 18n });
    await testClient.setBalance({ address: to, value: 10n ** 18n });

    const data = encodeFunctionData({
      abi: erc20Abi,
      functionName: "transfer",
      args: [to, value],
    });
    const hash = await rawAnvil.request({
      method: "eth_sendTransaction",
      params: [{ from: whale, to: token, data }],
    });
    await publicClient.waitForTransactionReceipt({ hash });

    await testClient.stopImpersonatingAccount({ address: whale });
  }

  async function deploySwapper() {
    return viem.deployContract("GPBRVSwapper", [
      GPBRV_ADDRESS,
      BRLM_ADDRESS,
      USDM_ADDRESS,
      SARAFU_POOL,
      MENTO_ROUTER,
      MENTO_FACTORY,
    ]);
  }

  it("withdraw (single wallet): caller GPBRV becomes USDM in the same wallet", async () => {
    const testName = "withdraw (single wallet)";

    const swapper = await deploySwapper();
    logStep(testName, 1, 6, `deployed swapper at ${swapper.address}`);

    await seedToken(GPBRV_ADDRESS, gpbrvWhale!, owner.account.address, WITHDRAW_AMOUNT);
    logStep(testName, 2, 6, `seeded ${WITHDRAW_AMOUNT} GPBRV to owner`);

    const approveHash = await owner.writeContract({
      address: GPBRV_ADDRESS,
      abi: erc20Abi,
      functionName: "approve",
      args: [swapper.address, WITHDRAW_AMOUNT],
    });
    await publicClient.waitForTransactionReceipt({ hash: approveHash });
    logStep(testName, 3, 6, "approved swapper to spend GPBRV");

    const usdmBefore = await publicClient.readContract({
      address: USDM_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [owner.account.address],
    });
    logStep(testName, 4, 6, `read USDM balance before withdraw (${usdmBefore})`);

    const hash = await swapper.write.withdraw([WITHDRAW_AMOUNT, 0n]);
    await publicClient.waitForTransactionReceipt({ hash });
    logStep(testName, 5, 6, `withdraw tx confirmed (${hash})`);

    const usdmAfter = await publicClient.readContract({
      address: USDM_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [owner.account.address],
    });
    logStep(testName, 6, 6, `USDM increased ${usdmBefore.toString()} -> ${usdmAfter.toString()}`);

    assert.ok(
      usdmAfter > usdmBefore,
      `expected caller USDM to increase, got ${usdmBefore} -> ${usdmAfter}`,
    );
  });

  it("deposit (single wallet): caller USDM becomes GPBRV in the same wallet", { skip: true }, async () => {
    const testName = "deposit (single wallet)";

    const swapper = await deploySwapper();
    logStep(testName, 1, 6, `deployed swapper at ${swapper.address}`);

    await seedToken(USDM_ADDRESS, usdmWhale!, owner.account.address, DEPOSIT_AMOUNT);
    logStep(testName, 2, 6, `seeded ${DEPOSIT_AMOUNT} USDM to owner`);

    const approveHash = await owner.writeContract({
      address: USDM_ADDRESS,
      abi: erc20Abi,
      functionName: "approve",
      args: [swapper.address, DEPOSIT_AMOUNT],
    });
    await publicClient.waitForTransactionReceipt({ hash: approveHash });
    logStep(testName, 3, 6, "approved swapper to spend USDM");

    const gpbrvBefore = await publicClient.readContract({
      address: GPBRV_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [owner.account.address],
    });
    logStep(testName, 4, 6, `read GPBRV balance before deposit (${gpbrvBefore})`);

    const hash = await swapper.write.deposit([DEPOSIT_AMOUNT, 0n]);
    await publicClient.waitForTransactionReceipt({ hash });
    logStep(testName, 5, 6, `deposit tx confirmed (${hash})`);

    const gpbrvAfter = await publicClient.readContract({
      address: GPBRV_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [owner.account.address],
    });
    logStep(testName, 6, 6, `GPBRV increased ${gpbrvBefore} -> ${gpbrvAfter}`);

    assert.ok(
      gpbrvAfter > gpbrvBefore,
      `expected caller GPBRV to increase, got ${gpbrvBefore} -> ${gpbrvAfter}`,
    );
  });

  it("withdrawWithMinipay: user GPBRV becomes USDM on the configured minipay", { skip: true }, async () => {
    const testName = "withdrawWithMinipay";

    const swapper = await deploySwapper();
    logStep(testName, 1, 7, `deployed swapper at ${swapper.address}`);

    await seedToken(GPBRV_ADDRESS, gpbrvWhale!, owner.account.address, WITHDRAW_AMOUNT);
    logStep(testName, 2, 7, `seeded ${WITHDRAW_AMOUNT} GPBRV to owner`);

    await swapper.write.configure([minipay.account.address]);
    logStep(testName, 3, 7, `configured minipay ${minipay.account.address}`);

    const approveHash = await owner.writeContract({
      address: GPBRV_ADDRESS,
      abi: erc20Abi,
      functionName: "approve",
      args: [swapper.address, WITHDRAW_AMOUNT],
    });
    await publicClient.waitForTransactionReceipt({ hash: approveHash });
    logStep(testName, 4, 7, "approved swapper to spend GPBRV");

    const minipayBefore = await publicClient.readContract({
      address: USDM_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [minipay.account.address],
    });
    logStep(testName, 5, 7, `read minipay USDM balance before withdraw (${minipayBefore})`);

    const hash = await swapper.write.withdrawWithMinipay([WITHDRAW_AMOUNT, 0n]);
    await publicClient.waitForTransactionReceipt({ hash });
    logStep(testName, 6, 7, `withdrawWithMinipay tx confirmed (${hash})`);

    const minipayAfter = await publicClient.readContract({
      address: USDM_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [minipay.account.address],
    });
    logStep(testName, 7, 7, `minipay USDM increased ${minipayBefore} -> ${minipayAfter}`);

    assert.ok(
      minipayAfter > minipayBefore,
      `expected minipay USDM to increase, got ${minipayBefore} -> ${minipayAfter}`,
    );
  });

  it("depositWithMinipay: minipay USDM becomes GPBRV on the linked user", { skip: true }, async () => {
    const testName = "depositWithMinipay";

    const swapper = await deploySwapper();
    logStep(testName, 1, 7, `deployed swapper at ${swapper.address}`);

    await seedToken(USDM_ADDRESS, usdmWhale!, minipay.account.address, DEPOSIT_AMOUNT);
    logStep(testName, 2, 7, `seeded ${DEPOSIT_AMOUNT} USDM to minipay`);

    await swapper.write.configure([minipay.account.address]);
    logStep(testName, 3, 7, `configured minipay ${minipay.account.address}`);

    const approveHash = await minipay.writeContract({
      address: USDM_ADDRESS,
      abi: erc20Abi,
      functionName: "approve",
      args: [swapper.address, DEPOSIT_AMOUNT],
    });
    await publicClient.waitForTransactionReceipt({ hash: approveHash });
    logStep(testName, 4, 7, "minipay approved swapper to spend USDM");

    const userBefore = await publicClient.readContract({
      address: GPBRV_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [owner.account.address],
    });
    logStep(testName, 5, 7, `read user GPBRV balance before deposit (${userBefore})`);

    const swapperAsMinipay = await viem.getContractAt("GPBRVSwapper", swapper.address, {
      client: { wallet: minipay },
    });
    const hash = await swapperAsMinipay.write.depositWithMinipay([DEPOSIT_AMOUNT, 0n]);
    await publicClient.waitForTransactionReceipt({ hash });
    logStep(testName, 6, 7, `depositWithMinipay tx confirmed (${hash})`);

    const userAfter = await publicClient.readContract({
      address: GPBRV_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [owner.account.address],
    });
    logStep(testName, 7, 7, `user GPBRV increased ${userBefore} -> ${userAfter}`);

    assert.ok(
      userAfter > userBefore,
      `expected user GPBRV to increase, got ${userBefore} -> ${userAfter}`,
    );
  });
});
