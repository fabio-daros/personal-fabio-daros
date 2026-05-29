import type { Locale } from "@/lib/translations";

/** Default folder: https://drive.google.com/drive/folders/1bJCtxUvKqcBN3RusNny1vc9pUe7iTW3e */
export const DEFAULT_CV_DRIVE_FOLDER_ID = "1bJCtxUvKqcBN3RusNny1vc9pUe7iTW3e";

const DEFAULT_DRIVE_FILENAMES: Record<Locale, string> = {
  pt: "CV Fabio Daros.pdf",
  en: "Resume_Fabio_Daros.pdf",
};

export function getCvDriveFolderId(): string {
  return process.env.GOOGLE_DRIVE_CV_FOLDER_ID?.trim() || DEFAULT_CV_DRIVE_FOLDER_ID;
}

/** Exact PDF name as stored in the Drive folder (change via env without redeploying code). */
export function getCvDriveFilename(locale: Locale): string {
  const fromEnv = locale === "pt" ? process.env.CV_DRIVE_FILENAME_PT : process.env.CV_DRIVE_FILENAME_EN;
  const trimmed = fromEnv?.trim();
  return trimmed || DEFAULT_DRIVE_FILENAMES[locale];
}

export function getGoogleDriveApiKey(): string | undefined {
  return process.env.GOOGLE_DRIVE_API_KEY?.trim() || undefined;
}

/** Direct file ID from the Drive share URL (most reliable with API key). */
export function getCvDriveFileId(locale: Locale): string | undefined {
  const fromEnv =
    locale === "pt" ? process.env.GOOGLE_DRIVE_FILE_ID_PT : process.env.GOOGLE_DRIVE_FILE_ID_EN;
  const trimmed = fromEnv?.trim();
  return trimmed || undefined;
}
