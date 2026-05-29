import type { Locale } from "@/lib/translations";

export const LOCALE_STORAGE_KEY = "site-locale";
export const LOCALE_COOKIE = "site-locale";

export function localeToHtmlLang(locale: Locale): string {
  return locale === "pt" ? "pt-BR" : "en";
}

export function resolveLocale(
  stored: string | null | undefined,
  acceptLanguage?: string | null,
): Locale {
  if (stored === "pt" || stored === "en") {
    return stored;
  }

  const primary =
    acceptLanguage?.split(",")[0]?.trim().toLowerCase() ??
    (typeof navigator !== "undefined"
      ? navigator.language || navigator.languages?.[0] || "en"
      : "en");

  return primary.startsWith("pt") ? "pt" : "en";
}

export function persistLocaleClient(locale: Locale) {
  if (typeof window === "undefined") return;

  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  document.documentElement.lang = localeToHtmlLang(locale);
  document.documentElement.dataset.locale = locale;
}
