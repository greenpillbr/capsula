import { ConfigureSwap } from "@/app/gpbrv-swap/configure/ConfigureSwap";
import { getServerTranslations } from "@/lib/i18n/server";

export default async function GpbrvConfigurePage() {
  const { t } = await getServerTranslations();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#00122E]">
        {t("gpbrvSwap.configureTitle")}
      </h1>
      <ConfigureSwap />
    </div>
  );
}
