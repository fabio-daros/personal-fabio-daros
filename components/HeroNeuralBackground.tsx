"use client";

import { useEffect, useRef } from "react";
import { tsParticles } from "@tsparticles/engine";
import type { Container, ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { useTheme, type Theme } from "@/context/ThemeContext";
import HeroNeuralMicroPulses from "./HeroNeuralMicroPulses";

let slimLoader: Promise<void> | null = null;

const PARTICLE_PALETTES = {
  dark: {
    colors: ["#b8f5d4", "#7ee8a8", "#5ef59a", "#18d26e", "#0d9e4e"],
    links: "#5ef59a",
  },
  light: {
    colors: ["#0a7a3d", "#0d9e4e", "#084a28"],
    links: "#7ee8a8",
  },
} as const;

function findHeroParticlesContainer(): Container | undefined {
  return tsParticles.items.find((item) => item.id.description === "hero-neural-particles");
}

const GREEN_LIGHTNESS_PULSE = {
  h: { enable: false, speed: 0 },
  s: { enable: false, speed: 0 },
  l: { enable: true, speed: 7, sync: false },
} as const;

function buildGreenPaint(theme: Theme) {
  const isLight = theme === "light";

  return {
    fill: {
      enable: true,
      color: {
        value: isLight ? "#0d9e4e" : "#18d26e",
        animation: {
          h: { ...GREEN_LIGHTNESS_PULSE.h },
          s: { ...GREEN_LIGHTNESS_PULSE.s },
          l: {
            ...GREEN_LIGHTNESS_PULSE.l,
            speed: isLight ? 6 : 8,
            min: isLight ? 28 : 22,
            max: isLight ? 74 : 88,
          },
        },
      },
    },
  };
}

function buildParticleOptions(theme: Theme): ISourceOptions {
  const palette = PARTICLE_PALETTES[theme];
  const isLight = theme === "light";

  return {
    fullScreen: {
      enable: false,
    },
    background: {
      color: "transparent",
    },
    detectRetina: true,
    fpsLimit: 45,
    interactivity: {
      detectsOn: "window",
      events: {
        onHover: {
          enable: true,
          mode: "repulse",
        },
      },
      modes: {
        repulse: {
          distance: isLight ? 78 : 90,
          duration: 0.4,
          factor: isLight ? 16 : 20,
          speed: 1.15,
          maxSpeed: isLight ? 12 : 16,
          easing: "easeOutQuad",
          restore: {
            enable: true,
            delay: 0,
            speed: 0.055,
            follow: true,
          },
        },
      },
    },
    particles: {
      number: {
        value: 155,
        density: {
          enable: true,
          width: 1000,
          height: 650,
        },
      },
      paint: buildGreenPaint(theme),
      links: {
        enable: true,
        blink: false,
        color: {
          value: palette.links,
        },
        distance: 108,
        frequency: 0.72,
        opacity: isLight ? 0.38 : 0.28,
        width: isLight ? 0.95 : 1.05,
      },
      move: {
        enable: true,
        direction: "none",
        outModes: {
          default: "bounce",
        },
        random: true,
        speed: isLight ? 0.18 : 0.22,
        straight: false,
      },
      opacity: isLight
        ? {
            value: {
              min: 0.55,
              max: 0.92,
            },
            animation: {
              enable: true,
              speed: 0.55,
              sync: false,
              startValue: "random",
            },
          }
        : {
            value: {
              min: 0.18,
              max: 1,
            },
            animation: {
              enable: true,
              speed: 0.72,
              sync: false,
              startValue: "random",
            },
          },
      size: isLight
        ? {
            value: {
              min: 2.2,
              max: 3.6,
            },
            animation: {
              enable: true,
              speed: 0.65,
              sync: false,
              startValue: "random",
            },
          }
        : {
            value: {
              min: 0.8,
              max: 3.1,
            },
            animation: {
              enable: true,
              speed: 1,
              sync: false,
              startValue: "random",
            },
          },
    },
  };
}

export default function HeroNeuralBackground() {
  const { theme, mounted } = useTheme();
  const containerRef = useRef<Container | undefined>(undefined);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;

    let isMounted = true;

    const syncParticles = async () => {
      slimLoader ??= loadSlim(tsParticles);
      await slimLoader;

      if (!isMounted) return;

      const options = buildParticleOptions(theme);
      const existing = findHeroParticlesContainer();

      if (existing) {
        existing.destroy();
        containerRef.current = undefined;
      }

      containerRef.current = await tsParticles.load({
        id: "hero-neural-particles",
        options,
      });
    };

    syncParticles();

    return () => {
      isMounted = false;
      containerRef.current?.destroy();
      containerRef.current = undefined;
    };
  }, [theme, mounted]);

  const isLight = theme === "light";

  return (
    <div className="hero-neural-bg" aria-hidden="true">
      <div className="hero-neural-gradient" />
      <div className="hero-neural-nebula" aria-hidden="true">
        <span className="hero-neural-nebula__blob hero-neural-nebula__blob--a" />
        <span className="hero-neural-nebula__blob hero-neural-nebula__blob--b" />
        <span className="hero-neural-nebula__blob hero-neural-nebula__blob--c" />
      </div>
      <div
        id="hero-neural-particles"
        className={`hero-neural-particles${isLight ? " hero-neural-particles--light" : ""}`}
        data-theme={theme}
      />
      <HeroNeuralMicroPulses />
      <div className="hero-neural-vignette" />
    </div>
  );
}
