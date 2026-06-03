import { cookies, headers } from "next/headers";

import { translations } from "./index";
import {
  DEFAULT_LOCALE,
  STORAGE_KEY,
  type Locale,
  type TranslationKey,
} from "./types";

function localeFromAcceptLanguage(acceptLanguage: string): Locale {
  const primary = acceptLanguage.split(",")[0]?.trim().toLowerCase() ?? "";
  if (primary.startsWith("en")) {
    return "en";
  }
  return DEFAULT_LOCALE;
}

function parseLocale(value: string | undefined): Locale | null {
  if (value === "pt-BR" || value === "en") {
    return value;
  }
  return null;
}

export async function getRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const fromCookie = parseLocale(cookieStore.get(STORAGE_KEY)?.value);
  if (fromCookie) {
    return fromCookie;
  }

  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language") ?? "";
  return localeFromAcceptLanguage(acceptLanguage);
}

export async function getServerTranslations() {
  const locale = await getRequestLocale();
  const t = (key: TranslationKey) => translations[locale][key];
  return { locale, t };
}
