import { Configure } from "@/app/configure/Configure";
import { GPBR_DISTRIBUTOR } from "@/lib/contracts";
import { getServerTranslations } from "@/lib/i18n/server";

export default async function ConfigureGpbrPage() {
  const { t } = await getServerTranslations();

  return (
    <>
      <h1 className="text-2xl font-semibold text-[#00122E]">
        {t("configure.title")}
      </h1>
      <Configure distributor={GPBR_DISTRIBUTOR} />
    </>
  );
}
