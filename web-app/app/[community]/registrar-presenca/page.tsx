import { notFound } from "next/navigation";

import { ClaimForm } from "@/app/claim/ClaimForm";
import { NotDeployedNotice } from "@/components/NotDeployedNotice";
import { SettingsGearLink } from "@/components/SettingsGearLink";
import { getCommunity, hasFeature } from "@/lib/communities";
import { getServerTranslations } from "@/lib/i18n/server";

export default async function RegistrarPresencaPage({
  params,
}: {
  params: Promise<{ community: string }>;
}) {
  const { community } = await params;
  const config = getCommunity(community);
  if (!config || !hasFeature(config, "attendance")) notFound();

  const { t } = await getServerTranslations();
  const distributor = config.contracts.attendance;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-[#00122E]">
          {t("registerAttendance.title")}
        </h1>
        <SettingsGearLink
          href={`/${config.slug}/registrar-presenca/configurar`}
          label={t("nav.configure")}
        />
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="mb-4 text-sm text-gray-600">
          {t("registerAttendance.description")}
        </p>
        {distributor ? (
          <ClaimForm
            distributor={distributor}
            translationPrefix="registerAttendance"
          />
        ) : (
          <NotDeployedNotice message={t("community.notDeployed")} />
        )}
      </section>
    </div>
  );
}
