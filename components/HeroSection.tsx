"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import HeroNeuralBackground from "@/components/HeroNeuralBackground";
import HeroNeuralComet from "@/components/HeroNeuralComet";

export default function HeroSection() {
  const typedRef = useRef<HTMLSpanElement>(null);
  const { locale } = useLanguage();
  const typedStrings = translations[locale].hero.typed;

  useEffect(() => {
    if (typeof window === "undefined" || !typedRef.current) return;

    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let stringIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const typeSpeed = 100;
    const backSpeed = 50;
    const backDelay = 2000;

    const tick = () => {
      if (!isMounted || !typedRef.current) return;

      const currentString = typedStrings[stringIndex] ?? "";
      typedRef.current.textContent = currentString.slice(0, charIndex);

      if (!isDeleting && charIndex < currentString.length) {
        charIndex++;
        timeoutId = setTimeout(tick, typeSpeed);
        return;
      }

      if (!isDeleting && charIndex === currentString.length) {
        isDeleting = true;
        timeoutId = setTimeout(tick, backDelay);
        return;
      }

      if (isDeleting && charIndex > 0) {
        charIndex--;
        timeoutId = setTimeout(tick, backSpeed);
        return;
      }

      isDeleting = false;
      stringIndex = (stringIndex + 1) % typedStrings.length;
      timeoutId = setTimeout(tick, typeSpeed);
    };

    tick();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (typedRef.current) typedRef.current.textContent = "";
    };
  }, [locale, typedStrings]);

  return (
    <section id="hero" className="hero section dark-background">
      <HeroNeuralBackground />
      <HeroNeuralComet />
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
