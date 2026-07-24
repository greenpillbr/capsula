import { ConfigureFromMinipay } from "@/app/gpbrv-swap/minipay/configure/ConfigureFromMinipay";
import { getServerTranslations } from "@/lib/i18n/server";

export default async function GpbrvMinipayConfigurePage() {
  const { t } = await getServerTranslations();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#00122E]">
        {t("gpbrvSwap.configureFromMinipayTitle")}
      </h1>
      <ConfigureFromMinipay />
    </div>
  );
}
