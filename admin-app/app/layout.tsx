import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { Header } from "@/components/Header";
import { Providers } from "@/components/Providers";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Capsule Admin",
  description: "Admin UI for Capsula Attendance distributions on Celo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <head>
        <meta name="talentapp:project_verification" content="d4a687caadb48f873943a77e976b6a2dd685bd627427e6c0e4f7613e373791b37d5c2a202ad8575a5a9fd42741ceee30b8e1a38b89b62b7dd6896ab6cadffc87" />
      </head>
      <body className="min-h-full bg-white font-sans text-[#00122E] antialiased">
        <Providers>
          <Header />
          <main className="mx-auto max-w-2xl px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
