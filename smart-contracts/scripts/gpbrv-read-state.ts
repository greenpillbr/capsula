import { getAddress, isAddress } from "viem";

import { connect, requireAddressEnv } from "./_shared.js";

const { viem, networkName } = await connect();

const swapperAddress = requireAddressEnv("GPBRV_SWAPPER_ADDRESS");
const swapper = await viem.getContractAt("GPBRVSwapper", swapperAddress);

console.log(`[${networkName}] GPBRVSwapper at ${swapperAddress}`);
console.log(`  gpbrv:        ${await swapper.read.gpbrv()}`);
console.log(`  brlm:         ${await swapper.read.brlm()}`);
console.log(`  usdm:         ${await swapper.read.usdm()}`);
console.log(`  sarafuPool:   ${await swapper.read.sarafuPool()}`);
console.log(`  mentoRouter:  ${await swapper.read.mentoRouter()}`);
console.log(`  mentoFactory: ${await swapper.read.mentoFactory()}`);

const address = process.env.ADDRESS;
if (address !== undefined && isAddress(address)) {
  const addr = getAddress(address);
  console.log(`  userToMinipay(${addr}): ${await swapper.read.userToMinipay([addr])}`);
  console.log(`  minipayToUser(${addr}): ${await swapper.read.minipayToUser([addr])}`);
}
