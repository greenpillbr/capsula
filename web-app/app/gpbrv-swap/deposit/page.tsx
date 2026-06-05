import { Panel } from "@/app/gpbrv-swap/Panel";
import { SwapForm } from "@/app/gpbrv-swap/SwapForm";
import { isGpbrvSwapEnabled } from "@/lib/contracts";
import { getServerTranslations } from "@/lib/i18n/server";

export default async function GpbrvDepositPage() {
  const { t } = await getServerTranslations();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#00122E]">
        {t("gpbrvSwap.depositTitle")}
      </h1>
      {isGpbrvSwapEnabled() ? (
        <SwapForm mode="deposit" />
      ) : (
        <Panel>
          <p className="text-amber-700">{t("gpbrvSwap.featureDisabled")}</p>
        </Panel>
      )}
    </div>
  );
}
