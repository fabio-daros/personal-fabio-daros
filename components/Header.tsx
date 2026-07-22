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
    const sections = SITE_SECTIONS.map((section) => document.getElementById(section.id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0];
        if (!top?.target.id) return;
        const id = top.target.id as SiteSectionId;
        if (SITE_SECTIONS.some((section) => section.id === id)) {
          setActiveId(id);
        }
      },
      {
        rootMargin: "-25% 0px -55% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75],
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
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
