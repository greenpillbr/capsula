"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = {
  href: string;
  label: string;
  /** Match the whole sub-tree instead of the exact path (MiniPay has sub-pages). */
  matchPrefix?: string;
};

export function SwapTabs({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname();

  return (
    /* Bleeds to the viewport edges so the tab row can scroll on a phone. */
    <nav className="-mx-4 flex gap-1 overflow-x-auto border-b border-gray-200 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map(({ href, label, matchPrefix }) => {
        const active = matchPrefix
          ? pathname.startsWith(matchPrefix)
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
  );
}
