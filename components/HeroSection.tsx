"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";

const USE_STATIC_HERO = false;

const HERO_IMAGE_SRC = "/assets/img/hero-clouds.jpg";
const HERO_VIDEO_SRC = "/assets/video/hero-test.mp4?v=loop1-smooth074";

function prepareVideo(video: HTMLVideoElement) {
  video.defaultMuted = true;
  video.muted = true;
  video.volume = 0;
  video.playsInline = true;
  video.controls = false;
  video.disablePictureInPicture = true;
  video.loop = true;
  video.preload = "auto";
  video.playbackRate = 1;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.setAttribute("x-webkit-airplay", "deny");
  video.removeAttribute("controls");
}

function tryPlay(video: HTMLVideoElement) {
  video.muted = true;
  video.volume = 0;
  video.playbackRate = 1;
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
  const heroBgRef = useRef<HTMLDivElement>(null);
  const typedRef = useRef<HTMLSpanElement>(null);
  const primaryRef = useRef<HTMLVideoElement>(null);
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

    const video = primaryRef.current;
    if (!video) return;

    prepareVideo(video);

    let revealed = false;
    let disposed = false;

    const revealWhenLive = () => {
      video.classList.add("is-playing", "is-front");
      video.classList.remove("is-back");
      if (revealed || disposed) return;
      if (video.paused || video.ended) return;

      const goLive = () => {
        if (revealed || disposed) return;
        revealed = true;
        heroBgRef.current?.classList.add("is-video-live");
      };

      const anyVideo = video as HTMLVideoElement & {
        requestVideoFrameCallback?: (cb: () => void) => number;
      };

      if (typeof anyVideo.requestVideoFrameCallback === "function") {
        anyVideo.requestVideoFrameCallback(() => goLive());
        return;
      }

      window.setTimeout(goLive, 50);
    };

    const onReady = () => {
      if (!disposed) tryPlay(video);
    };

    const onPlaying = () => {
      revealWhenLive();
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") tryPlay(video);
    };

    video.addEventListener("loadeddata", onReady);
    video.addEventListener("canplay", onReady);
    video.addEventListener("playing", onPlaying);
    document.addEventListener("visibilitychange", onVisibility);

    const unlockPlayback = () => {
      tryPlay(video);
      document.removeEventListener("touchstart", unlockPlayback);
      document.removeEventListener("click", unlockPlayback);
    };
    document.addEventListener("touchstart", unlockPlayback, { once: true, passive: true });
    document.addEventListener("click", unlockPlayback, { once: true });

    tryPlay(video);

    return () => {
      disposed = true;
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("canplay", onReady);
      video.removeEventListener("playing", onPlaying);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("touchstart", unlockPlayback);
      document.removeEventListener("click", unlockPlayback);
      video.pause();
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
      <div ref={heroBgRef} className="hero-video-bg" aria-hidden="true">
        {USE_STATIC_HERO ? (
          <Image
            src={HERO_IMAGE_SRC}
            alt=""
            fill
            priority
            sizes="100vw"
            className="hero-video-bg__media hero-video-bg__media--static is-front is-playing"
          />
        ) : (
          <>
            <video
              ref={primaryRef}
              className="hero-video-bg__media is-front"
              src={HERO_VIDEO_SRC}
              muted
              playsInline
              loop
              preload="auto"
              controls={false}
              disablePictureInPicture
            />
            <div className="hero-video-bg__cover" />
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
