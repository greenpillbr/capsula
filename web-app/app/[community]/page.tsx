import { ExternalLinkIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { HomeSection } from "@/components/HomeSection";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getCommunity } from "@/lib/communities";
import { getServerTranslations } from "@/lib/i18n/server";

export default async function CommunityHome({
  params,
}: {
  params: Promise<{ community: string }>;
}) {
  const { community } = await params;
  const config = getCommunity(community);
  if (!config) notFound();

  const { t } = await getServerTranslations();
  const { meetUrl, resources } = config.home;

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-10 py-12">
        <div className="flex flex-col items-center gap-4">
          <Image
            src={config.logo}
            alt={config.name}
            width={96}
            height={96}
            className="size-24 rounded-full object-cover"
            priority
          />
          <HomeSection title={config.name} headingLevel="h1">
            <p>{t(config.home.introKey)}</p>
          </HomeSection>
        </div>

        {meetUrl && (
          <HomeSection title={t("home.participate.title")} headingLevel="h2">
            <p>{t("home.participate.time")}</p>
            <p>
              {t("home.participate.meetLabel")}{" "}
              <a
                href={meetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                {meetUrl.replace("https://", "")}
              </a>
            </p>
          </HomeSection>
        )}
      </div>

      {resources.length > 0 && (
        <>
          <Separator />

          <section className="py-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold">
                  {t("home.resources.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-2">
                  {resources.map((resource) => (
                    <li key={resource.href}>
                      <a
                        href={resource.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-muted"
                      >
                        <span className="font-medium">
                          {t(resource.labelKey)}
                        </span>
                        <ExternalLinkIcon className="size-4 shrink-0 text-muted-foreground" />
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>
        </>
      )}

      <div className="flex justify-center py-8">
        <Link
          href="/"
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
        >
          {t("home.switchCommunity")}
        </Link>
      </div>
    </div>
  );
}
