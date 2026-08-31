import { Header } from "@/components/Header";
import {
  FEATURE_NAV,
  hasFeature,
  type CommunityConfig,
  type CommunityPageFeature,
} from "@/lib/communities";
import { getServerTranslations } from "@/lib/i18n/server";

/** Nav order; each entry only renders when the community enables that feature. */
const PAGE_FEATURES: CommunityPageFeature[] = ["attendance", "redeem", "swap"];

/**
 * Resolves the nav for the active community. `community` is `null` on the
 * community selector (`/`), where there is nothing to navigate within yet.
 */
export async function HeaderWrapper({
  community,
}: {
  community: CommunityConfig | null;
}) {
  const { t } = await getServerTranslations();

  const navLabels = community
    ? PAGE_FEATURES.filter((feature) => hasFeature(community, feature)).map(
        (feature) => ({
          href: `/${community.slug}/${FEATURE_NAV[feature].segment}`,
          label: t(FEATURE_NAV[feature].labelKey),
        }),
      )
    : [];

  const toolsItems =
    community && hasFeature(community, "tools")
      ? community.tools.map(({ href, labelKey, tooltipKey }) => ({
          href,
          label: t(labelKey),
          tooltip: t(tooltipKey),
        }))
      : [];

  return (
    <Header
      navLabels={navLabels}
      toolsMenuLabel={t("nav.tools")}
      toolsItems={toolsItems}
    />
  );
}
