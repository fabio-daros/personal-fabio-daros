"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { scrollToSection } from "@/lib/nav";

export default function GetInTouchButton() {
  const { locale } = useLanguage();
  const t = translations[locale].contact;
  const [formInView, setFormInView] = useState(false);

  useEffect(() => {
    const form = document.getElementById("contact-form");
    if (!form) return;

    const observer = new IntersectionObserver(
      ([entry]) => setFormInView(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(form);
    return () => observer.disconnect();
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToSection("contact-form");
  };

  return (
    <Link
      href="/#contact-form"
      onClick={handleClick}
      className={`get-in-touch-btn d-flex align-items-center justify-content-center${formInView ? " get-in-touch-btn--hidden" : ""}`}
      aria-label={t.getInTouch}
      title={t.getInTouch}
    >
      <Image
        src="/assets/img/speech-bubble.png"
        alt=""
        width={48}
        height={48}
        sizes="48px"
        unoptimized
      />
    </Link>
  );
}
