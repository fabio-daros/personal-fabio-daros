import type { Locale } from "@/lib/translations";

const DEFAULT_CV_PATHS: Record<Locale, string> = {
  pt: "/assets/cv/fabio-daros-cv-pt.pdf",
  en: "/assets/cv/fabio-daros-cv-en.pdf",
};

const CV_FILENAMES: Record<Locale, string> = {
  pt: "Fabio-Daros-CV-PT.pdf",
  en: "Fabio-Daros-CV-EN.pdf",
};

/** CV URL: `NEXT_PUBLIC_CV_URL_PT` / `NEXT_PUBLIC_CV_URL_EN`, or PDFs in `public/assets/cv/`. */
export function getCvDownloadUrl(locale: Locale): string {
  const fromEnv = locale === "pt" ? process.env.NEXT_PUBLIC_CV_URL_PT : process.env.NEXT_PUBLIC_CV_URL_EN;
  const trimmed = fromEnv?.trim();
  if (trimmed) return trimmed;
  return DEFAULT_CV_PATHS[locale];
}

export function isExternalCvUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export function getCvDownloadFilename(locale: Locale): string {
  return CV_FILENAMES[locale];
}
