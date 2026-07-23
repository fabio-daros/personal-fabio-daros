"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";

const USE_STATIC_HERO = false;

const HERO_IMAGE_SRC = "/assets/img/hero-clouds.jpg";
const HERO_VIDEO_SRC = "/assets/video/hero-clouds.mp4";

const HERO_PLAYBACK_RATE = 0.6;

const CROSSFADE_SECONDS = 2.1;

function prepareVideo(video: HTMLVideoElement) {
  video.defaultMuted = true;
  video.muted = true;
  video.playsInline = true;
  video.loop = false;
  video.preload = "auto";
  video.playbackRate = HERO_PLAYBACK_RATE;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
}

function tryPlay(video: HTMLVideoElement) {
  video.playbackRate = HERO_PLAYBACK_RATE;
  const playPromise = video.play();
  if (playPromise) {
    playPromise.catch(() => {});
  }
}

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
      document.body.classList.add("preloader-released");
      observer.disconnect();
      resolve();
    }, 2200);
  });
}

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const typedRef = useRef<HTMLSpanElement>(null);
  const primaryRef = useRef<HTMLVideoElement>(null);
  const secondaryRef = useRef<HTMLVideoElement>(null);
  const [typedArmed, setTypedArmed] = useState(false);
  const [entranceKey, setEntranceKey] = useState(0);
  const { locale } = useLanguage();
  const typedStrings = translations[locale].hero.typed;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let cancelled = false;
    let away = false;
    let canReplay = false;
    let typedDelay: ReturnType<typeof setTimeout> | null = null;

    void whenPreloaderReleased().then(() => {
      if (cancelled) return;
      typedDelay = setTimeout(() => {
        if (!cancelled) setTypedArmed(true);
      }, 2000);
      window.setTimeout(() => {
        if (!cancelled) canReplay = true;
      }, 2800);
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry || cancelled || !canReplay) return;

        if (entry.intersectionRatio < 0.35) {
          away = true;
          return;
        }

        if (away && entry.intersectionRatio >= 0.6) {
          away = false;
          setEntranceKey((key) => key + 1);
        }
      },
      { threshold: [0, 0.35, 0.6, 1] },
    );

    observer.observe(section);

    return () => {
      cancelled = true;
      if (typedDelay) clearTimeout(typedDelay);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (USE_STATIC_HERO) return;

    const primary = primaryRef.current;
    const secondary = secondaryRef.current;
    if (!primary || !secondary) return;

    prepareVideo(primary);
    prepareVideo(secondary);

    let active: HTMLVideoElement = primary;
    let inactive: HTMLVideoElement = secondary;
    let fading = false;
    let rafId = 0;
    let disposed = false;

    const setFront = (video: HTMLVideoElement, isFront: boolean) => {
      video.classList.toggle("is-front", isFront);
      video.classList.toggle("is-back", !isFront);
    };

    const resetLayers = () => {
      setFront(primary, true);
      setFront(secondary, false);
      primary.style.opacity = "1";
      secondary.style.opacity = "0";
    };

    resetLayers();

    const tryPlayBoth = () => {
      if (disposed) return;
      primary.playbackRate = HERO_PLAYBACK_RATE;
      secondary.playbackRate = HERO_PLAYBACK_RATE;
      tryPlay(primary);
    };

    const onReady = () => {
      tryPlayBoth();
    };

    const swapRoles = () => {
      const previous = active;
      active = inactive;
      inactive = previous;
      setFront(active, true);
      setFront(inactive, false);
      fading = false;
    };

    const startCrossfade = () => {
      if (fading || disposed) return;
      fading = true;

      inactive.currentTime = 0;
      tryPlay(inactive);

      const durationMs = (CROSSFADE_SECONDS / HERO_PLAYBACK_RATE) * 1000;
      const startedAt = performance.now();

      const tick = (now: number) => {
        if (disposed) return;

        const progress = Math.min(1, (now - startedAt) / durationMs);
        const eased = progress * progress * (3 - 2 * progress);

        active.style.opacity = String(1 - eased);
        inactive.style.opacity = String(eased);

        if (progress < 1) {
          rafId = requestAnimationFrame(tick);
          return;
        }

        active.pause();
        active.currentTime = 0;
        active.style.opacity = "0";
        inactive.style.opacity = "1";
        swapRoles();
      };

      rafId = requestAnimationFrame(tick);
    };

    const onTimeUpdate = () => {
      if (fading || disposed) return;
      const duration = active.duration;
      if (!Number.isFinite(duration) || duration <= CROSSFADE_SECONDS) return;
      if (active.currentTime >= duration - CROSSFADE_SECONDS) {
        startCrossfade();
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") tryPlay(active);
    };

    primary.addEventListener("loadeddata", onReady);
    primary.addEventListener("canplay", onReady);
    primary.addEventListener("timeupdate", onTimeUpdate);
    secondary.addEventListener("timeupdate", onTimeUpdate);
    document.addEventListener("visibilitychange", onVisibility);

    primary.style.opacity = "1";
    secondary.style.opacity = "0";
    tryPlayBoth();

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      primary.removeEventListener("loadeddata", onReady);
      primary.removeEventListener("canplay", onReady);
      primary.removeEventListener("timeupdate", onTimeUpdate);
      secondary.removeEventListener("timeupdate", onTimeUpdate);
      document.removeEventListener("visibilitychange", onVisibility);
      primary.pause();
      secondary.pause();
    };
  }, []);

  useEffect(() => {
    if (!typedArmed || typeof window === "undefined" || !typedRef.current) return;

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
    };
  }, [typedArmed, locale, typedStrings]);

  return (
    <section id="hero" ref={sectionRef} className="hero section dark-background">
      <div className="hero-video-bg" aria-hidden="true">
        {USE_STATIC_HERO ? (
          <Image
            src={HERO_IMAGE_SRC}
            alt=""
            fill
            priority
            sizes="100vw"
            className="hero-video-bg__media hero-video-bg__media--static is-front"
          />
        ) : (
          <>
            <video
              ref={primaryRef}
              className="hero-video-bg__media is-front"
              src={HERO_VIDEO_SRC}
              autoPlay
              muted
              playsInline
              preload="auto"
            />
            <video
              ref={secondaryRef}
              className="hero-video-bg__media is-back"
              src={HERO_VIDEO_SRC}
              muted
              playsInline
              preload="auto"
            />
          </>
        )}
      </div>
      <div className="container hero-content">
        <h1 key={`hero-name-${entranceKey}`} className="hero-content__name">
          {translations[locale].hero.name}
        </h1>
        <h2 className="visually-hidden">{translations[locale].hero.subtitle}</h2>
        <p className="hero-content__line">
          {translations[locale].hero.im}{" "}
          <span ref={typedRef} className="typed"></span>
          <span className="typed-cursor typed-cursor--blink"></span>
        </p>
        <div key={`hero-social-${entranceKey}`} className="social-links hero-content__social">
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
