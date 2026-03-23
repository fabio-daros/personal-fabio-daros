"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";

export default function GetInTouchButton() {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const t = translations[locale].contact;
  const [formInView, setFormInView] = useState(false);

  useEffect(() => {
    if (pathname !== "/") {
      setFormInView(false);
      return;
    }
    const form = document.getElementById("contact-form");
    if (!form) return;

    const observer = new IntersectionObserver(
      ([entry]) => setFormInView(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(form);
    return () => observer.disconnect();
  }, [pathname]);

  const handleClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      const el = document.getElementById("contact-form");
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <Link
      href="/#contact-form"
      onClick={handleClick}
      className={`get-in-touch-btn d-flex align-items-center justify-content-center${formInView ? " get-in-touch-btn--hidden" : ""}`}
      aria-label={t.getInTouch}
      title={t.getInTouch}
    >
      <img src="/assets/img/speech-bubble.png" alt="" width={48} height={48} />
    </Link>
  );
}
