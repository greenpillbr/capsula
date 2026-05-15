import { decodeEventLog } from "viem";

import { connect, requireAddressEnv } from "./_shared.js";

const { viem, publicClient, defaultWallet, networkName } = await connect();

const attendanceAddress = requireAddressEnv("ATTENDANCE_ADDRESS");
const attendance = await viem.getContractAt("Attendance", attendanceAddress);

console.log(`[${networkName}] caller: ${defaultWallet.account.address}`);
console.log(`[${networkName}] creating distribution at ${attendanceAddress}`);

const hash = await attendance.write.createDistribution();
const receipt = await publicClient.waitForTransactionReceipt({ hash });
console.log(`tx mined in block ${receipt.blockNumber}: ${hash}`);

for (const log of receipt.logs) {
  if (log.address.toLowerCase() !== attendanceAddress.toLowerCase()) continue;
  try {
    const decoded = decodeEventLog({
      abi: attendance.abi,
      data: log.data,
      topics: log.topics,
    });
    if (decoded.eventName === "DistributionCreated") {
      const { id, endBlock, amount } = decoded.args as {
        id: bigint;
        endBlock: bigint;
        amount: bigint;
      };
      console.log(`DistributionCreated:`);
      console.log(`  id:        ${id}`);
      console.log(`  amount:    ${amount}`);
      console.log(`  endBlock:  ${endBlock}`);
    }
  } catch {
    // ignore non-matching logs
  }
}

console.log(`total distributions: ${await attendance.read.distributionsCount()}`);
