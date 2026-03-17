"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Locale } from "@/lib/translations";

const STORAGE_KEY = "site-locale";

const LanguageContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
} | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored === "pt" || stored === "en") {
      setLocaleState(stored);
    } else {
      // Detect browser language when no preference saved
      const browserLang = navigator.language || (navigator.languages?.[0] ?? "en");
      const prefersPt = browserLang.toLowerCase().startsWith("pt");
      setLocaleState(prefersPt ? "pt" : "en");
    }
    setMounted(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.documentElement.lang = newLocale === "pt" ? "pt-BR" : "en";
    }
  };

  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = locale === "pt" ? "pt-BR" : "en";
    }
  }, [locale, mounted]);

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
