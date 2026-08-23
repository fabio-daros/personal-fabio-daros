"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme, type Theme } from "@/context/ThemeContext";
import { translations } from "@/lib/translations";

const USE_STATIC_HERO = false;

const HERO_IMAGE_SRC = "/assets/img/hero-clouds.jpg";
const HERO_VIDEO_DAY = "/assets/video/hero-day.mp4?v=smooth074";
const HERO_VIDEO_NIGHT = "/assets/video/hero-night.mp4?v=smooth074";
const THEME_CROSSFADE_MS = 5000;

function isMobileHero(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 992px), (hover: none) and (pointer: coarse)").matches;
}

function prepareVideo(video: HTMLVideoElement, preload: "auto" | "metadata" | "none" = "auto") {
  video.defaultMuted = true;
  video.muted = true;
  video.volume = 0;
  video.playsInline = true;
  video.controls = false;
  video.disablePictureInPicture = true;
  video.loop = true;
  video.preload = preload;
  video.playbackRate = 1;
  video.setAttribute("muted", "");
  video.setAttribute("autoplay", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.setAttribute("x-webkit-airplay", "deny");
  video.removeAttribute("controls");
}

function tryPlay(video: HTMLVideoElement) {
  video.defaultMuted = true;
  video.muted = true;
  video.volume = 0;
  video.playsInline = true;
  video.playbackRate = 1;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  const playPromise = video.play();
  if (playPromise) {
    playPromise.catch(() => {});
  }
}

function videoForTheme(theme: Theme, day: HTMLVideoElement, night: HTMLVideoElement) {
  return theme === "light" ? day : night;
}

function syncPlayback(from: HTMLVideoElement, to: HTMLVideoElement) {
  const fromDuration = from.duration;
  const toDuration = to.duration;
  if (!Number.isFinite(fromDuration) || !Number.isFinite(toDuration) || fromDuration <= 0 || toDuration <= 0) {
    return;
  }
  const progress = from.currentTime / fromDuration;
  try {
    to.currentTime = progress * toDuration;
  } catch {
    // Ignore seek errors while metadata is still settling.
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
  const dayRef = useRef<HTMLVideoElement>(null);
  const nightRef = useRef<HTMLVideoElement>(null);
  const activeThemeRef = useRef<Theme>("dark");
  const [typedArmed, setTypedArmed] = useState(false);
  const [entranceKey, setEntranceKey] = useState(0);
  const { locale } = useLanguage();
  const { theme, mounted } = useTheme();
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

    const day = dayRef.current;
    const night = nightRef.current;
    if (!day || !night) return;

    const mobile = isMobileHero();
    const initialTheme =
      (document.documentElement.getAttribute("data-theme") as Theme | null) === "light"
        ? "light"
        : "dark";
    activeThemeRef.current = initialTheme;

    prepareVideo(day, mobile && initialTheme !== "light" ? "none" : "auto");
    prepareVideo(night, mobile && initialTheme !== "dark" ? "none" : "auto");

    let revealed = false;
    let disposed = false;
    let fading = false;
    let pauseTimeout = 0;
    let kickInterval = 0;
    let kickAttempts = 0;

    const ensureReady = (video: HTMLVideoElement) => {
      if (video.preload === "none") {
        video.preload = "auto";
        try {
          video.load();
        } catch {
          // Ignore load() errors on some mobile browsers.
        }
        return;
      }
      if (video.readyState === 0) {
        try {
          video.load();
        } catch {
          // Ignore load() errors on some mobile browsers.
        }
      }
    };

    const showInstant = (active: HTMLVideoElement, inactive: HTMLVideoElement) => {
      fading = false;
      window.clearTimeout(pauseTimeout);

      ensureReady(active);
      active.style.transition = "none";
      inactive.style.transition = "none";
      active.style.opacity = "1";
      inactive.style.opacity = "0";
      active.style.zIndex = "3";
      inactive.style.zIndex = "2";
      active.classList.add("is-playing", "is-active");
      inactive.classList.add("is-playing");
      inactive.classList.remove("is-active");
      tryPlay(active);
      inactive.pause();
    };

    const crossfadeTo = (incoming: HTMLVideoElement, outgoing: HTMLVideoElement) => {
      fading = true;
      window.clearTimeout(pauseTimeout);

      ensureReady(incoming);
      syncPlayback(outgoing, incoming);
      tryPlay(incoming);
      tryPlay(outgoing);

      incoming.style.transition = "none";
      outgoing.style.transition = "none";
      incoming.style.opacity = "0";
      outgoing.style.opacity = "1";
      incoming.style.zIndex = "3";
      outgoing.style.zIndex = "2";
      incoming.classList.add("is-playing", "is-active");
      outgoing.classList.add("is-playing");
      outgoing.classList.remove("is-active");

      // Force style flush so the long opacity transition always starts from 0 → 1 / 1 → 0.
      void incoming.offsetWidth;

      const duration = `${THEME_CROSSFADE_MS}ms`;
      incoming.style.transition = `opacity ${duration} ease-in-out`;
      outgoing.style.transition = `opacity ${duration} ease-in-out`;
      incoming.style.opacity = "1";
      outgoing.style.opacity = "0";

      pauseTimeout = window.setTimeout(() => {
        if (disposed) return;
        fading = false;
        if (videoForTheme(activeThemeRef.current, day, night) !== incoming) return;
        outgoing.pause();
        outgoing.style.transition = "none";
      }, THEME_CROSSFADE_MS + 120);
    };

    const revealWhenLive = (video: HTMLVideoElement) => {
      // Never lift the cover while paused — mobile browsers show a native play button.
      if (revealed || disposed || video.paused || video.ended) return;

      const goLive = () => {
        if (revealed || disposed || video.paused) return;
        revealed = true;
        heroBgRef.current?.classList.add("is-video-live");
        window.clearInterval(kickInterval);
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

    const kickActive = () => {
      if (disposed) return;
      const active = videoForTheme(activeThemeRef.current, day, night);
      ensureReady(active);
      tryPlay(active);
      if (!active.paused) {
        revealWhenLive(active);
      }
    };

    const startKickLoop = () => {
      window.clearInterval(kickInterval);
      kickAttempts = 0;
      kickActive();
      kickInterval = window.setInterval(() => {
        if (disposed) {
          window.clearInterval(kickInterval);
          return;
        }
        const active = videoForTheme(activeThemeRef.current, day, night);
        if (!active.paused && !active.ended) {
          revealWhenLive(active);
          window.clearInterval(kickInterval);
          return;
        }
        kickAttempts += 1;
        kickActive();
        if (kickAttempts >= 40) {
          window.clearInterval(kickInterval);
        }
      }, 250);
    };

    const applyTheme = (nextTheme: Theme, { animate }: { animate: boolean }) => {
      if (disposed) return;

      const incoming = videoForTheme(nextTheme, day, night);
      const outgoing = incoming === day ? night : day;
      const previousTheme = activeThemeRef.current;

      if (previousTheme === nextTheme) {
        if (!fading) showInstant(incoming, outgoing);
        return;
      }

      activeThemeRef.current = nextTheme;

      if (!animate) {
        showInstant(incoming, outgoing);
        return;
      }

      crossfadeTo(incoming, outgoing);
    };

    const onReady = () => {
      if (disposed || fading) return;
      const active = videoForTheme(activeThemeRef.current, day, night);
      const inactive = active === day ? night : day;
      showInstant(active, inactive);
      kickActive();
    };

    const onPlaying = (event: Event) => {
      revealWhenLive(event.currentTarget as HTMLVideoElement);
    };

    const onTimeUpdate = (event: Event) => {
      const video = event.currentTarget as HTMLVideoElement;
      if (!video.paused && video.currentTime > 0.05) revealWhenLive(video);
    };

    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      startKickLoop();
    };

    const onPageShow = () => startKickLoop();

    day.addEventListener("loadeddata", onReady);
    night.addEventListener("loadeddata", onReady);
    day.addEventListener("canplay", onReady);
    night.addEventListener("canplay", onReady);
    day.addEventListener("playing", onPlaying);
    night.addEventListener("playing", onPlaying);
    day.addEventListener("timeupdate", onTimeUpdate);
    night.addEventListener("timeupdate", onTimeUpdate);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onPageShow);

    const unlockPlayback = () => {
      startKickLoop();
    };
    document.addEventListener("touchstart", unlockPlayback, { passive: true });
    document.addEventListener("touchend", unlockPlayback, { passive: true });
    document.addEventListener("pointerdown", unlockPlayback, { passive: true });
    document.addEventListener("click", unlockPlayback);

    showInstant(videoForTheme(initialTheme, day, night), initialTheme === "light" ? night : day);
    startKickLoop();

    void whenPreloaderReleased().then(() => {
      if (!disposed) startKickLoop();
    });

    const onThemeAttribute = () => {
      const next =
        (document.documentElement.getAttribute("data-theme") as Theme | null) === "light"
          ? "light"
          : "dark";
      applyTheme(next, { animate: true });
      startKickLoop();
    };

    const themeObserver = new MutationObserver(onThemeAttribute);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      disposed = true;
      window.clearTimeout(pauseTimeout);
      window.clearInterval(kickInterval);
      themeObserver.disconnect();
      day.removeEventListener("loadeddata", onReady);
      night.removeEventListener("loadeddata", onReady);
      day.removeEventListener("canplay", onReady);
      night.removeEventListener("canplay", onReady);
      day.removeEventListener("playing", onPlaying);
      night.removeEventListener("playing", onPlaying);
      day.removeEventListener("timeupdate", onTimeUpdate);
      night.removeEventListener("timeupdate", onTimeUpdate);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("touchstart", unlockPlayback);
      document.removeEventListener("touchend", unlockPlayback);
      document.removeEventListener("pointerdown", unlockPlayback);
      document.removeEventListener("click", unlockPlayback);
      day.pause();
      night.pause();
    };
  }, []);

  useEffect(() => {
    if (USE_STATIC_HERO || !mounted) return;

    const day = dayRef.current;
    const night = nightRef.current;
    if (!day || !night) return;

    // Keep ref aligned; MutationObserver drives the animated crossfade.
    if (activeThemeRef.current === theme) {
      const active = videoForTheme(theme, day, night);
      const inactive = active === day ? night : day;
      if (active.style.opacity !== "1") {
        active.style.transition = "none";
        inactive.style.transition = "none";
        active.style.opacity = "1";
        inactive.style.opacity = "0";
        active.classList.add("is-playing", "is-active");
        inactive.classList.remove("is-active");
        tryPlay(active);
      }
    }
  }, [theme, mounted]);

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
            className="hero-video-bg__media hero-video-bg__media--static is-active is-playing"
          />
        ) : (
          <>
            <video
              ref={dayRef}
              className="hero-video-bg__media hero-video-bg__media--day"
              src={HERO_VIDEO_DAY}
              autoPlay
              muted
              playsInline
              loop
              preload="auto"
              controls={false}
              controlsList="nodownload nofullscreen noremoteplayback"
              disablePictureInPicture
              disableRemotePlayback
            />
            <video
              ref={nightRef}
              className="hero-video-bg__media hero-video-bg__media--night"
              src={HERO_VIDEO_NIGHT}
              autoPlay
              muted
              playsInline
              loop
              preload="auto"
              controls={false}
              controlsList="nodownload nofullscreen noremoteplayback"
              disablePictureInPicture
              disableRemotePlayback
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
