"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HiOutlineCog6Tooth } from "react-icons/hi2";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import type { Locale } from "@/lib/i18n/types";

type NavLabel = {
  href: string;
  label: string;
};

const navLinkClass = (active: boolean) =>
  `text-sm font-medium transition-colors ${
    active ? "text-green-600" : "text-gray-600 hover:text-green-600"
  }`;

export function Header({
  navLabels,
  settingsLabels,
}: {
  navLabels: NavLabel[];
  settingsLabels: NavLabel[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, setLocale, t } = useTranslation();
  const isSettingsActive = settingsLabels.some(({ href }) => pathname === href);

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/" className="flex items-center gap-3" aria-label={t("nav.home")}>
            <Image
              src="/logo-capsule.png"
              alt="Capsula"
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>
          <nav className="flex flex-wrap items-center gap-4">
            {navLabels.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={navLinkClass(pathname === href)}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className={navLinkClass(isSettingsActive)}
                  aria-label={t("nav.settingsMenu")}
                />
              }
            >
              <HiOutlineCog6Tooth className="size-5" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {settingsLabels.map(({ href, label }) => (
                <DropdownMenuItem
                  key={href}
                  className={pathname === href ? "text-green-600" : undefined}
                  onClick={() => router.push(href)}
                >
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div
            className="flex rounded-lg border border-gray-200 text-xs font-medium"
            role="group"
            aria-label="Language"
          >
            {(["pt-BR", "en"] as Locale[]).map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setLocale(loc)}
                className={`px-2 py-1 transition-colors first:rounded-l-lg last:rounded-r-lg ${
                  locale === loc
                    ? "bg-green-600 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {loc === "pt-BR" ? "PT" : "EN"}
              </button>
            ))}
          </div>
          <ConnectButton chainStatus="icon" showBalance={false} />
        </div>
      </div>
    </header>
  );
}
