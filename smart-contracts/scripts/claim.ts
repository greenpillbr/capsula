import { erc20Abi } from "viem";

import { connect, requireAddressEnv, requireEnv } from "./_shared.js";

const { viem, publicClient, defaultWallet, networkName } = await connect();

const attendanceAddress = requireAddressEnv("ATTENDANCE_ADDRESS");
const distributionId = BigInt(requireEnv("DISTRIBUTION_ID"));

const wallets = await viem.getWalletClients();
const userIndex = Number(process.env.USER_INDEX ?? "0");
const user = wallets[userIndex];
if (user === undefined) {
  throw new Error(
    `USER_INDEX=${userIndex} is out of range (only ${wallets.length} wallet(s) configured)`,
  );
}

const attendance = await viem.getContractAt("Attendance", attendanceAddress, {
  client: { wallet: user },
});
const gpbrAddress = (await attendance.read.gpbr()) as `0x${string}`;

console.log(`[${networkName}] claimer: ${user.account.address}`);
console.log(`[${networkName}] claim(${distributionId}) -> ${attendanceAddress}`);

const before = await publicClient.readContract({
  address: gpbrAddress,
  abi: erc20Abi,
  functionName: "balanceOf",
  args: [user.account.address],
});

const hash = await attendance.write.claim([distributionId]);
const receipt = await publicClient.waitForTransactionReceipt({ hash });
console.log(`tx mined in block ${receipt.blockNumber}: ${hash}`);

const after = await publicClient.readContract({
  address: gpbrAddress,
  abi: erc20Abi,
  functionName: "balanceOf",
  args: [user.account.address],
});
console.log(`received: ${after - before} GPBR units (balance now ${after})`);
void defaultWallet;
