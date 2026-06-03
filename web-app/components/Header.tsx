import { HeaderClient } from "@/components/HeaderClient";
import { getServerTranslations } from "@/lib/i18n/server";
import type { TranslationKey } from "@/lib/i18n/types";

const navLinks: { href: string; labelKey: TranslationKey }[] = [
  { href: "/", labelKey: "nav.home" },
  { href: "/create-distribution", labelKey: "nav.createDistribution" },
  { href: "/claim", labelKey: "nav.claim" },
  { href: "/configure", labelKey: "nav.configure" },
];

export async function Header() {
  const { t } = await getServerTranslations();
  const navLabels = navLinks.map(({ href, labelKey }) => ({
    href,
    label: t(labelKey),
  }));

  return <HeaderClient navLabels={navLabels} />;
}
