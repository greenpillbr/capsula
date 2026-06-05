import { erc20Abi } from "viem";

import { connect, requireAddressEnv, requireEnv } from "./_shared.js";

const { viem, publicClient, networkName } = await connect();

const swapperAddress = requireAddressEnv("GPBRV_SWAPPER_ADDRESS");
const amount = BigInt(requireEnv("AMOUNT")); // USDM (18 decimals)
const minGpbrvOut = BigInt(process.env.MIN_GPBRV_OUT ?? "0"); // GPBRV (6 decimals)

const wallets = await viem.getWalletClients();
const minipayIndex = Number(process.env.MINIPAY_INDEX ?? "1");
const minipay = wallets[minipayIndex];
if (minipay === undefined) {
  throw new Error(`MINIPAY_INDEX=${minipayIndex} is out of range (only ${wallets.length} wallet(s))`);
}

const swapper = await viem.getContractAt("GPBRVSwapper", swapperAddress, {
  client: { wallet: minipay },
});

const gpbrv = (await swapper.read.gpbrv()) as `0x${string}`;
const usdm = (await swapper.read.usdm()) as `0x${string}`;
const user = (await swapper.read.minipayToUser([minipay.account.address])) as `0x${string}`;

console.log(`[${networkName}] minipay: ${minipay.account.address}`);
console.log(`[${networkName}] deposit(amount=${amount}, minGpbrvOut=${minGpbrvOut}) -> user ${user}`);

const approveHash = await minipay.writeContract({
  address: usdm,
  abi: erc20Abi,
  functionName: "approve",
  args: [swapperAddress, amount],
});
await publicClient.waitForTransactionReceipt({ hash: approveHash });

const userBefore = await publicClient.readContract({
  address: gpbrv,
  abi: erc20Abi,
  functionName: "balanceOf",
  args: [user],
});

const hash = await swapper.write.deposit([amount, minGpbrvOut]);
const receipt = await publicClient.waitForTransactionReceipt({ hash });
console.log(`tx mined in block ${receipt.blockNumber}: ${hash}`);

const userAfter = await publicClient.readContract({
  address: gpbrv,
  abi: erc20Abi,
  functionName: "balanceOf",
  args: [user],
});
console.log(`user received: ${userAfter - userBefore} GPBRV units (balance now ${userAfter})`);
