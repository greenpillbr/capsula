import { getServerTranslations } from "@/lib/i18n/server";

export default async function Home() {
  const { t } = await getServerTranslations();

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
      <p className="max-w-lg text-lg leading-relaxed text-[#00122E]">
        {t("home.intro")}
      </p>
    </div>
  );
}
