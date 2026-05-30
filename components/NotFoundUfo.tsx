"use client";

import { useEffect, useRef } from "react";
import lottie from "lottie-web/build/player/lottie_svg";

const UFO_JSON_URL = "/assets/lottie/ufo.json";

export default function NotFoundUfo() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animation: ReturnType<typeof lottie.loadAnimation> | null = null;
    let cancelled = false;

    void fetch(UFO_JSON_URL, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error(`UFO JSON ${response.status}`);
        return response.json();
      })
      .then((animationData) => {
        if (cancelled || !containerRef.current) return;

        animation = lottie.loadAnimation({
          container: containerRef.current,
          renderer: "svg",
          loop: true,
          autoplay: true,
          animationData,
          rendererSettings: {
            preserveAspectRatio: "xMidYMid meet",
          },
        });
      })
      .catch((error) => {
        console.error("Failed to load UFO animation", error);
      });

    return () => {
      cancelled = true;
      animation?.destroy();
    };
  }, []);

  return <div ref={containerRef} className="not-found__ufo" aria-hidden="true" />;
}
