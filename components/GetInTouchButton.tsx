"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { scrollToContactSection } from "@/lib/nav";

type FabMode = "contact" | "top";

function isNearPageBottom(offset = 140) {
  const doc = document.documentElement;
  return window.scrollY + window.innerHeight >= doc.scrollHeight - offset;
}

export default function GetInTouchButton() {
  const { locale } = useLanguage();
  const t = translations[locale].contact;
  const [mode, setMode] = useState<FabMode>("contact");

  useEffect(() => {
    const contact = document.getElementById("contact") ?? document.getElementById("contact-form");
    let contactInView = false;

    const syncMode = () => {
      setMode(contactInView || isNearPageBottom() ? "top" : "contact");
    };

    const observer =
      contact &&
      new IntersectionObserver(
        ([entry]) => {
          contactInView = Boolean(entry?.isIntersecting);
          syncMode();
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
      );

    if (contact && observer) observer.observe(contact);

    syncMode();
    window.addEventListener("scroll", syncMode, { passive: true });
    window.addEventListener("resize", syncMode);

    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", syncMode);
      window.removeEventListener("resize", syncMode);
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (mode === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    scrollToContactSection();
  };

  const label = mode === "top" ? t.scrollToTop : t.getInTouch;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`floating-action-btn${mode === "top" ? " floating-action-btn--top" : " floating-action-btn--contact"}`}
      aria-label={label}
      title={label}
    >
      <span className="floating-action-btn__icon floating-action-btn__icon--contact" aria-hidden="true">
        <Image
          src="/assets/img/speech-bubble.png"
          alt=""
          width={28}
          height={28}
          sizes="28px"
          unoptimized
        />
      </span>
      <span className="floating-action-btn__icon floating-action-btn__icon--top" aria-hidden="true">
        <i className="bi bi-arrow-up-short" />
      </span>
    </button>
  );
}
