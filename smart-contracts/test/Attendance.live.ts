import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";
import {
  createWalletClient,
  encodeFunctionData,
  erc20Abi,
  getAddress,
  http,
  parseUnits,
} from "viem";

/**
 * Live tests executed against a local anvil node forked from Celo.
 *
 * Required runtime setup (see LIVE_TESTS.md):
 *   anvil --fork-url https://forno.celo.org --chain-id 42220
 *
 * Configure via env vars:
 *   GPBR_WHALE   - address holding GPBR on Celo (used to seed the test pool)
 *   LOCAL_PRIVATE_KEY - any pre-funded anvil key (set via `npx hardhat keystore set LOCAL_PRIVATE_KEY`)
 *
 * The suite skips itself when anvil is unreachable or GPBR_WHALE is not provided,
 * so it does not break the default `hardhat test` flow.
 */

const GPBR_ADDRESS = "0xd832B2F117db51021Ad0387c17182796DBEB69df" as const;
const CLAIM_AMOUNT = 1_000_000n;
const POOL_AMOUNT = parseUnits("10", 6);

//const whale = process.env.GPBR_WHALE as `0x${string}` | undefined;
const whale = "0xAcD59e854adf632d2322404198624F757C868C97" as `0x${string}`; //groweco.eth address

async function tryConnect() {
  try {
    const conn = await network.create({ network: "localFork", chainType: "l1" });
    const viem = conn.viem;
    const publicClient = await viem.getPublicClient();
    await publicClient.getChainId();
    return { conn, viem, publicClient };
  } catch (err) {
    if (process.env.ATTENDANCE_LIVE_DEBUG === "1") {
      console.error("[Attendance.live] connect failed:", err);
    }
    return null;
  }
}

describe("Attendance (live, forked Celo)", async function () {
  const ready = await tryConnect();

  if (ready === null) {
    it("skipped: local anvil fork is not reachable on 127.0.0.1:8545", { skip: true }, () => {});
    return;
  }

  if (whale === undefined) {
    it("skipped: GPBR_WHALE env var not set", { skip: true }, () => {});
    return;
  }

  const { viem, publicClient } = ready;
  const testClient = await viem.getTestClient({ mode: "anvil" });
  const [owner, user] = await viem.getWalletClients();

  // Bypass Hardhat's local-accounts handler by talking to anvil directly.
  const rawAnvil = createWalletClient({ transport: http("http://127.0.0.1:8545") });

  async function seedGpbr(to: `0x${string}`, value: bigint) {
    await testClient.impersonateAccount({ address: whale! });
    await testClient.setBalance({ address: whale!, value: 10n ** 18n });

    const data = encodeFunctionData({
      abi: erc20Abi,
      functionName: "transfer",
      args: [to, value],
    });
    const hash = await rawAnvil.request({
      method: "eth_sendTransaction",
      params: [{ from: whale!, to: GPBR_ADDRESS, data }],
    });
    await publicClient.waitForTransactionReceipt({ hash });

    await testClient.stopImpersonatingAccount({ address: whale! });
  }

  it("whale impersonation funds the owner with GPBR", async () => {
    const whaleBalance = await publicClient.readContract({
      address: GPBR_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [whale!],
    });
    assert.ok(
      whaleBalance >= POOL_AMOUNT,
      `whale balance ${whaleBalance} < ${POOL_AMOUNT}; pick another GPBR_WHALE`,
    );

    const before = await publicClient.readContract({
      address: GPBR_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [owner.account.address],
    });

    await seedGpbr(owner.account.address, POOL_AMOUNT);

    const after = await publicClient.readContract({
      address: GPBR_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [owner.account.address],
    });

    assert.equal(after - before, POOL_AMOUNT);
  });

  it("full happy path: deploy, fund, createDistribution, claim, withdraw", async () => {
    const attendance = await viem.deployContract("Attendance", [
      GPBR_ADDRESS,
      owner.account.address,
    ]);

    const ownerGpbrBalance = await publicClient.readContract({
      address: GPBR_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [owner.account.address],
    });
    if (ownerGpbrBalance < POOL_AMOUNT) {
      await seedGpbr(owner.account.address, POOL_AMOUNT - ownerGpbrBalance);
    }

    const fundHash = await owner.writeContract({
      address: GPBR_ADDRESS,
      abi: erc20Abi,
      functionName: "transfer",
      args: [attendance.address, POOL_AMOUNT],
    });
    await publicClient.waitForTransactionReceipt({ hash: fundHash });

    assert.equal(
      await publicClient.readContract({
        address: GPBR_ADDRESS,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [attendance.address],
      }),
      POOL_AMOUNT,
    );

    await attendance.write.createDistribution();
    assert.equal(await attendance.read.distributionsCount(), 1n);
    assert.equal(await attendance.read.isActive([0n]), true);

    const userBefore = await publicClient.readContract({
      address: GPBR_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [user.account.address],
    });

    const attendanceAsUser = await viem.getContractAt(
      "Attendance",
      attendance.address,
      { client: { wallet: user } },
    );
    await attendanceAsUser.write.claim([0n]);

    const userAfter = await publicClient.readContract({
      address: GPBR_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [user.account.address],
    });

    assert.equal(userAfter - userBefore, CLAIM_AMOUNT);
    assert.equal(
      await attendance.read.hasClaimed([0n, getAddress(user.account.address)]),
      true,
    );

    await viem.assertions.revertWithCustomError(
      attendanceAsUser.write.claim([0n]),
      attendance,
      "AlreadyClaimed",
    );

    const ownerBefore = await publicClient.readContract({
      address: GPBR_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [owner.account.address],
    });
    const remaining = await publicClient.readContract({
      address: GPBR_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [attendance.address],
    });
    await attendance.write.withdraw([remaining]);
    const ownerAfter = await publicClient.readContract({
      address: GPBR_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [owner.account.address],
    });
    assert.equal(ownerAfter - ownerBefore, remaining);
  });

  it("expired distributions are not claimable", async () => {
    const attendance = await viem.deployContract("Attendance", [
      GPBR_ADDRESS,
      owner.account.address,
    ]);
    await attendance.write.setConfig([CLAIM_AMOUNT, 5n]);
    await attendance.write.createDistribution();

    await testClient.mine({ blocks: 6 });

    assert.equal(await attendance.read.isActive([0n]), false);

    const attendanceAsUser = await viem.getContractAt(
      "Attendance",
      attendance.address,
      { client: { wallet: user } },
    );
    await viem.assertions.revertWithCustomError(
      attendanceAsUser.write.claim([0n]),
      attendance,
      "NotActive",
    );
  });
});
