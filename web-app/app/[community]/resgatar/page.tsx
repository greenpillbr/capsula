import { notFound } from "next/navigation";

import { ClaimForm } from "@/app/claim/ClaimForm";
import { NotDeployedNotice } from "@/components/NotDeployedNotice";
import { SettingsGearLink } from "@/components/SettingsGearLink";
import { getCommunity, hasFeature } from "@/lib/communities";
import { getServerTranslations } from "@/lib/i18n/server";

export default async function ResgatarPage({
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
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-[#00122E]">
          {t("resgatar.title")}
        </h1>
        <SettingsGearLink
          href={`/${config.slug}/resgatar/configurar`}
          label={t("nav.configure")}
        />
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="mb-4 text-sm text-gray-600">{t("resgatar.description")}</p>
        {distributor ? (
          <ClaimForm distributor={distributor} translationPrefix="resgatar" />
        ) : (
          <NotDeployedNotice message={t("community.notDeployed")} />
        )}
      </section>
    </div>
  );
}
