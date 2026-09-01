import {
  GOOD_DOLLAR_DISTRIBUTOR,
  GPBRV_SWAPPER_ADDRESS,
  GPBR_DISTRIBUTOR,
  type DistributorToken,
} from "@/lib/contracts";
import type { TranslationKey } from "@/lib/i18n/types";

/**
 * Instance configuration for the multi-tenant web-app. Every community is one
 * entry in `COMMUNITIES`; adding a third one is a data change, not a code change.
 *
 * This module is imported from both server and client components, so it must stay
 * free of `next/headers` and other server-only imports.
 */

export const COMMUNITY_FEATURES = [
  "attendance",
  "redeem",
  "swap",
  "tools",
] as const;

export type CommunityFeature = (typeof COMMUNITY_FEATURES)[number];

/** Features that map to a page; `tools` is a header dropdown of external links. */
export type CommunityPageFeature = Exclude<CommunityFeature, "tools">;

export type CommunityToolLink = {
  href: string;
  labelKey: TranslationKey;
  tooltipKey: TranslationKey;
};

export type CommunityResource = {
  labelKey: TranslationKey;
  href: string;
};

export type CommunityConfig = {
  /** URL segment: `/{slug}/registrar-presenca`. */
  slug: string;
  /** Brand name — deliberately not translated. */
  name: string;
  /** Logo path under `public/`. */
  logo: string;
  descriptionKey: TranslationKey;
  features: readonly CommunityFeature[];
  contracts: {
    /** `null` until the community's distributor is deployed. */
    attendance: DistributorToken | null;
    redeem: DistributorToken | null;
    swapper: `0x${string}` | null;
  };
  home: {
    introKey: TranslationKey;
    /** Recurring community call; the participate block is hidden without it. */
    meetUrl?: string;
    resources: CommunityResource[];
  };
  tools: CommunityToolLink[];
};

export const COMMUNITIES: Record<string, CommunityConfig> = {
  greenpillbr: {
    slug: "greenpillbr",
    name: "GreenPillBR",
    logo: "/communities/greenpillbr.png",
    descriptionKey: "community.greenpillbr.description",
    features: ["attendance", "redeem", "swap", "tools"],
    contracts: {
      attendance: GPBR_DISTRIBUTOR,
      redeem: GOOD_DOLLAR_DISTRIBUTOR,
      swapper: GPBRV_SWAPPER_ADDRESS,
    },
    home: {
      introKey: "community.greenpillbr.intro",
      meetUrl: "https://meet.google.com/ryu-jyok-sqm",
      resources: [
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
      ],
    },
    tools: [
      {
        href: "https://empatictech.vercel.app/",
        labelKey: "nav.empaticTech",
        tooltipKey: "nav.empaticTechTooltip",
      },
    ],
  },
  cooperativista: {
    slug: "cooperativista",
    name: "Cooperativista",
    logo: "/communities/cooperativista.png",
    descriptionKey: "community.cooperativista.description",
    features: [],
    contracts: {
      attendance: null,
      redeem: null,
      swapper: null,
    },
    home: {
      introKey: "community.cooperativista.intro",
      resources: [],
    },
    tools: [],
  },
};

export const COMMUNITY_SLUGS = Object.keys(COMMUNITIES);

/** Community the un-prefixed legacy URLs redirect to (see `next.config.ts`). */
export const DEFAULT_COMMUNITY_SLUG = "greenpillbr";

/**
 * Nav entry per page feature. The header builds its links from this and the
 * route segments below it are gated on the same feature, so the two cannot drift.
 */
export const FEATURE_NAV: Record<
  CommunityPageFeature,
  { segment: string; labelKey: TranslationKey }
> = {
  attendance: {
    segment: "registrar-presenca",
    labelKey: "nav.registerAttendance",
  },
  redeem: { segment: "resgatar", labelKey: "nav.claim" },
  swap: { segment: "gpbrv-swap/configure", labelKey: "nav.gpbrvSwap" },
};

export function getCommunity(slug: string): CommunityConfig | undefined {
  return COMMUNITIES[slug];
}

export function hasFeature(
  community: CommunityConfig,
  feature: CommunityFeature,
): boolean {
  return community.features.includes(feature);
}

/** First path segment, when it names a known community. */
export function communitySlugFromPathname(
  pathname: string,
): string | undefined {
  const slug = pathname.split("/")[1];
  return slug && slug in COMMUNITIES ? slug : undefined;
}
