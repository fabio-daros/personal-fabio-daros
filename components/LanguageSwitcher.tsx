"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="language-switcher d-flex align-items-center gap-1">
      <button
        type="button"
        onClick={() => setLocale("pt")}
        className={`lang-btn ${locale === "pt" ? "active" : ""}`}
        aria-label="Português"
      >
        PT
      </button>
      <span className="lang-separator">|</span>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`lang-btn ${locale === "en" ? "active" : ""}`}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
}
