import { ExternalLinkIcon } from "lucide-react";

import { HomeSection } from "@/components/HomeSection";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { TranslationKey } from "@/lib/i18n/types";
import { getServerTranslations } from "@/lib/i18n/server";

const MEET_URL = "https://meet.google.com/ryu-jyok-sqm";

const RESOURCES: { labelKey: TranslationKey; href: string }[] = [
  {
    labelKey: "home.resources.onboarding",
    href: "https://usebalaio.com",
  },
  {
    labelKey: "home.resources.gardens",
    href: "https://app.gardens.fund/gardens/42220/0x2eb49e06ba584079ef797ecf2118f73f6527adb4",
  },
  {
    labelKey: "home.resources.voucherPool",
    href: "https://sarafu.network/pools/0x195C3A7F88a0cc3cce1f39a83A334E8Cfbd6Aa6A",
  },
  {
    labelKey: "home.resources.liquidityPool",
    href: "https://sarafu.network/pools/0xD12F1aE0C018210d18F6cB01cD6c7bd669eF7529",
  },
];

export default async function Home() {
  const { t } = await getServerTranslations();

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-10 py-12">
        <HomeSection title={t("home.title")} headingLevel="h1">
          <p>{t("home.intro")}</p>
        </HomeSection>

        <HomeSection title={t("home.participate.title")} headingLevel="h2">
        <p>{t("home.participate.time")}</p>
        <p>
          {t("home.participate.meetLabel")}{" "}
          <a
            href={MEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            {MEET_URL.replace("https://", "")}
          </a>
        </p>
        </HomeSection>
      </div>

      <Separator />

      <section className="py-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">{t("home.resources.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {RESOURCES.map((resource) => (
                <li key={resource.href}>
                  <a
                    href={resource.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-muted"
                  >
                    <span className="font-medium">{t(resource.labelKey)}</span>
                    <ExternalLinkIcon className="size-4 shrink-0 text-muted-foreground" />
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
