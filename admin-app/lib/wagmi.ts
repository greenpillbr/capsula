import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { celo } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "Capsule Admin",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
  chains: [celo],
  ssr: true,
});
