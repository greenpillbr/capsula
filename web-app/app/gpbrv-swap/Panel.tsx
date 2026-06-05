export function Panel({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {title && (
        <h2 className="mb-4 text-lg font-medium text-[#00122E]">{title}</h2>
      )}
      {children}
    </section>
  );
}
