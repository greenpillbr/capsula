"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/create-distribution", label: "Create Distribution" },
  { href: "/claim", label: "Claim" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link href="/claim" className="flex items-center gap-3">
          <Image
            src="/logo-capsule.png"
            alt="Capsule"
            width={120}
            height={40}
            className="h-10 w-auto"
            priority
          />
          <span className="text-sm font-semibold text-[#00122E]">Admin</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-4">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors ${
                pathname === href
                  ? "text-green-600"
                  : "text-gray-600 hover:text-green-600"
              }`}
            >
              {label}
            </Link>
          ))}
          <ConnectButton chainStatus="icon" showBalance={false} />
        </nav>
      </div>
    </header>
  );
}
