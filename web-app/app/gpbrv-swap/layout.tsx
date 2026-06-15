"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useTranslation } from "@/lib/i18n/LanguageProvider";

export default function GpbrvSwapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const tabs = [
    { href: "/gpbrv-swap/swap-deposit", label: t("gpbrvSwap.tabSwapDeposit") },
    { href: "/gpbrv-swap/swap-withdraw", label: t("gpbrvSwap.tabSwapWithdraw") },
    { href: "/gpbrv-swap/deposit", label: t("gpbrvSwap.tabDeposit") },
    { href: "/gpbrv-swap/withdraw", label: t("gpbrvSwap.tabWithdraw") },
    { href: "/gpbrv-swap/configure", label: t("gpbrvSwap.tabConfigure") },
  ];

  return (
    <div className="space-y-6">
      <nav className="flex gap-1 border-b border-gray-200">
        {tabs.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-600 hover:text-green-600"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
