import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";

import { Providers } from "@/components/Providers";
import { translations } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// MiniPay is a mobile in-app browser; pin the viewport so the swap pages render at
// device width instead of a desktop-sized canvas.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = translations[locale];

  return {
    title: t["meta.title"],
    description: t["meta.description"],
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();

  return (
    <html lang={locale} className={`${geistSans.variable} h-full`}>
      <head>
        <meta name="talentapp:project_verification" content="d4a687caadb48f873943a77e976b6a2dd685bd627427e6c0e4f7613e373791b37d5c2a202ad8575a5a9fd42741ceee30b8e1a38b89b62b7dd6896ab6cadffc87" />
      </head>
      <body className="min-h-dvh bg-white font-sans text-[#00122E] antialiased">
        {/* Chrome (header/main/footer) is rendered by `AppShell` further down the
            tree, where the active community is known. */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
