import { notFound } from "next/navigation";

import { DirectSwapForm } from "@/app/[community]/gpbrv-swap/DirectSwapForm";
import { getCommunity, hasFeature } from "@/lib/communities";
import { getServerTranslations } from "@/lib/i18n/server";

export default async function GpbrvSwapDepositPage({
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
        {t("gpbrvSwap.swapDepositTitle")}
      </h1>
      <DirectSwapForm
        mode="deposit"
        swapper={config.contracts.swapper ?? undefined}
      />
    </div>
  );
}
