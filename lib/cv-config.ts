import type { Locale } from "@/lib/translations";

export const DEFAULT_CV_DRIVE_FOLDER_ID = "1bJCtxUvKqcBN3RusNny1vc9pUe7iTW3e";

export const DEFAULT_CV_DRIVE_FILE_ID_EN = "1Xpnldj1iiPXvPUueS6VPYemPXagUHEfJ";

const DEFAULT_DRIVE_FILENAMES: Record<Locale, string> = {
  pt: "CV Fabio Daros.pdf",
  en: "Resume_Fabio_Daros.pdf",
};

export function getCvDriveFolderId(): string {
  return process.env.GOOGLE_DRIVE_CV_FOLDER_ID?.trim() || DEFAULT_CV_DRIVE_FOLDER_ID;
}

export function getCvDriveFilename(locale: Locale): string {
  const fromEnv = locale === "pt" ? process.env.CV_DRIVE_FILENAME_PT : process.env.CV_DRIVE_FILENAME_EN;
  const trimmed = fromEnv?.trim();
  return trimmed || DEFAULT_DRIVE_FILENAMES[locale];
}

export function getGoogleDriveApiKey(): string | undefined {
  return process.env.GOOGLE_DRIVE_API_KEY?.trim() || undefined;
}

export function getCvDriveFileId(locale: Locale): string | undefined {
  const fromEnv =
    locale === "pt" ? process.env.GOOGLE_DRIVE_FILE_ID_PT : process.env.GOOGLE_DRIVE_FILE_ID_EN;
  const trimmed = fromEnv?.trim();
  if (trimmed) return trimmed;
  if (locale === "en") return DEFAULT_CV_DRIVE_FILE_ID_EN;
  return undefined;
}
