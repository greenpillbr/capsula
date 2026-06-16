import type { ReactNode } from "react";

export function HomeSection({
  title,
  children,
  headingLevel = "h2",
}: {
  title: string;
  children: ReactNode;
  headingLevel?: "h1" | "h2";
}) {
  const Heading = headingLevel;

  return (
    <section className="flex flex-col items-center gap-4 text-center">
      <Heading className="max-w-lg text-2xl font-semibold text-foreground">
        {title}
      </Heading>
      <div className="flex max-w-lg flex-col gap-2 text-lg leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}
