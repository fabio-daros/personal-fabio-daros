"use client";

import Link from "next/link";
import { useEffect, useState, type MouseEvent } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { SITE_SECTIONS, scrollToSection, type SiteSectionId } from "@/lib/nav";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";

export default function Header() {
  const { locale } = useLanguage();
  const t = translations[locale].nav;
  const [activeId, setActiveId] = useState<SiteSectionId>("hero");

  useEffect(() => {
    const updateActive = () => {
      // Active section = last section whose top has crossed just below the fixed header.
      const marker = 96;
      let current: SiteSectionId = SITE_SECTIONS[0].id;

      for (const { id } of SITE_SECTIONS) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top - marker <= 0) {
          current = id;
        }
      }

      setActiveId((prev) => (prev === current ? prev : current));
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, []);

  useEffect(() => {
    const nextHash = `#${activeId}`;
    if (window.location.hash === nextHash) return;
    history.replaceState(null, "", nextHash);
  }, [activeId]);

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, id: SiteSectionId) => {
    event.preventDefault();
    scrollToSection(id);
    setActiveId(id);
    document.body.classList.remove("mobile-nav-active");
  };

  return (
    <header id="header" className="header d-flex align-items-center fixed-top">
      <div className="container-fluid container-xl header-inner position-relative d-flex align-items-center">
        <nav id="navmenu" className="navmenu header-nav">
          <ul>
            {SITE_SECTIONS.map((link) => (
              <li key={link.id}>
                <Link
                  href={link.href}
                  className={activeId === link.id ? "active" : undefined}
                  onClick={(event) => handleNavClick(event, link.id)}
                >
                  {t[link.labelKey]}
                </Link>
              </li>
            ))}
          </ul>
          <i className="mobile-nav-toggle d-xl-none bi bi-list"></i>
        </nav>

        <div className="header-controls d-flex align-items-center">
          <LanguageSwitcher />
          <span className="header-controls__divider" aria-hidden="true">
            |
          </span>
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
