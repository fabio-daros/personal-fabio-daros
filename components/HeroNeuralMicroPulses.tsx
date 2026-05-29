"use client";

import { useEffect, useState } from "react";
import { useTheme, type Theme } from "@/context/ThemeContext";

type MicroPulse = {
  id: number;
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
  color?: string;
  colorDark?: string;
  colorLight?: string;
};

const DARK_PULSE_COLORS = ["#b8f5d4", "#7ee8a8", "#5ef59a", "#18d26e", "#0d9e4e"] as const;

const LIGHT_PULSE_PAIRS: ReadonlyArray<{ dark: string; light: string }> = [
  { dark: "#0a7a3d", light: "#7ee8a8" },
  { dark: "#0d9e4e", light: "#5ef59a" },
  { dark: "#084a28", light: "#18d26e" },
  { dark: "#066b35", light: "#b8f5d4" },
];

function createDarkMicroPulses(count: number): MicroPulse[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: 34 + Math.random() * 62,
    top: 8 + Math.random() * 84,
    size: 1.6 + Math.random() * 2.8,
    delay: Math.random() * 8,
    duration: 1.6 + Math.random() * 2.8,
    color: DARK_PULSE_COLORS[Math.floor(Math.random() * DARK_PULSE_COLORS.length)],
  }));
}

function createLightMicroPulses(count: number): MicroPulse[] {
  return Array.from({ length: count }, (_, id) => {
    const pair = LIGHT_PULSE_PAIRS[Math.floor(Math.random() * LIGHT_PULSE_PAIRS.length)];
    return {
      id,
      left: 34 + Math.random() * 62,
      top: 8 + Math.random() * 84,
      size: 2.2 + Math.random() * 2.4,
      delay: Math.random() * 8,
      duration: 1.8 + Math.random() * 2.6,
      colorDark: pair.dark,
      colorLight: pair.light,
    };
  });
}

function createMicroPulses(theme: Theme): MicroPulse[] {
  return theme === "light" ? createLightMicroPulses(26) : createDarkMicroPulses(22);
}

export default function HeroNeuralMicroPulses() {
  const { theme } = useTheme();
  const [pulses, setPulses] = useState<MicroPulse[]>([]);

  useEffect(() => {
    setPulses(createMicroPulses(theme));
  }, [theme]);

  if (!pulses.length) return null;

  return (
    <div className="hero-neural-micro-pulses" aria-hidden="true">
      {pulses.map((pulse) => (
        <span
          key={pulse.id}
          className={`hero-neural-micro-pulse hero-neural-micro-pulse--${theme}`}
          style={{
            left: `${pulse.left}%`,
            top: `${pulse.top}%`,
            width: `${pulse.size}px`,
            height: `${pulse.size}px`,
            ...(pulse.color
              ? { ["--pulse-color" as string]: pulse.color, backgroundColor: pulse.color }
              : {
                  ["--pulse-dark" as string]: pulse.colorDark,
                  ["--pulse-light" as string]: pulse.colorLight,
                  backgroundColor: pulse.colorDark,
                }),
            animationDuration: `${pulse.duration}s`,
            animationDelay: `${pulse.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
