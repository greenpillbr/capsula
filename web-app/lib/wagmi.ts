import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { celo } from "wagmi/chains";
import { fallback, http } from "wagmi";

// Default behavior: hit public forno first, then NEXT_PUBLIC_CELO_RPC_URL (if set) as a
// fallback. When NEXT_PUBLIC_CELO_ANVIL is set, NEXT_PUBLIC_CELO_RPC_URL becomes the
// primary transport instead (e.g. http://127.0.0.1:8545) so local testing hits the fork.
const rpcUrl = process.env.NEXT_PUBLIC_CELO_RPC_URL?.trim();
const useAnvilOverride = !!process.env.NEXT_PUBLIC_CELO_ANVIL?.trim() && !!rpcUrl;

let celoTransports;
if (useAnvilOverride) {
  celoTransports = [http(rpcUrl), http("https://forno.celo.org")];
} else {
  celoTransports = [http("https://forno.celo.org")];
  if (rpcUrl) {
    celoTransports.push(http(rpcUrl));
  }
}

export const wagmiConfig = getDefaultConfig({
  appName: "Capsule Admin",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
  chains: [celo],
  transports: {
    [celo.id]: fallback(celoTransports),
  },
  ssr: true,
});
