"use client";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { WagmiProvider } from "wagmi";

import { LanguageProvider, useTranslation } from "@/lib/i18n/LanguageProvider";
import { toRainbowKitLocale } from "@/lib/i18n";
import { wagmiConfig } from "@/lib/wagmi";

import "@rainbow-me/rainbowkit/styles.css";

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
          <RainbowKitWithLocale>{children}</RainbowKitWithLocale>
        </LanguageProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
