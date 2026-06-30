import { CreateDistributionPageClient } from "@/app/create-distribution/CreateDistributionPageClient";
import { GOOD_DOLLAR_DISTRIBUTOR } from "@/lib/contracts";
import { getServerTranslations } from "@/lib/i18n/server";

export default async function CreateDistributionGoodDollarPage() {
  const { t } = await getServerTranslations();

  return (
    <>
      <h1 className="text-2xl font-semibold text-[#00122E]">
        {t("createDistribution.title")}
      </h1>
      <CreateDistributionPageClient
        distributor={GOOD_DOLLAR_DISTRIBUTOR}
        fundDescriptionKey="createDistribution.fundDescriptionGoodDollar"
      />
    </>
  );
}
