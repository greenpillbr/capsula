import { erc20Abi } from "viem";

import { connect, requireAddressEnv, requireEnv } from "./_shared.js";

const { viem, publicClient, networkName } = await connect();

const swapperAddress = requireAddressEnv("GPBRV_SWAPPER_ADDRESS");
const amount = BigInt(requireEnv("AMOUNT")); // GPBRV (6 decimals)
const minStableOut = BigInt(process.env.MIN_STABLE_OUT ?? process.env.MIN_USDM_OUT ?? "0");

const wallets = await viem.getWalletClients();
const userIndex = Number(process.env.USER_INDEX ?? "0");
const user = wallets[userIndex];
if (user === undefined) {
  throw new Error(`USER_INDEX=${userIndex} is out of range (only ${wallets.length} wallet(s))`);
}

const swapper = await viem.getContractAt("GPBRVSwapper", swapperAddress, {
  client: { wallet: user },
});

const gpbrv = (await swapper.read.gpbrv()) as `0x${string}`;
const usdm = (await swapper.read.usdm()) as `0x${string}`;
// STABLE selects the output stablecoin (USDM, USDC, USDT); defaults to USDM.
const stable = (process.env.STABLE as `0x${string}` | undefined) ?? usdm;

console.log(`[${networkName}] account: ${user.account.address}`);
console.log(`[${networkName}] withdraw(amount=${amount}, minStableOut=${minStableOut}, stable=${stable}) -> same wallet`);

const approveHash = await user.writeContract({
  address: gpbrv,
  abi: erc20Abi,
  functionName: "approve",
  args: [swapperAddress, amount],
});
await publicClient.waitForTransactionReceipt({ hash: approveHash });

const before = await publicClient.readContract({
  address: stable,
  abi: erc20Abi,
  functionName: "balanceOf",
  args: [user.account.address],
});

const hash = await swapper.write.withdraw([amount, minStableOut, stable]);
const receipt = await publicClient.waitForTransactionReceipt({ hash });
console.log(`tx mined in block ${receipt.blockNumber}: ${hash}`);

const after = await publicClient.readContract({
  address: stable,
  abi: erc20Abi,
  functionName: "balanceOf",
  args: [user.account.address],
});
console.log(`received: ${after - before} stable units (balance now ${after})`);
