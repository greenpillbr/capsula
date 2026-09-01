import Link from "next/link";
import { notFound } from "next/navigation";

import { DistributorAdmin } from "@/app/[community]/distributor-admin/DistributorAdmin";
import { NotDeployedNotice } from "@/components/NotDeployedNotice";
import { getCommunity, hasFeature } from "@/lib/communities";
import { getServerTranslations } from "@/lib/i18n/server";

export default async function RedeemAdminPage({
  params,
}: {
  params: Promise<{ community: string }>;
}) {
  const { community } = await params;
  const config = getCommunity(community);
  if (!config || !hasFeature(config, "redeem")) notFound();

  const { t } = await getServerTranslations();
  const distributor = config.contracts.redeem;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/${config.slug}/resgatar`}
          className="text-sm text-gray-600 underline-offset-4 hover:underline"
        >
          ← {t("resgatar.title")}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-[#00122E]">
          {t("nav.configure")}
        </h1>
      </div>

      {distributor ? (
        <DistributorAdmin
          distributor={distributor}
          fundDescriptionKey="createDistribution.fundDescriptionGoodDollar"
        />
      ) : (
        <NotDeployedNotice message={t("community.notDeployed")} />
      )}
    </div>
  );
}
