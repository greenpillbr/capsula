import { notFound } from "next/navigation";

import { MinipayGate } from "@/app/[community]/gpbrv-swap/minipay/MinipayGate";
import { getCommunity, hasFeature } from "@/lib/communities";

export default async function GpbrvSwapMinipayLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ community: string }>;
}) {
  const { community } = await params;
  const config = getCommunity(community);
  if (!config || !hasFeature(config, "swap")) notFound();

  return (
    <MinipayGate
      communitySlug={config.slug}
      swapper={config.contracts.swapper ?? undefined}
    >
      {children}
    </MinipayGate>
  );
}
