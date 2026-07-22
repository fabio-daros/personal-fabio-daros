"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import PageTitle from "@/components/PageTitle";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";

const expertiseIcons = [
  "bi bi-activity",
  "bi bi-broadcast",
  "bi bi-easel",
  "bi bi-bounding-box-circles",
  "bi bi-calendar4-week",
  "bi bi-chat-square-text",
];

export default function ExpertiseContent() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { locale } = useLanguage();
  const t = translations[locale].expertise;

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    let cancelled = false;
    let running: ReturnType<typeof animate> | null = null;

    const cards = () => Array.from(root.querySelectorAll<HTMLElement>(".expertise-card"));

    const resetCards = () => {
      running?.revert();
      running = null;
      cards().forEach((card) => {
        card.style.opacity = "0";
        card.style.transform = "translate3d(0, 48px, 0) scale(0.96)";
      });
    };

    const playStagger = () => {
      if (cancelled) return;
      const targets = cards();
      if (targets.length === 0) return;

      resetCards();
      running = animate(targets, {
        opacity: [0, 1],
        y: [48, 0],
        scale: [0.96, 1],
        delay: stagger(100, { start: 120 }),
        duration: 750,
        ease: "outCubic",
      });
    };

    if (root.classList.contains("is-revealed")) {
      playStagger();
    } else {
      resetCards();
    }

    const observer = new MutationObserver(() => {
      if (root.classList.contains("is-revealed")) playStagger();
      else resetCards();
    });

    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => {
      cancelled = true;
      observer.disconnect();
      running?.revert();
    };
  }, [locale, t.items]);

  return (
    <div id="expertise" ref={sectionRef} className="site-section">
      <PageTitle
        title={t.title}
        description={t.pageDescription}
      />

      <section className="services section">
        <div className="container">
          <div className="row gy-4">
            {t.items.map((item, i) => (
              <div key={`${locale}-${i}`} className="col-lg-4 col-md-6 expertise-card">
                <div className="service-item position-relative">
                  <div className="icon">
                    <i className={expertiseIcons[i]}></i>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
