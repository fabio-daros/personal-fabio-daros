"use client";

import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { SiNextdotjs } from "react-icons/si";

export default function Footer() {
  const { locale } = useLanguage();
  const t = translations[locale].footer;

  return (
    <footer id="footer" className="footer dark-background">
      <div className="container text-center">
        <p className="mb-3 footer-tagline fst-italic">{t.tagline}</p>
        <div className="social-links d-flex justify-content-center mb-3">
          <a href="https://github.com/fabio-daros" target="_blank" rel="noopener noreferrer"><i className="bi bi-github"></i></a>
          <a href="https://www.facebook.com/fabio.daros.7/" target="_blank" rel="noopener noreferrer"><i className="bi bi-facebook"></i></a>
          <a href="https://www.instagram.com/fabio__daros/" target="_blank" rel="noopener noreferrer"><i className="bi bi-instagram"></i></a>
          <a href="https://wa.me/353834677853" target="_blank" rel="noopener noreferrer"><i className="bi bi-whatsapp"></i></a>
          <a href="https://www.linkedin.com/in/daros-fabio" target="_blank" rel="noopener noreferrer"><i className="bi bi-linkedin"></i></a>
        </div>
        <div className="copyright">
          © {new Date().getFullYear()} Fabio Daros
        </div>
        <div className="credits">
          {t.credits}
          <span className="ms-1">
            |{" "}
            <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className="credits-next d-inline-flex align-items-center gap-1" title="Next.js">
              <span>{t.poweredBy}</span>
              <SiNextdotjs size={18} />
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
