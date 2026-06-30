import { ClaimForm } from "@/app/claim/ClaimForm";
import { GOOD_DOLLAR_DISTRIBUTOR } from "@/lib/contracts";
import { getServerTranslations } from "@/lib/i18n/server";

export default async function ResgatarPage() {
  const { t } = await getServerTranslations();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#00122E]">
        {t("resgatar.title")}
      </h1>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="mb-4 text-sm text-gray-600">{t("resgatar.description")}</p>
        <ClaimForm
          distributor={GOOD_DOLLAR_DISTRIBUTOR}
          translationPrefix="resgatar"
        />
      </section>
    </div>
  );
}
