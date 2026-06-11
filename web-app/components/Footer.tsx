import { getServerTranslations } from "@/lib/i18n/server";

const RADUKE_URL = "https://raduke.tech";

export async function Footer() {
  const { t } = await getServerTranslations();

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white py-3">
      <div className="mx-auto max-w-2xl px-4 text-center text-sm text-gray-500">
        {t("footer.developedByPrefix")}{" "}
        <a
          href={RADUKE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-gray-600 transition-colors hover:text-green-600"
        >
          Raduke.tech
        </a>
      </div>
    </footer>
  );
}
