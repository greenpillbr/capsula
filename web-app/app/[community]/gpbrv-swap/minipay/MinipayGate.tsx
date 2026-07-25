"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";

import { Panel } from "@/components/Panel";
import { ZERO_ADDRESS, gpbrvSwapperAbi } from "@/lib/contracts";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { useIsMiniPay } from "@/lib/useIsMiniPay";

const SUB_TABS = [
  { segment: "deposit", labelKey: "gpbrvSwap.minipayTabDeposit" },
  { segment: "configure", labelKey: "gpbrvSwap.minipayTabConfigure" },
] as const;

function SubNav({ communitySlug }: { communitySlug: string }) {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav className="flex rounded-lg bg-gray-100 p-1" aria-label="MiniPay">
      {SUB_TABS.map(({ segment, labelKey }) => {
        const href = `/${communitySlug}/gpbrv-swap/minipay/${segment}`;
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex-1 rounded-md px-3 py-2 text-center text-sm font-medium transition-colors ${
              active
                ? "bg-white text-green-600 shadow-sm"
                : "text-gray-600 hover:text-green-600"
            }`}
          >
            {t(labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * The MiniPay sub-section only works from inside the MiniPay in-app browser, where the
 * connected wallet *is* the MiniPay wallet. Outside it we explain how to get there and,
 * when the wallet has no link yet, point at the main-wallet Configure page.
 */
export function MinipayGate({
  children,
  communitySlug,
  swapper,
}: {
  children: React.ReactNode;
  communitySlug: string;
  swapper: `0x${string}` | undefined;
}) {
  const { t } = useTranslation();
  const { address } = useAccount();
  const isMiniPay = useIsMiniPay();
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const { data: linkedMinipay } = useReadContract({
    address: swapper,
    abi: gpbrvSwapperAbi,
    functionName: "userToMinipay",
    args: address ? [address] : undefined,
    query: { enabled: !!swapper && !!address && isMiniPay === false },
  });

  // `undefined` means detection has not run yet — render the page rather than
  // flashing the fallback at everyone on first paint.
  if (isMiniPay !== false) {
    return (
      <div className="space-y-6">
        <SubNav communitySlug={communitySlug} />
        {children}
      </div>
    );
  }

  const isLinked = !!linkedMinipay && linkedMinipay !== ZERO_ADDRESS;

  return (
    <div className="space-y-6">
      <SubNav communitySlug={communitySlug} />
      <Panel title={t("gpbrvSwap.openInMinipayTitle")}>
        {!isLinked && (
          <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
            <p className="mb-2">{t("gpbrvSwap.openInMinipayConfigureCta")}</p>
            <Link
              href={`/${communitySlug}/gpbrv-swap/configure`}
              className="font-medium text-green-600 underline underline-offset-2"
            >
              {t("gpbrvSwap.openInMinipayConfigureLink")}
            </Link>
          </div>
        )}

        <p className="mb-3 text-sm text-gray-600">
          {t("gpbrvSwap.openInMinipayBody")}
        </p>

        {currentUrl && (
          <p className="break-all rounded-lg bg-gray-50 p-3 font-mono text-xs text-gray-600">
            {currentUrl}
          </p>
        )}
      </Panel>
    </div>
  );
}
