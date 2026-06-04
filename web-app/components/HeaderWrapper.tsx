import { Header } from "@/components/Header";
import { getServerTranslations } from "@/lib/i18n/server";
import type { TranslationKey } from "@/lib/i18n/types";

const navLinks: { href: string; labelKey: TranslationKey }[] = [
  { href: "/claim", labelKey: "nav.claim" },
];

const settingsLinks: { href: string; labelKey: TranslationKey }[] = [
  { href: "/create-distribution", labelKey: "nav.createDistribution" },
  { href: "/configure", labelKey: "nav.configure" },
];

export async function HeaderWrapper() {
  const { t } = await getServerTranslations();
  const navLabels = navLinks.map(({ href, labelKey }) => ({
    href,
    label: t(labelKey),
  }));
  const settingsLabels = settingsLinks.map(({ href, labelKey }) => ({
    href,
    label: t(labelKey),
  }));

  return <Header navLabels={navLabels} settingsLabels={settingsLabels} />;
}
