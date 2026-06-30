import { getAddress } from "viem";

import { connect, requireAddressEnv, requireEnv } from "./_shared.js";

const { viem, publicClient, defaultWallet, networkName } = await connect();

const attendanceAddress = requireAddressEnv("ATTENDANCE_ADDRESS");
const action = requireEnv("ACTION");
const account = getAddress(requireAddressEnv("ACCOUNT"));

const attendance = await viem.getContractAt("TokenDistributor", attendanceAddress);

console.log(`[${networkName}] owner: ${defaultWallet.account.address}`);
console.log(`[${networkName}] ${action} creator ${account} on ${attendanceAddress}`);

let hash: `0x${string}`;
if (action === "add") {
  hash = await attendance.write.addCreator([account]);
} else if (action === "remove") {
  hash = await attendance.write.removeCreator([account]);
} else {
  throw new Error(`ACTION must be "add" or "remove", got: ${action}`);
}

const receipt = await publicClient.waitForTransactionReceipt({ hash });
console.log(`tx mined in block ${receipt.blockNumber}: ${hash}`);
console.log(`isCreator(${account}): ${await attendance.read.isCreator([account])}`);
