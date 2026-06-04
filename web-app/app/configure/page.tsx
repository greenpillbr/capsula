import { Configure } from "@/app/configure/Configure";
import { getServerTranslations } from "@/lib/i18n/server";

export default async function ConfigurePage() {
  const { t } = await getServerTranslations();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#00122E]">{t("configure.title")}</h1>
      <Configure />
    </div>
  );
}
