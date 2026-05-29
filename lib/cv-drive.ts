import type { Locale } from "@/lib/translations";
import {
  getCvDriveFileId,
  getCvDriveFilename,
  getCvDriveFolderId,
  getGoogleDriveApiKey,
} from "@/lib/cv-config";

type DriveFile = { id: string; name: string };

type CacheEntry = { fileId: string; expiresAt: number };

const CACHE_TTL_MS = 5 * 60 * 1000;
const fileIdCache = new Map<string, CacheEntry>();

function buildDriveDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

function escapeDriveQueryValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

async function findFileIdInFolder(
  folderId: string,
  filename: string,
  apiKey: string
): Promise<string | null> {
  const cacheKey = `${folderId}::${filename}`;
  const cached = fileIdCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.fileId;
  }

  const q = `'${folderId}' in parents and name = '${escapeDriveQueryValue(filename)}' and trashed = false`;
  const params = new URLSearchParams({
    q,
    fields: "files(id,name)",
    pageSize: "1",
    supportsAllDrives: "true",
    includeItemsFromAllDrives: "true",
    key: apiKey,
  });

  const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    console.error("[cv-drive] Drive API error:", response.status, await response.text());
    return null;
  }

  const data = (await response.json()) as { files?: DriveFile[] };
  const fileId = data.files?.[0]?.id;
  if (!fileId) return null;

  fileIdCache.set(cacheKey, { fileId, expiresAt: Date.now() + CACHE_TTL_MS });
  return fileId;
}

/** Resolves a direct download URL from Drive (file ID in env, or folder + filename lookup). */
export async function resolveCvUrlFromDrive(locale: Locale): Promise<string | null> {
  const fileIdFromEnv = getCvDriveFileId(locale);
  if (fileIdFromEnv) {
    return buildDriveDownloadUrl(fileIdFromEnv);
  }

  const apiKey = getGoogleDriveApiKey();
  if (!apiKey) return null;

  const folderId = getCvDriveFolderId();
  const filename = getCvDriveFilename(locale);
  const fileId = await findFileIdInFolder(folderId, filename, apiKey);
  if (!fileId) return null;

  return buildDriveDownloadUrl(fileId);
}
