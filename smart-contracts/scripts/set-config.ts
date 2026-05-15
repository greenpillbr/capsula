import { connect, requireAddressEnv, requireEnv } from "./_shared.js";

const { viem, publicClient, defaultWallet, networkName } = await connect();

const attendanceAddress = requireAddressEnv("ATTENDANCE_ADDRESS");
const newAmount = BigInt(requireEnv("AMOUNT"));
const newPeriod = BigInt(requireEnv("PERIOD"));

const attendance = await viem.getContractAt("Attendance", attendanceAddress);

console.log(`[${networkName}] caller: ${defaultWallet.account.address}`);
console.log(`[${networkName}] setConfig(amount=${newAmount}, period=${newPeriod})`);

const hash = await attendance.write.setConfig([newAmount, newPeriod]);
const receipt = await publicClient.waitForTransactionReceipt({ hash });
console.log(`tx mined in block ${receipt.blockNumber}: ${hash}`);

console.log(`current amount: ${await attendance.read.amount()}`);
console.log(`current period: ${await attendance.read.period()}`);
