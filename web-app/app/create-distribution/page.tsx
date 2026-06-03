import { CreateDistributionPageClient } from "@/app/create-distribution/CreateDistributionPageClient";
import { getServerTranslations } from "@/lib/i18n/server";

export default async function CreateDistributionPage() {
  const { t } = await getServerTranslations();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#00122E]">
        {t("createDistribution.title")}
      </h1>
      <CreateDistributionPageClient />
    </div>
  );
}
