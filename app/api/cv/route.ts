import { NextRequest, NextResponse } from "next/server";
import type { Locale } from "@/lib/translations";
import { getCvDownloadFilename, getCvDownloadUrl, isExternalCvUrl } from "@/lib/cv";
import { getCvDriveFilename, getGoogleDriveApiKey } from "@/lib/cv-config";
import { resolveCvUrlFromDrive } from "@/lib/cv-drive";

function parseLocale(value: string | null): Locale | null {
  if (value === "pt" || value === "en") return value;
  return null;
}

export async function GET(request: NextRequest) {
  const locale = parseLocale(request.nextUrl.searchParams.get("locale"));
  if (!locale) {
    return NextResponse.json({ error: "Invalid locale. Use pt or en." }, { status: 400 });
  }

  const driveUrl = await resolveCvUrlFromDrive(locale);
  if (driveUrl) {
    return NextResponse.json(
      {
        url: driveUrl,
        source: "drive",
        filename: getCvDriveFilename(locale),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  }

  const envUrl = getCvDownloadUrl(locale);
  if (isExternalCvUrl(envUrl)) {
    return NextResponse.json(
      {
        url: envUrl,
        source: "env",
        filename: getCvDownloadFilename(locale),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  }

  const driveConfigured = Boolean(getGoogleDriveApiKey());
  return NextResponse.json(
    {
      url: null,
      source: "unavailable",
      filename: getCvDriveFilename(locale),
      driveConfigured,
      hint: driveConfigured
        ? `PDF "${getCvDriveFilename(locale)}" not found. Share folder/files publicly or set GOOGLE_DRIVE_FILE_ID_${locale === "pt" ? "PT" : "EN"} in .env.local (file ID from the Drive URL).`
        : "Set GOOGLE_DRIVE_API_KEY in .env.local (see .env.example).",
    },
    { status: driveConfigured ? 404 : 503 }
  );
}
