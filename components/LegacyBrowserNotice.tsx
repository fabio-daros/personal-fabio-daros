"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";

function isLegacyBrowser(): boolean {
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent;
  const isIE = /MSIE|Trident/i.test(ua);
  if (isIE) return true;

  const isIOS = /iPad|iPhone|iPod/.test(ua);
  if (isIOS) {
    const match = ua.match(/OS (\d+)[_\.]?(\d+)?/);
    if (match) {
      const major = parseInt(match[1], 10);
      if (major < 16) return true;
    } else {
      return true;
    }
  }

  const isOldSafari = /Safari/.test(ua) && !/Chrome|Chromium|CriOS/.test(ua);
  if (isOldSafari) {
    const match = ua.match(/Version\/(\d+)[\.\d]*/);
    if (match && parseInt(match[1], 10) < 16) return true;
  }

  if (typeof IntersectionObserver === "undefined") return true;
  if (typeof Promise === "undefined") return true;

  return false;
}

export default function LegacyBrowserNotice() {
  const { locale } = useLanguage();
  const [isLegacy, setIsLegacy] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (document.getElementById("legacy-browser-root")) return;
    setIsLegacy(isLegacyBrowser());
  }, []);

  if (!isLegacy || dismissed) return null;

  const t = translations[locale].legacyBrowser;

  return (
    <div className="legacy-browser-notice" role="dialog" aria-labelledby="legacy-browser-title" aria-modal="true">
      <div className="legacy-browser-notice__backdrop" onClick={() => setDismissed(true)} aria-hidden />
      <div className="legacy-browser-notice__modal">
        <div className="legacy-browser-notice__icon" aria-hidden>
          <i className="bi bi-exclamation-triangle-fill" />
        </div>
        <h2 id="legacy-browser-title" className="legacy-browser-notice__title">{t.title}</h2>
        <p className="legacy-browser-notice__message">{t.message}</p>
        <button
          type="button"
          className="legacy-browser-notice__btn"
          onClick={() => setDismissed(true)}
        >
          {t.dismiss}
        </button>
      </div>
    </div>
  );
}
