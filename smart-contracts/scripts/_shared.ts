import { network } from "hardhat";
import type { Address } from "viem";

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export function requireAddressEnv(name: string): Address {
  const v = requireEnv(name);
  if (!/^0x[0-9a-fA-F]{40}$/.test(v)) {
    throw new Error(`${name} is not a valid 0x-prefixed address`);
  }
  return v as Address;
}

export async function connect() {
  const networkName = process.env.NETWORK ?? "localFork";
  const conn = await network.create({ network: networkName, chainType: "l1" });
  const viem = conn.viem;
  const publicClient = await viem.getPublicClient();
  const [defaultWallet] = await viem.getWalletClients();
  return { conn, viem, publicClient, defaultWallet, networkName };
}
