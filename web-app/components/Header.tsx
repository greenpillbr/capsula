"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BR, US } from "country-flag-icons/react/3x2";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HiOutlineCog6Tooth } from "react-icons/hi2";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import type { Locale } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

type NavLabel = {
  href: string;
  label: string;
};

type ToolsItem = {
  href: string;
  label: string;
  tooltip: string;
};

const navLinkClass = (active: boolean) =>
  `text-base font-semibold transition-colors ${
    active ? "text-green-600" : "text-gray-600 hover:text-green-600"
  }`;

function ToolsMenu({
  toolsMenuLabel,
  toolsItems,
}: {
  toolsMenuLabel: string;
  toolsItems: ToolsItem[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className={cn("h-auto px-0", navLinkClass(false))}
          />
        }
      >
        {toolsMenuLabel}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-auto min-w-max">
        <DropdownMenuGroup>
          {toolsItems.map(({ href, label, tooltip }) => (
            <Tooltip key={href}>
              <TooltipTrigger
                render={
                  <DropdownMenuItem
                    render={
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                    className="whitespace-nowrap"
                  />
                }
              >
                {label}
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="flex flex-col gap-1">
                  <p className="whitespace-nowrap">{label}</p>
                  <p className="text-background/80">{tooltip}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SettingsMenu({
  settingsLabels,
  isSettingsActive,
  pathname,
  router,
  settingsMenuLabel,
}: {
  settingsLabels: NavLabel[];
  isSettingsActive: boolean;
  pathname: string;
  router: ReturnType<typeof useRouter>;
  settingsMenuLabel: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className={navLinkClass(isSettingsActive)}
            aria-label={settingsMenuLabel}
          />
        }
      >
        <HiOutlineCog6Tooth className="size-5" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          {settingsLabels.map(({ href, label }) => (
            <DropdownMenuItem
              key={href}
              className={pathname === href ? "text-green-600" : undefined}
              onClick={() => router.push(href)}
            >
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LanguageToggle() {
  const { locale, setLocale } = useTranslation();

  return (
    <div
      className="flex rounded-lg border border-gray-200 text-xs font-medium"
      role="group"
      aria-label="Language"
    >
      {(["pt-BR", "en"] as Locale[]).map((loc) => {
        const Flag = loc === "pt-BR" ? BR : US;
        return (
          <button
            key={loc}
            type="button"
            onClick={() => setLocale(loc)}
            aria-label={loc === "pt-BR" ? "Português (Brasil)" : "English"}
            aria-pressed={locale === loc}
            className={`flex items-center px-2 py-1.5 transition-colors first:rounded-l-lg last:rounded-r-lg ${
              locale === loc
                ? "bg-green-600"
                : "opacity-50 hover:bg-gray-50 hover:opacity-100"
            }`}
          >
            <Flag className="h-4 w-6 rounded-sm" title={loc === "pt-BR" ? "Brasil" : "United States"} />
          </button>
        );
      })}
    </div>
  );
}

export function Header({
  navLabels,
  settingsLabels,
  toolsMenuLabel,
  toolsItems,
}: {
  navLabels: NavLabel[];
  settingsLabels: NavLabel[];
  toolsMenuLabel: string;
  toolsItems: ToolsItem[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const isSettingsActive = settingsLabels.some(({ href }) => pathname === href);

  const settingsMenu = (
    <SettingsMenu
      settingsLabels={settingsLabels}
      isSettingsActive={isSettingsActive}
      pathname={pathname}
      router={router}
      settingsMenuLabel={t("nav.settingsMenu")}
    />
  );

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 md:max-w-5xl md:flex-row md:items-center md:justify-between md:flex-nowrap lg:max-w-6xl">
        <div className="flex items-center justify-between gap-4 md:justify-start">
          <div className="flex flex-wrap items-center gap-4 lg:flex-nowrap">
            <Link href="/" className="flex items-center gap-3" aria-label={t("nav.home")}>
              <Image
                src="/logo-capsule.png"
                alt="Capsula"
                width={150}
                height={50}
                className="h-20 w-auto"
                priority
              />
            </Link>
            <nav className="flex flex-wrap items-center gap-4 lg:flex-nowrap">
              {navLabels.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={navLinkClass(pathname === href)}
                >
                  {label}
                </Link>
              ))}
              <ToolsMenu toolsMenuLabel={toolsMenuLabel} toolsItems={toolsItems} />
            </nav>
          </div>
          <div className="shrink-0 md:hidden">{settingsMenu}</div>
        </div>
        <div className="flex w-full items-center justify-center gap-4 md:w-auto md:justify-end">
          <div className="hidden shrink-0 md:block">{settingsMenu}</div>
          <LanguageToggle />
          <ConnectButton chainStatus="icon" showBalance={false} />
        </div>
      </div>
    </header>
  );
}
