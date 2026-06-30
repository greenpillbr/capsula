import { CreateDistributionPageClient } from "@/app/create-distribution/CreateDistributionPageClient";
import { GPBR_DISTRIBUTOR } from "@/lib/contracts";
import { getServerTranslations } from "@/lib/i18n/server";

export default async function CreateDistributionGpbrPage() {
  const { t } = await getServerTranslations();

  return (
    <>
      <h1 className="text-2xl font-semibold text-[#00122E]">
        {t("createDistribution.title")}
      </h1>
      <CreateDistributionPageClient
        distributor={GPBR_DISTRIBUTOR}
        fundDescriptionKey="createDistribution.fundDescriptionGpbr"
      />
    </>
  );
}
