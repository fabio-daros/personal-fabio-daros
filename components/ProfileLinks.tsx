"use client";

import { SiOrcid } from "react-icons/si";
import { useLanguage } from "@/context/LanguageContext";

export default function ProfileLinks() {
  const { locale } = useLanguage();

  return (
    <div className="profile-links mt-3 d-flex flex-row align-items-center justify-content-center gap-2">
      <a
        href="https://orcid.org/0009-0000-7734-2971"
        target="_blank"
        rel="noopener noreferrer"
        className="profile-link d-flex align-items-center gap-2"
        title="ORCID"
      >
        <SiOrcid size={24} />
        <span>ORCID</span>
      </a>
      {locale === "pt" && (
        <a
          href="https://lattes.cnpq.br/9283661108380889"
          target="_blank"
          rel="noopener noreferrer"
          className="profile-link d-flex align-items-center gap-2"
          title="Currículo Lattes"
        >
          <span className="lattes-icon" role="img" aria-label="Lattes" />
          <span>Lattes</span>
        </a>
      )}
    </div>
  );
}
