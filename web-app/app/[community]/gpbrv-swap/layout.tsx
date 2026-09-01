import { notFound } from "next/navigation";

import { SwapTabs } from "@/app/[community]/gpbrv-swap/SwapTabs";
import { getCommunity, hasFeature } from "@/lib/communities";
import { getServerTranslations } from "@/lib/i18n/server";

export default async function GpbrvSwapLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ community: string }>;
}) {
  const { community } = await params;
  const config = getCommunity(community);
  if (!config || !hasFeature(config, "swap")) notFound();

  const { t } = await getServerTranslations();
  const base = `/${config.slug}/gpbrv-swap`;

  const tabs = [
    { href: `${base}/deposit`, label: t("gpbrvSwap.tabSwapDeposit") },
    { href: `${base}/withdraw`, label: t("gpbrvSwap.tabSwapWithdraw") },
    { href: `${base}/configure`, label: t("gpbrvSwap.tabConfigure") },
    {
      href: `${base}/minipay/deposit`,
      label: t("gpbrvSwap.tabMinipay"),
      matchPrefix: `${base}/minipay`,
    },
  ];

  return (
    <div className="space-y-6">
      <SwapTabs tabs={tabs} />
      {children}
    </div>
  );
}
