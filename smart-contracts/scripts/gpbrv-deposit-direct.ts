import { erc20Abi } from "viem";

import { connect, requireAddressEnv, requireEnv } from "./_shared.js";

const { viem, publicClient, networkName } = await connect();

const swapperAddress = requireAddressEnv("GPBRV_SWAPPER_ADDRESS");
const amount = BigInt(requireEnv("AMOUNT")); // USDM (18 decimals)
const minGpbrvOut = BigInt(process.env.MIN_GPBRV_OUT ?? "0"); // GPBRV (6 decimals)

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

console.log(`[${networkName}] account: ${user.account.address}`);
console.log(`[${networkName}] deposit(amount=${amount}, minGpbrvOut=${minGpbrvOut}) -> same wallet`);

const approveHash = await user.writeContract({
  address: usdm,
  abi: erc20Abi,
  functionName: "approve",
  args: [swapperAddress, amount],
});
await publicClient.waitForTransactionReceipt({ hash: approveHash });

const before = await publicClient.readContract({
  address: gpbrv,
  abi: erc20Abi,
  functionName: "balanceOf",
  args: [user.account.address],
});

const hash = await swapper.write.deposit([amount, minGpbrvOut]);
const receipt = await publicClient.waitForTransactionReceipt({ hash });
console.log(`tx mined in block ${receipt.blockNumber}: ${hash}`);

const after = await publicClient.readContract({
  address: gpbrv,
  abi: erc20Abi,
  functionName: "balanceOf",
  args: [user.account.address],
});
console.log(`received: ${after - before} GPBRV units (balance now ${after})`);
