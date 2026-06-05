import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";
import { createWalletClient, encodeFunctionData, erc20Abi, http, parseUnits } from "viem";

/**
 * Live tests executed against a local anvil node forked from Celo.
 *
 * Required runtime setup:
 *   anvil --fork-url https://forno.celo.org --chain-id 42220
 *
 * Configure via env vars:
 *   GPBRV_WHALE - address holding GPBRV on Celo (seeds the main wallet for withdraw)
 *   USDM_WHALE  - address holding USDM on Celo (seeds the MiniPay wallet for deposit)
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

const gpbrvWhale = process.env.GPBRV_WHALE as `0x${string}` | undefined;
const usdmWhale = process.env.USDM_WHALE as `0x${string}` | undefined;

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

  // Bypass Hardhat's local-accounts handler by talking to anvil directly.
  const rawAnvil = createWalletClient({ transport: http("http://127.0.0.1:8545") });

  async function seedToken(token: `0x${string}`, whale: `0x${string}`, to: `0x${string}`, value: bigint) {
    await testClient.impersonateAccount({ address: whale });
    await testClient.setBalance({ address: whale, value: 10n ** 18n });

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

  it("withdraw: user GPBRV becomes USDM on the configured minipay", async () => {
    const swapper = await deploySwapper();

    await seedToken(GPBRV_ADDRESS, gpbrvWhale!, owner.account.address, WITHDRAW_AMOUNT);
    await swapper.write.configure([minipay.account.address]);

    const approveHash = await owner.writeContract({
      address: GPBRV_ADDRESS,
      abi: erc20Abi,
      functionName: "approve",
      args: [swapper.address, WITHDRAW_AMOUNT],
    });
    await publicClient.waitForTransactionReceipt({ hash: approveHash });

    const minipayBefore = await publicClient.readContract({
      address: USDM_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [minipay.account.address],
    });

    const hash = await swapper.write.withdraw([WITHDRAW_AMOUNT, 0n]);
    await publicClient.waitForTransactionReceipt({ hash });

    const minipayAfter = await publicClient.readContract({
      address: USDM_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [minipay.account.address],
    });

    assert.ok(
      minipayAfter > minipayBefore,
      `expected minipay USDM to increase, got ${minipayBefore} -> ${minipayAfter}`,
    );
  });

  it("deposit: minipay USDM becomes GPBRV on the linked user", async () => {
    const swapper = await deploySwapper();

    await seedToken(USDM_ADDRESS, usdmWhale!, minipay.account.address, DEPOSIT_AMOUNT);
    await swapper.write.configure([minipay.account.address]);

    const approveHash = await minipay.writeContract({
      address: USDM_ADDRESS,
      abi: erc20Abi,
      functionName: "approve",
      args: [swapper.address, DEPOSIT_AMOUNT],
    });
    await publicClient.waitForTransactionReceipt({ hash: approveHash });

    const userBefore = await publicClient.readContract({
      address: GPBRV_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [owner.account.address],
    });

    const swapperAsMinipay = await viem.getContractAt("GPBRVSwapper", swapper.address, {
      client: { wallet: minipay },
    });
    const hash = await swapperAsMinipay.write.deposit([DEPOSIT_AMOUNT, 0n]);
    await publicClient.waitForTransactionReceipt({ hash });

    const userAfter = await publicClient.readContract({
      address: GPBRV_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [owner.account.address],
    });

    assert.ok(
      userAfter > userBefore,
      `expected user GPBRV to increase, got ${userBefore} -> ${userAfter}`,
    );
  });
});
