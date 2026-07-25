import type { ReactNode } from "react";

import { Footer } from "@/components/Footer";

/**
 * Page chrome around the routed content. It lives below the root layout because
 * the header needs the active community, which only the `[community]` segment
 * knows — the root layout cannot read a nested segment's params.
 */
export function AppShell({
  header,
  children,
}: {
  header: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      {header}
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 min-h-[calc(100dvh-10rem)]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
