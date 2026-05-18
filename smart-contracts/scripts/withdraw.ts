import { erc20Abi } from "viem";

import { connect, requireAddressEnv, requireEnv } from "./_shared.js";

const { viem, publicClient, defaultWallet, networkName } = await connect();

const attendanceAddress = requireAddressEnv("ATTENDANCE_ADDRESS");
const amount = BigInt(requireEnv("AMOUNT"));

const attendance = await viem.getContractAt("Attendance", attendanceAddress);
const gpbrAddress = (await attendance.read.rewardToken()) as `0x${string}`;

console.log(`[${networkName}] owner: ${defaultWallet.account.address}`);
console.log(`[${networkName}] withdraw(${amount}) <- ${attendanceAddress}`);

const before = await publicClient.readContract({
  address: gpbrAddress,
  abi: erc20Abi,
  functionName: "balanceOf",
  args: [defaultWallet.account.address],
});

const hash = await attendance.write.withdraw([amount]);
const receipt = await publicClient.waitForTransactionReceipt({ hash });
console.log(`tx mined in block ${receipt.blockNumber}: ${hash}`);

const after = await publicClient.readContract({
  address: gpbrAddress,
  abi: erc20Abi,
  functionName: "balanceOf",
  args: [defaultWallet.account.address],
});
console.log(`owner received: ${after - before} GPBR units (owner balance now ${after})`);

const poolBalance = await publicClient.readContract({
  address: gpbrAddress,
  abi: erc20Abi,
  functionName: "balanceOf",
  args: [attendanceAddress],
});
console.log(`pool balance: ${poolBalance}`);
