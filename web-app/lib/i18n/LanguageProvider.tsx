"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import { detectLocale, translations } from "./index";
import { persistLocale } from "./persist";
import { DEFAULT_LOCALE, type Locale, type TranslationKey } from "./types";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getLocaleSnapshot(): Locale {
  return detectLocale();
}

function getServerLocaleSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

function subscribeLocale(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const detectedLocale = useSyncExternalStore(
    subscribeLocale,
    getLocaleSnapshot,
    getServerLocaleSnapshot,
  );
  const [manualLocale, setManualLocale] = useState<Locale | null>(null);

  const locale = manualLocale ?? detectedLocale;

  useEffect(() => {
    persistLocale(locale);
  }, [locale]);

  const setLocale = useCallback(
    (next: Locale) => {
      setManualLocale(next);
      persistLocale(next);
      router.refresh();
    },
    [router],
  );

  const t = useCallback(
    (key: TranslationKey) => translations[locale][key],
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within LanguageProvider");
  }
  return context;
}
