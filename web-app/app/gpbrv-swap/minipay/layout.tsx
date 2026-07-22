import { MinipayGate } from "@/app/gpbrv-swap/minipay/MinipayGate";

export default function GpbrvSwapMinipayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MinipayGate>{children}</MinipayGate>;
}
