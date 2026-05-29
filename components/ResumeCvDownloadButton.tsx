"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { getCvDownloadFilename, isExternalCvUrl } from "@/lib/cv";
import { translations } from "@/lib/translations";

type CvApiResponse = {
  url?: string | null;
  source?: string;
};

export default function ResumeCvDownloadButton() {
  const { locale } = useLanguage();
  const t = translations[locale].resume;
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setCvUrl(null);

      try {
        const response = await fetch(`/api/cv?locale=${locale}`);
        const data = (await response.json()) as CvApiResponse;
        if (cancelled) return;

        if (response.ok && data.url && data.source !== "unavailable") {
          setCvUrl(data.url);
        }
      } catch {
        /* unavailable */
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const external = cvUrl ? isExternalCvUrl(cvUrl) : false;
  const disabled = loading || !cvUrl;

  return (
    <a
      href={cvUrl ?? "#"}
      className={`resume-cv-download__btn${loading ? " resume-cv-download__btn--loading" : ""}${disabled ? " resume-cv-download__btn--disabled" : ""}`}
      download={external ? undefined : getCvDownloadFilename(locale)}
      aria-busy={loading}
      aria-disabled={disabled}
      onClick={(event) => {
        if (!cvUrl) event.preventDefault();
      }}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <i className="bi bi-download" aria-hidden="true" />
      {t.downloadCv}
    </a>
  );
}
