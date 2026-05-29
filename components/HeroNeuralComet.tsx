"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useHeroPerformanceTier } from "@/context/HeroPerformanceContext";
import { shouldRenderComet } from "@/lib/hero-performance";

type CometTrajectory = "rtl" | "ltr" | "ttb" | "btt";

type CometPass = {
  id: number;
  trajectory: CometTrajectory;
  startLeft: string;
  startTop: string;
  endLeft: string;
  endTop: string;
  duration: number;
  headSize: number;
};

const TRAJECTORIES: CometTrajectory[] = ["rtl", "ltr", "ttb", "btt"];
const MIN_INTERVAL_MS = 12_000;
const MAX_INTERVAL_MS = 22_000;
const INITIAL_DELAY_MS = 1_200;

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function pickTrajectory(): CometTrajectory {
  return TRAJECTORIES[Math.floor(Math.random() * TRAJECTORIES.length)]!;
}

function createCometPass(id: number): CometPass {
  const trajectory = pickTrajectory();
  const offsetV = randomBetween(6, 18);
  const offsetH = randomBetween(18, 82);
  const drift = randomBetween(50, 62);

  const base = {
    id,
    trajectory,
    duration: randomBetween(7, 10.5),
    headSize: randomBetween(4, 6),
  };

  switch (trajectory) {
    case "rtl":
      return {
        ...base,
        startLeft: "112%",
        startTop: `${offsetV}%`,
        endLeft: "-32%",
        endTop: `${offsetV + drift}%`,
      };
    case "ltr":
      return {
        ...base,
        startLeft: "-32%",
        startTop: `${offsetV}%`,
        endLeft: "112%",
        endTop: `${offsetV + drift}%`,
      };
    case "ttb":
      return {
        ...base,
        startLeft: `${offsetH}%`,
        startTop: "-12%",
        endLeft: `${offsetH}%`,
        endTop: "108%",
      };
    case "btt":
      return {
        ...base,
        startLeft: `${offsetH}%`,
        startTop: "108%",
        endLeft: `${offsetH}%`,
        endTop: "-12%",
      };
  }
}

function nextIntervalMs() {
  return Math.round(randomBetween(MIN_INTERVAL_MS, MAX_INTERVAL_MS));
}

export default function HeroNeuralComet() {
  const { theme } = useTheme();
  const tier = useHeroPerformanceTier();
  const enabled = shouldRenderComet(tier);
  const [comet, setComet] = useState<CometPass | null>(null);
  const cometIdRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const trackTimeout = useCallback((id: ReturnType<typeof setTimeout>) => {
    timersRef.current.push(id);
    return id;
  }, []);

  const launchComet = useCallback(() => {
    cometIdRef.current += 1;
    const pass = createCometPass(cometIdRef.current);
    setComet(pass);

    trackTimeout(
      setTimeout(() => {
        setComet(null);
      }, pass.duration * 1000 + 200),
    );
  }, [trackTimeout]);

  useEffect(() => {
    if (typeof window === "undefined" || !enabled) return;

    const scheduleNext = () => {
      trackTimeout(
        setTimeout(() => {
          launchComet();
          scheduleNext();
        }, nextIntervalMs()),
      );
    };

    trackTimeout(
      setTimeout(() => {
        launchComet();
        scheduleNext();
      }, INITIAL_DELAY_MS),
    );

    return clearTimers;
  }, [clearTimers, enabled, launchComet, trackTimeout]);

  if (!enabled) return null;

  return (
    <div className="hero-neural-comet-layer" aria-hidden="true">
      {comet ? (
        <span
          key={comet.id}
          className={`hero-neural-comet hero-neural-comet--${theme}`}
          style={
            {
              "--comet-start-left": comet.startLeft,
              "--comet-start-top": comet.startTop,
              "--comet-end-left": comet.endLeft,
              "--comet-end-top": comet.endTop,
              "--comet-duration": `${comet.duration}s`,
              "--comet-head": `${comet.headSize}px`,
            } as CSSProperties
          }
        >
          <span className="hero-neural-comet__head" />
        </span>
      ) : null}
    </div>
  );
}
