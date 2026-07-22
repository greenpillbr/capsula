import { MinipayDepositForm } from "@/app/gpbrv-swap/MinipayDepositForm";
import { Panel } from "@/app/gpbrv-swap/Panel";
import { isGpbrvSwapEnabled } from "@/lib/contracts";
import { getServerTranslations } from "@/lib/i18n/server";

export default async function GpbrvMinipayDepositPage() {
  const { t } = await getServerTranslations();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#00122E]">
        {t("gpbrvSwap.depositTitle")}
      </h1>
      {isGpbrvSwapEnabled() ? (
        <MinipayDepositForm />
      ) : (
        <Panel>
          <p className="text-amber-700">{t("gpbrvSwap.featureDisabled")}</p>
        </Panel>
      )}
    </div>
  );
}
