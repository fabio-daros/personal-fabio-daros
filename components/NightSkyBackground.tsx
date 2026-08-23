"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";

type Star = {
  x: number;
  y: number;
  r: number;
  base: number;
  phase: number;
  speed: number;
};

function buildStars(width: number, height: number): Star[] {
  const density = Math.round((width * height) / 13000);
  const count = Math.min(Math.max(density, 70), 180);
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.35 + 0.25,
    base: Math.random() * 0.5 + 0.22,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.9 + 0.25,
  }));
}

export default function NightSkyBackground() {
  const { theme, mounted } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visible = mounted && theme === "dark";

  useEffect(() => {
    if (!visible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let stars: Star[] = [];
    let raf = 0;
    let disposed = false;
    let running = true;

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = buildStars(width, height);
    };

    const draw = (time: number) => {
      if (disposed) return;
      if (running) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        ctx.clearRect(0, 0, width, height);

        for (const star of stars) {
          const twinkle = 0.55 + 0.45 * Math.sin(time * 0.001 * star.speed + star.phase);
          const alpha = star.base * twinkle;
          ctx.beginPath();
          ctx.fillStyle = `rgba(226, 236, 255, ${alpha})`;
          ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(draw);
    };

    const onVisibility = () => {
      running = document.visibilityState === "visible";
      if (running) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(draw);
      }
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [visible]);

  if (!visible) return null;

  return <canvas ref={canvasRef} className="night-sky" aria-hidden="true" />;
}
