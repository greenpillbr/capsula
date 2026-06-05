import { connect, requireAddressEnv } from "./_shared.js";

const { viem, publicClient, networkName } = await connect();

const swapperAddress = requireAddressEnv("GPBRV_SWAPPER_ADDRESS");
const minipay = requireAddressEnv("CONFIGURE_MINIPAY");

const wallets = await viem.getWalletClients();
const userIndex = Number(process.env.USER_INDEX ?? "0");
const user = wallets[userIndex];
if (user === undefined) {
  throw new Error(`USER_INDEX=${userIndex} is out of range (only ${wallets.length} wallet(s))`);
}

const swapper = await viem.getContractAt("GPBRVSwapper", swapperAddress, {
  client: { wallet: user },
});

console.log(`[${networkName}] caller: ${user.account.address}`);
console.log(`[${networkName}] configure(minipay=${minipay})`);

const hash = await swapper.write.configure([minipay]);
const receipt = await publicClient.waitForTransactionReceipt({ hash });
console.log(`tx mined in block ${receipt.blockNumber}: ${hash}`);

console.log(`userToMinipay: ${await swapper.read.userToMinipay([user.account.address])}`);
console.log(`minipayToUser: ${await swapper.read.minipayToUser([minipay])}`);
