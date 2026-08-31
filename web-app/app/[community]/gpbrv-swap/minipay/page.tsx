import { redirect } from "next/navigation";

export default async function GpbrvSwapMinipayIndex({
  params,
}: {
  params: Promise<{ community: string }>;
}) {
  const { community } = await params;
  redirect(`/${community}/gpbrv-swap/minipay/deposit`);
}
