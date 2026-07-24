"use client";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { WagmiProvider, useAccount, useConnect } from "wagmi";

import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider, useTranslation } from "@/lib/i18n/LanguageProvider";
import { toRainbowKitLocale } from "@/lib/i18n";
import { useIsMiniPay } from "@/lib/useIsMiniPay";
import { wagmiConfig } from "@/lib/wagmi";

import "@rainbow-me/rainbowkit/styles.css";

/**
 * Inside MiniPay the wallet connection is implicit — connect the injected connector
 * as soon as we detect it, so no user gesture is needed.
 */
function MiniPayAutoConnect() {
  const isMiniPay = useIsMiniPay();
  const { isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();

  useEffect(() => {
    if (!isMiniPay || isConnected || isConnecting) return;
    const injected = connectors.find((c) => c.id === "injected");
    if (injected) connect({ connector: injected });
  }, [isMiniPay, isConnected, isConnecting, connect, connectors]);

  return null;
}

function RainbowKitWithLocale({ children }: { children: React.ReactNode }) {
  const { locale } = useTranslation();

  return (
    <RainbowKitProvider locale={toRainbowKitLocale(locale)}>
      {children}
    </RainbowKitProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <TooltipProvider>
            <RainbowKitWithLocale>
              <MiniPayAutoConnect />
              {children}
            </RainbowKitWithLocale>
          </TooltipProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
