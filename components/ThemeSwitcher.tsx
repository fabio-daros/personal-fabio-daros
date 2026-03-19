"use client";

import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { locale } = useLanguage();
  const t = translations[locale].nav;

  return (
    <div className="theme-switcher d-flex align-items-center gap-1">
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`theme-btn ${theme === "dark" ? "active" : ""}`}
        aria-label={t.themeDark}
      >
        <i className="bi bi-moon" />
      </button>
      <span className="theme-separator">|</span>
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`theme-btn ${theme === "light" ? "active" : ""}`}
        aria-label={t.themeLight}
      >
        <i className="bi bi-sun" />
      </button>
    </div>
  );
}
