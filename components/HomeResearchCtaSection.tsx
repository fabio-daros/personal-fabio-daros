"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";

export default function HomeResearchCtaSection() {
  const { locale } = useLanguage();
  const t = translations[locale].home;

  return (
    <section id="research-cta" className="home-research-cta section dark-background">
      <div className="container" data-aos="fade-up">
        <Link
          href="/research"
          className="home-research-cta__btn"
          aria-label={t.researchCta}
        >
          <span>{t.researchCta}</span>
          <i className="bi bi-arrow-right" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
