import { Header } from "@/components/Header";
import { getServerTranslations } from "@/lib/i18n/server";
import type { TranslationKey } from "@/lib/i18n/types";

const navLinks: { href: string; labelKey: TranslationKey }[] = [
  { href: "/registrar-presenca", labelKey: "nav.registerAttendance" },
  { href: "/resgatar", labelKey: "nav.claim" },
  { href: "/gpbrv-swap/configure", labelKey: "nav.gpbrvSwap" },
];

const settingsLinks: { href: string; labelKey: TranslationKey }[] = [
  { href: "/create-distribution/gpbr", labelKey: "nav.createDistribution" },
  { href: "/configure/gpbr", labelKey: "nav.configure" },
];

const toolsLinks: {
  href: string;
  labelKey: TranslationKey;
  tooltipKey: TranslationKey;
}[] = [
  {
    href: "https://empatictech.vercel.app/",
    labelKey: "nav.empaticTech",
    tooltipKey: "nav.empaticTechTooltip",
  },
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
  const toolsItems = toolsLinks.map(({ href, labelKey, tooltipKey }) => ({
    href,
    label: t(labelKey),
    tooltip: t(tooltipKey),
  }));

  return (
    <Header
      navLabels={navLabels}
      settingsLabels={settingsLabels}
      toolsMenuLabel={t("nav.tools")}
      toolsItems={toolsItems}
    />
  );
}
