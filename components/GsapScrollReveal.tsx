"use client";

import { useEffect, useRef, type ReactNode } from "react";

type GsapScrollRevealProps = {
  children: ReactNode;
};

function whenPreloaderReleased(): Promise<void> {
  return new Promise((resolve) => {
    if (document.body.classList.contains("preloader-released")) {
      resolve();
      return;
    }
    const observer = new MutationObserver(() => {
      if (!document.body.classList.contains("preloader-released")) return;
      observer.disconnect();
      resolve();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    window.setTimeout(() => {
      observer.disconnect();
      resolve();
    }, 2200);
  });
}

/**
 * Scroll entrance for About → Contact.
 * Replays when a section leaves and re-enters the viewport.
 * Uses isIntersecting (not ratio) so tall sections like Resume stay visible.
 */
export default function GsapScrollReveal({ children }: GsapScrollRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let cancelled = false;
    let observer: IntersectionObserver | null = null;
    const leftSections = new WeakSet<HTMLElement>();

    const sections = Array.from(
      root.querySelectorAll<HTMLElement>(".site-section, #contact"),
    );

    const revealSection = (section: HTMLElement) => {
      section.classList.remove("is-revealed");
      void section.offsetWidth;
      section.classList.add("is-revealed");
    };

    const hideSection = (section: HTMLElement) => {
      if (section.querySelector(".is-panel-open")) return;
      section.classList.remove("is-revealed");
    };

    void whenPreloaderReleased().then(() => {
      if (cancelled) return;

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const section = entry.target as HTMLElement;

            if (!entry.isIntersecting) {
              leftSections.add(section);
              hideSection(section);
              continue;
            }

            if (leftSections.has(section) || !section.classList.contains("is-revealed")) {
              leftSections.delete(section);
              revealSection(section);
            }
          }
        },
        {
          // Any overlap with the central band counts — works for short and tall sections.
          threshold: 0,
          rootMargin: "-12% 0px -12% 0px",
        },
      );

      sections.forEach((section) => observer?.observe(section));
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, []);

  return (
    <div ref={rootRef} className="scroll-reveal">
      {children}
    </div>
  );
}
