"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import LanguageSwitcher from "./LanguageSwitcher";

const navLinks = [
  { href: "/", labelKey: "home" as const },
  { href: "/about", labelKey: "about" as const },
  { href: "/resume", labelKey: "resume" as const },
  { href: "/expertise", labelKey: "expertise" as const },
];

export default function Header() {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const t = translations[locale].nav;

  return (
    <header id="header" className="header d-flex align-items-center fixed-top">
      <div className="container-fluid container-xl position-relative d-flex align-items-center justify-content-between">
        <Link href="/" className="logo d-flex align-items-center">
          <h1 className="sitename">Personal</h1>
        </Link>

        <div className="d-flex align-items-center gap-3">
          <nav id="navmenu" className="navmenu">
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
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
