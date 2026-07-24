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
    { href: "/gpbrv-swap/configure", label: t("gpbrvSwap.tabConfigure") },
    { href: "/gpbrv-swap/minipay/deposit", label: t("gpbrvSwap.tabMinipay") },
  ];

  return (
    <div className="space-y-6">
      {/* Bleeds to the viewport edges so the tab row can scroll on a phone. */}
      <nav className="-mx-4 flex gap-1 overflow-x-auto border-b border-gray-200 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map(({ href, label }) => {
          const active =
            href === "/gpbrv-swap/minipay/deposit"
              ? pathname.startsWith("/gpbrv-swap/minipay")
              : pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
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
