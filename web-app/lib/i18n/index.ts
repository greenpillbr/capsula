import { en } from "./en";
import { ptBR } from "./pt-BR";
import {
  DEFAULT_LOCALE,
  LOCALES,
  STORAGE_KEY,
  type Locale,
  type TranslationKey,
  type Translations,
} from "./types";

export const translations: Record<Locale, Translations> = {
  "pt-BR": ptBR,
  en,
};

function getCookieLocale(): Locale | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${STORAGE_KEY}=([^;]*)`),
  );
  if (!match) {
    return null;
  }
  const value = decodeURIComponent(match[1]);
  if (value === "pt-BR" || value === "en") {
    return value;
  }
  return null;
}

export function detectLocale(): Locale {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "pt-BR" || stored === "en") {
    return stored;
  }

  const fromCookie = getCookieLocale();
  if (fromCookie) {
    return fromCookie;
  }

  const browserLang = navigator.language?.toLowerCase() ?? "";
  if (browserLang.startsWith("en")) {
    return "en";
  }

  return DEFAULT_LOCALE;
}

export function toRainbowKitLocale(locale: Locale): "pt-BR" | "en-US" {
  return locale === "en" ? "en-US" : "pt-BR";
}

export {
  DEFAULT_LOCALE,
  LOCALES,
  STORAGE_KEY,
  type Locale,
  type TranslationKey,
  type Translations,
};
