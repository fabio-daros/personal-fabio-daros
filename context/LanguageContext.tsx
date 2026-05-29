"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Locale } from "@/lib/translations";
import {
  LOCALE_STORAGE_KEY,
  localeToHtmlLang,
  persistLocaleClient,
} from "@/lib/locale";

const LanguageContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
} | null>(null);

type LanguageProviderProps = {
  children: React.ReactNode;
  initialLocale: Locale;
};

export function LanguageProvider({ children, initialLocale }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    const resolved: Locale =
      stored === "pt" || stored === "en" ? stored : initialLocale;

    if (resolved !== locale) {
      setLocaleState(resolved);
    }

    persistLocaleClient(resolved);
    // Sync once on mount; user changes go through setLocale.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    persistLocaleClient(newLocale);
  };

  useEffect(() => {
    document.documentElement.lang = localeToHtmlLang(locale);
    document.documentElement.dataset.locale = locale;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
