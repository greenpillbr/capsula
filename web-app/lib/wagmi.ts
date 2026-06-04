import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { celo } from "wagmi/chains";
import { fallback, http } from "wagmi";

const celoTransports = [http("https://forno.celo.org")];
const fallbackUrl = process.env.NEXT_PUBLIC_CELO_RPC_URL?.trim();
if (fallbackUrl) {
  celoTransports.push(http(fallbackUrl));
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
