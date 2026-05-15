import { erc20Abi } from "viem";

import { connect, requireAddressEnv, requireEnv } from "./_shared.js";

const { viem, publicClient, defaultWallet, networkName } = await connect();

const attendanceAddress = requireAddressEnv("ATTENDANCE_ADDRESS");
const amount = BigInt(requireEnv("AMOUNT"));

const attendance = await viem.getContractAt("Attendance", attendanceAddress);
const gpbrAddress = (await attendance.read.gpbr()) as `0x${string}`;

console.log(`[${networkName}] sender: ${defaultWallet.account.address}`);
console.log(`[${networkName}] gpbr:   ${gpbrAddress}`);
console.log(`[${networkName}] transferring ${amount} GPBR units -> ${attendanceAddress}`);

const hash = await defaultWallet.writeContract({
  address: gpbrAddress,
  abi: erc20Abi,
  functionName: "transfer",
  args: [attendanceAddress, amount],
});
const receipt = await publicClient.waitForTransactionReceipt({ hash });
console.log(`tx mined in block ${receipt.blockNumber}: ${hash}`);

const poolBalance = await publicClient.readContract({
  address: gpbrAddress,
  abi: erc20Abi,
  functionName: "balanceOf",
  args: [attendanceAddress],
});
console.log(`pool balance: ${poolBalance}`);
