import Image from "next/image";
import Link from "next/link";

import { AppShell } from "@/components/AppShell";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { HomeSection } from "@/components/HomeSection";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { COMMUNITIES } from "@/lib/communities";
import { getServerTranslations } from "@/lib/i18n/server";

/**
 * Community selector. Everything below `/[community]` is scoped to one instance;
 * this page is the only one that is not, so it renders its own shell with a
 * community-less header.
 */
export default async function Home() {
  const { t } = await getServerTranslations();
  const communities = Object.values(COMMUNITIES);

  return (
    <AppShell header={<HeaderWrapper community={null} />}>
      <div className="flex flex-col">
        <div className="py-12">
          <HomeSection title={t("home.title")} headingLevel="h1">
            <p>{t("home.tagline")}</p>
          </HomeSection>
        </div>

        <section className="flex flex-col gap-6 pb-8">
          <h2 className="text-center text-xl font-semibold">
            {t("home.selectCommunity")}
          </h2>

          <ul className="grid gap-4 sm:grid-cols-2">
            {communities.map((community) => (
              <li key={community.slug}>
                <Link
                  href={`/${community.slug}`}
                  className="block h-full rounded-xl transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <Card className="h-full bg-transparent">
                    <CardHeader className="justify-items-center gap-3 text-center">
                      <Image
                        src={community.logo}
                        alt={community.name}
                        width={80}
                        height={80}
                        className="size-20 rounded-full object-cover"
                      />
                      <CardTitle className="text-lg">
                        {community.name}
                      </CardTitle>
                      <CardDescription>
                        {t(community.descriptionKey)}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
