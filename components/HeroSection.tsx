"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";

export default function HeroSection() {
  const typedRef = useRef<HTMLSpanElement>(null);
  const { locale } = useLanguage();
  const typedStrings = translations[locale].hero.typed;

  useEffect(() => {
    if (typeof window === "undefined" || !typedRef.current) return;

    let typedInstance: { destroy: () => void } | null = null;
    let retryTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 20;

    const tryInit = () => {
      if (!isMounted) return;
      const Typed = (window as Window & { Typed?: new (el: HTMLElement, options: object) => { destroy: () => void } }).Typed;
      if (!Typed || !typedRef.current) {
        if (retryCount < maxRetries) {
          retryCount++;
          retryTimeoutId = setTimeout(tryInit, 100);
        }
        return;
      }

      typedInstance = new Typed(typedRef.current, {
        strings: typedStrings,
        loop: true,
        typeSpeed: 100,
        backSpeed: 50,
        backDelay: 2000,
        showCursor: true,
      });
    };

    tryInit();

    return () => {
      isMounted = false;
      if (retryTimeoutId) clearTimeout(retryTimeoutId);
      typedInstance?.destroy();
    };
  }, [locale, typedStrings]);

  return (
    <section id="hero" className="hero section dark-background">
      <div className="hero-bg" data-aos="fade-in" />
      <div className="container" data-aos="zoom-out" data-aos-delay="100">
        <h1>{translations[locale].hero.name}</h1>
        <h2 className="visually-hidden">{translations[locale].hero.subtitle}</h2>
        <p>
          {translations[locale].hero.im}{" "}
          <span ref={typedRef} className="typed"></span>
          <span className="typed-cursor typed-cursor--blink"></span>
        </p>
        <div className="social-links">
          <a href="https://github.com/fabio-daros" target="_blank" rel="noopener noreferrer">
            <i className="bi bi-github"></i>
          </a>
          <a href="https://www.facebook.com/fabio.daros.7/" target="_blank" rel="noopener noreferrer">
            <i className="bi bi-facebook"></i>
          </a>
          <a href="https://www.instagram.com/fabio__daros/" target="_blank" rel="noopener noreferrer">
            <i className="bi bi-instagram"></i>
          </a>
          <a href="https://wa.me/353834677853" target="_blank" rel="noopener noreferrer">
            <i className="bi bi-whatsapp"></i>
          </a>
          <a href="https://www.linkedin.com/in/daros-fabio" target="_blank" rel="noopener noreferrer">
            <i className="bi bi-linkedin"></i>
          </a>
        </div>
      </div>
    </section>
  );
}
