"use client";

import type { MouseEvent } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { getCvDownloadFilename, getCvDownloadUrl, isExternalCvUrl } from "@/lib/cv";
import { SITE_SECTIONS, scrollToSection } from "@/lib/nav";
import { translations } from "@/lib/translations";
import { SiNextdotjs } from "react-icons/si";

const EXPLORE_SECTIONS = SITE_SECTIONS.filter((section) => section.id !== "hero");

export default function Footer() {
  const { locale } = useLanguage();
  const t = translations[locale];
  const footer = t.footer;
  const nav = t.nav;
  const contact = t.contact;
  const cvUrl = getCvDownloadUrl(locale);
  const cvExternal = isExternalCvUrl(cvUrl);

  const onExploreClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    scrollToSection(id);
  };

  return (
    <footer id="footer" className="footer dark-background">
      <div className="container footer-inner">
        <div className="footer-grid">
          <div className="footer-col footer-col--brand">
            <a
              href="/#hero"
              className="footer-brand"
              onClick={(event) => onExploreClick(event, "hero")}
            >
              Fabio Daros
            </a>
            <p className="footer-tagline">{footer.tagline}</p>
            <p className="footer-blurb">{footer.blurb}</p>
            <div className="social-links footer-social">
              <a href="https://github.com/fabio-daros" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <i className="bi bi-github"></i>
              </a>
              <a href="https://www.facebook.com/fabio.daros.7/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="https://www.instagram.com/fabio__daros/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="https://wa.me/353834677853" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <i className="bi bi-whatsapp"></i>
              </a>
              <a href="https://www.linkedin.com/in/daros-fabio" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <i className="bi bi-linkedin"></i>
              </a>
            </div>
          </div>

          <div className="footer-col footer-col--explore">
            <h3 className="footer-heading">{footer.explore}</h3>
            <ul className="footer-links">
              {EXPLORE_SECTIONS.map((section) => (
                <li key={section.id}>
                  <a href={section.href} onClick={(event) => onExploreClick(event, section.id)}>
                    {nav[section.labelKey]}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col footer-col--contact">
            <h3 className="footer-heading">{footer.contact}</h3>
            <ul className="footer-contact-list">
              <li>
                <span className="footer-contact-label">{contact.emailMe}</span>
                <a href={`mailto:${contact.contactEmail}`}>{contact.contactEmail}</a>
              </li>
              <li>
                <span className="footer-contact-label">{contact.callMe}</span>
                <a href="https://wa.me/353834677853" target="_blank" rel="noopener noreferrer">
                  +353 83 467 7853
                </a>
              </li>
              <li>
                <span className="footer-contact-label">{contact.location}</span>
                <span>{footer.locationValue}</span>
              </li>
              <li>
                <a
                  href={cvUrl}
                  className="footer-cv-link"
                  {...(cvExternal
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : { download: getCvDownloadFilename(locale) })}
                >
                  {t.resume.downloadCv}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright" suppressHydrationWarning>
            © {new Date().getFullYear()} Fabio Daros
          </div>
          <div className="credits">
            <a
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="credits-next d-inline-flex align-items-center gap-1"
              title="Next.js"
            >
              <span>{footer.poweredBy}</span>
              <SiNextdotjs size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
