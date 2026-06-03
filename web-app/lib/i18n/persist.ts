import { STORAGE_KEY, type Locale } from "./types";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function persistLocale(locale: Locale) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.lang = locale;
  localStorage.setItem(STORAGE_KEY, locale);
  document.cookie = `${STORAGE_KEY}=${encodeURIComponent(locale)};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`;
}
