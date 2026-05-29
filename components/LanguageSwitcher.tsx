"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import type { Locale } from "@/lib/translations";
import { translations } from "@/lib/translations";
import LocaleFlag from "@/components/LocaleFlag";

const LOCALE_OPTIONS: Locale[] = ["pt", "en"];
const LISTBOX_ID = "header-language-listbox";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const t = translations[locale].nav;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  const selectLocale = (next: Locale) => {
    setLocale(next);
    close();
  };

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        close();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [close, open]);

  return (
    <div
      ref={rootRef}
      className={`language-switcher${open ? " language-switcher--open" : ""}`}
    >
      <button
        type="button"
        className="language-switcher__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={LISTBOX_ID}
        aria-label={t.langMenuLabel}
        onClick={() => setOpen((prev) => !prev)}
      >
        <LocaleFlag locale={locale} className="language-switcher__flag" />
        <i className="bi bi-chevron-down language-switcher__chevron" aria-hidden="true" />
      </button>

      <ul
        id={LISTBOX_ID}
        role="listbox"
        aria-label={t.langMenuLabel}
        className="language-switcher__menu"
        hidden={!open}
      >
        {LOCALE_OPTIONS.map((option) => {
          const selected = locale === option;
          const label = option === "pt" ? t.langLabelPt : t.langLabelEn;

          return (
            <li key={option} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={selected}
                aria-label={label}
                className={`language-switcher__option${selected ? " language-switcher__option--active" : ""}`}
                onClick={() => selectLocale(option)}
              >
                <LocaleFlag locale={option} className="language-switcher__flag" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
