import { connect, requireAddressEnv, requireEnv } from "./_shared.js";

const { viem, publicClient, defaultWallet, networkName } = await connect();

const attendanceAddress = requireAddressEnv("ATTENDANCE_ADDRESS");
const distributionId = BigInt(requireEnv("DISTRIBUTION_ID"));

const attendance = await viem.getContractAt("TokenDistributor", attendanceAddress);

console.log(`[${networkName}] caller: ${defaultWallet.account.address}`);
console.log(`[${networkName}] cancelDistribution(${distributionId}) at ${attendanceAddress}`);

const hash = await attendance.write.cancelDistribution([distributionId]);
const receipt = await publicClient.waitForTransactionReceipt({ hash });
console.log(`tx mined in block ${receipt.blockNumber}: ${hash}`);

console.log(`isActive(${distributionId}): ${await attendance.read.isActive([distributionId])}`);
