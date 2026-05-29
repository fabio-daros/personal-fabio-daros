"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getHeroPerformanceTier, type HeroPerformanceTier } from "@/lib/hero-performance";

const HeroPerformanceContext = createContext<HeroPerformanceTier>("full");

export function HeroPerformanceProvider({ children }: { children: ReactNode }) {
  const [tier, setTier] = useState<HeroPerformanceTier>(() =>
    typeof window !== "undefined" ? getHeroPerformanceTier() : "full",
  );

  useEffect(() => {
    setTier(getHeroPerformanceTier());
  }, []);

  return <HeroPerformanceContext.Provider value={tier}>{children}</HeroPerformanceContext.Provider>;
}

export function useHeroPerformanceTier(): HeroPerformanceTier {
  return useContext(HeroPerformanceContext);
}
