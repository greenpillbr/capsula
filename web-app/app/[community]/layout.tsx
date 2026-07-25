import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { COMMUNITY_SLUGS, getCommunity } from "@/lib/communities";
import { translations } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";

export function generateStaticParams() {
  return COMMUNITY_SLUGS.map((community) => ({ community }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ community: string }>;
}): Promise<Metadata> {
  const { community } = await params;
  const config = getCommunity(community);
  if (!config) return {};

  const locale = await getRequestLocale();
  const t = translations[locale];

  return {
    title: `${config.name} · ${t["meta.title"]}`,
    description: t[config.descriptionKey],
  };
}

export default async function CommunityLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ community: string }>;
}) {
  const { community } = await params;
  const config = getCommunity(community);
  if (!config) notFound();

  return (
    <AppShell header={<HeaderWrapper community={config} />}>{children}</AppShell>
  );
}
