"use client";

import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { locale } = useLanguage();
  const t = translations[locale].nav;
  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-switcher theme-btn header-control-tip"
      aria-label={isDark ? t.themeSwitchToLight : t.themeSwitchToDark}
      data-tooltip={isDark ? t.themeSwitchToLight : t.themeSwitchToDark}
    >
      <i className={`bi ${isDark ? "bi-sun" : "bi-moon"}`} aria-hidden="true" />
    </button>
  );
}
