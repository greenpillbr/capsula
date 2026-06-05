import { erc20Abi } from "viem";

import { connect, requireAddressEnv, requireEnv } from "./_shared.js";

const { viem, publicClient, networkName } = await connect();

const swapperAddress = requireAddressEnv("GPBRV_SWAPPER_ADDRESS");
const amount = BigInt(requireEnv("AMOUNT")); // GPBRV (6 decimals)
const minUsdmOut = BigInt(process.env.MIN_USDM_OUT ?? "0"); // USDM (18 decimals)

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
const minipay = (await swapper.read.userToMinipay([user.account.address])) as `0x${string}`;

console.log(`[${networkName}] user: ${user.account.address}`);
console.log(`[${networkName}] withdraw(amount=${amount}, minUsdmOut=${minUsdmOut}) -> minipay ${minipay}`);

const approveHash = await user.writeContract({
  address: gpbrv,
  abi: erc20Abi,
  functionName: "approve",
  args: [swapperAddress, amount],
});
await publicClient.waitForTransactionReceipt({ hash: approveHash });

const minipayBefore = await publicClient.readContract({
  address: usdm,
  abi: erc20Abi,
  functionName: "balanceOf",
  args: [minipay],
});

const hash = await swapper.write.withdraw([amount, minUsdmOut]);
const receipt = await publicClient.waitForTransactionReceipt({ hash });
console.log(`tx mined in block ${receipt.blockNumber}: ${hash}`);

const minipayAfter = await publicClient.readContract({
  address: usdm,
  abi: erc20Abi,
  functionName: "balanceOf",
  args: [minipay],
});
console.log(`minipay received: ${minipayAfter - minipayBefore} USDM units (balance now ${minipayAfter})`);
