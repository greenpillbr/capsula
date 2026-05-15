import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable, defineConfig } from "hardhat/config";

const DEFAULT_ANVIL_KEYS = [
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
] as const;
const localPrivateKey = (process.env.LOCAL_PRIVATE_KEY ?? DEFAULT_ANVIL_KEYS[0]) as `0x${string}`;
const localUserKey = (process.env.LOCAL_USER_PRIVATE_KEY ?? DEFAULT_ANVIL_KEYS[1]) as `0x${string}`;

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
    localFork: {
      type: "http",
      chainType: "l1",
      url: "http://127.0.0.1:8545",
      accounts: [localPrivateKey, localUserKey],
    },
    celo: {
      type: "http",
      chainType: "l1",
      url: configVariable("CELO_RPC_URL"),
      accounts: [configVariable("CELO_PRIVATE_KEY")],
    },
  },
});
