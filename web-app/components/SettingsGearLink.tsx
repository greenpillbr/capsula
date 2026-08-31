import Link from "next/link";
import { HiOutlineCog6Tooth } from "react-icons/hi2";

/** Entry point from a feature page to its own admin page. */
export function SettingsGearLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="shrink-0 rounded-md p-1.5 text-gray-600 transition-colors hover:text-green-600"
    >
      <HiOutlineCog6Tooth className="size-5" aria-hidden />
    </Link>
  );
}
