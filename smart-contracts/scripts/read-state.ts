import { erc20Abi, getAddress, isAddress } from "viem";

import { connect, requireAddressEnv } from "./_shared.js";

const { viem, publicClient, networkName } = await connect();

const attendanceAddress = requireAddressEnv("ATTENDANCE_ADDRESS");
const attendance = await viem.getContractAt("Attendance", attendanceAddress);

const gpbrAddress = (await attendance.read.rewardToken()) as `0x${string}`;
const ownerAddress = (await attendance.read.owner()) as `0x${string}`;
const amount = await attendance.read.amount();
const period = await attendance.read.period();
const count = await attendance.read.distributionsCount();
const poolBalance = await publicClient.readContract({
  address: gpbrAddress,
  abi: erc20Abi,
  functionName: "balanceOf",  
  args: [attendanceAddress],
});

console.log(`[${networkName}] Attendance at ${attendanceAddress}`);
console.log(`  gpbr:                  ${gpbrAddress}`);
console.log(`  owner:                 ${ownerAddress}`);
console.log(`  amount (current cfg):  ${amount}`);
console.log(`  period (current cfg):  ${period}`);
console.log(`  pool balance:          ${poolBalance}`);
console.log(`  distributions:         ${count}`);

const checkUser = process.env.USER_ADDRESS;
const userAddr =
  checkUser !== undefined && isAddress(checkUser) ? getAddress(checkUser) : undefined;

for (let i = 0n; i < count; i++) {
  const d = await attendance.read.distributions([i]);
  const active = await attendance.read.isActive([i]);
  console.log(`  [#${i}] amount=${d.amount} start=${d.startBlock} end=${d.endBlock} active=${active}`);
  if (userAddr !== undefined) {
    const claimed = await attendance.read.hasClaimed([i, userAddr]);
    console.log(`        claimed(${userAddr}): ${claimed}`);
  }
}
