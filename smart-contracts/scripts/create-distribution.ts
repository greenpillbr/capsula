import { decodeEventLog } from "viem";

import { connect, requireAddressEnv } from "./_shared.js";

const { viem, publicClient, defaultWallet, networkName } = await connect();

const attendanceAddress = requireAddressEnv("ATTENDANCE_ADDRESS");
const maxClaimers = BigInt(process.env.MAX_CLAIMERS ?? "0");

const attendance = await viem.getContractAt("TokenDistributor", attendanceAddress);

console.log(`[${networkName}] caller: ${defaultWallet.account.address}`);
console.log(`[${networkName}] creating distribution at ${attendanceAddress}`);
console.log(`[${networkName}] maxClaimers: ${maxClaimers} (0 = unlimited)`);

const hash = await attendance.write.createDistribution([maxClaimers]);
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
      const { id, endBlock, amount, maxClaimers: max } = decoded.args as {
        id: bigint;
        endBlock: bigint;
        amount: bigint;
        maxClaimers: bigint;
      };
      console.log(`DistributionCreated:`);
      console.log(`  id:           ${id}`);
      console.log(`  amount:       ${amount}`);
      console.log(`  endBlock:     ${endBlock}`);
      console.log(`  maxClaimers:  ${max}`);
    }
  } catch {
    // ignore non-matching logs
  }
}

console.log(`total distributions: ${await attendance.read.distributionsCount()}`);
