import { Panel } from "@/app/gpbrv-swap/Panel";
import { DirectSwapForm } from "@/app/gpbrv-swap/DirectSwapForm";
import { isGpbrvSwapEnabled } from "@/lib/contracts";
import { getServerTranslations } from "@/lib/i18n/server";

export default async function GpbrvSwapDepositPage() {
  const { t } = await getServerTranslations();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#00122E]">
        {t("gpbrvSwap.swapDepositTitle")}
      </h1>
      {isGpbrvSwapEnabled() ? (
        <DirectSwapForm mode="deposit" />
      ) : (
        <Panel>
          <p className="text-amber-700">{t("gpbrvSwap.featureDisabled")}</p>
        </Panel>
      )}
    </div>
  );
}
