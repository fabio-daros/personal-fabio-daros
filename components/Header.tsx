"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";

const navLinks = [
  { href: "/", labelKey: "home" as const },
  { href: "/about", labelKey: "about" as const },
  { href: "/resume", labelKey: "resume" as const },
  { href: "/research", labelKey: "research" as const },
  { href: "/expertise", labelKey: "expertise" as const },
];

export default function Header() {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const t = translations[locale].nav;

  return (
    <header id="header" className="header d-flex align-items-center fixed-top">
      <div className="container-fluid container-xl header-inner position-relative d-flex align-items-center">
        <nav id="navmenu" className="navmenu header-nav">
          <ul>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={pathname === link.href ? "active" : undefined}
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
