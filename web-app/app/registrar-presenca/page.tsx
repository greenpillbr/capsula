import { ClaimForm } from "@/app/claim/ClaimForm";
import { GPBR_DISTRIBUTOR } from "@/lib/contracts";
import { getServerTranslations } from "@/lib/i18n/server";

export default async function RegistrarPresencaPage() {
  const { t } = await getServerTranslations();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#00122E]">
        {t("registerAttendance.title")}
      </h1>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="mb-4 text-sm text-gray-600">
          {t("registerAttendance.description")}
        </p>
        <ClaimForm
          distributor={GPBR_DISTRIBUTOR}
          translationPrefix="registerAttendance"
        />
      </section>
    </div>
  );
}
