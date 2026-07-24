import { connect, requireAddressEnv } from "./_shared.js";

const { viem, publicClient, networkName } = await connect();

const swapperAddress = requireAddressEnv("GPBRV_SWAPPER_ADDRESS");
const user = requireAddressEnv("CONFIGURE_USER");

const wallets = await viem.getWalletClients();
const minipayIndex = Number(process.env.MINIPAY_INDEX ?? "1");
const minipay = wallets[minipayIndex];
if (minipay === undefined) {
  throw new Error(`MINIPAY_INDEX=${minipayIndex} is out of range (only ${wallets.length} wallet(s))`);
}

const swapper = await viem.getContractAt("GPBRVSwapper", swapperAddress, {
  client: { wallet: minipay },
});

console.log(`[${networkName}] caller (minipay): ${minipay.account.address}`);
console.log(`[${networkName}] configureFromMinipay(user=${user})`);

const hash = await swapper.write.configureFromMinipay([user]);
const receipt = await publicClient.waitForTransactionReceipt({ hash });
console.log(`tx mined in block ${receipt.blockNumber}: ${hash}`);

console.log(`userToMinipay: ${await swapper.read.userToMinipay([user])}`);
console.log(`minipayToUser: ${await swapper.read.minipayToUser([minipay.account.address])}`);
