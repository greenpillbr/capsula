import { notFound } from "next/navigation";

import { ConfigureSwap } from "@/app/[community]/gpbrv-swap/configure/ConfigureSwap";
import { getCommunity, hasFeature } from "@/lib/communities";
import { getServerTranslations } from "@/lib/i18n/server";

export default async function GpbrvConfigurePage({
  params,
}: {
  params: Promise<{ community: string }>;
}) {
  const { community } = await params;
  const config = getCommunity(community);
  if (!config || !hasFeature(config, "swap")) notFound();

  const { t } = await getServerTranslations();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#00122E]">
        {t("gpbrvSwap.configureTitle")}
      </h1>
      <ConfigureSwap swapper={config.contracts.swapper ?? undefined} />
    </div>
  );
}
