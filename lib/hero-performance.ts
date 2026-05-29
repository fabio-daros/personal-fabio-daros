export type HeroPerformanceTier = "full" | "light" | "static";

type NavigatorWithHints = Navigator & {
  deviceMemory?: number;
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
};

/**
 * Picks a hero animation tier from device hints.
 * "static" skips canvas particles; "light" reduces count and effects.
 */
export function getHeroPerformanceTier(): HeroPerformanceTier {
  if (typeof window === "undefined") return "full";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "static";
  }

  const nav = navigator as NavigatorWithHints;
  const memoryGb = nav.deviceMemory;
  const cores = nav.hardwareConcurrency ?? 4;
  const connection = nav.connection;
  const slowNetwork =
    connection?.saveData === true ||
    connection?.effectiveType === "slow-2g" ||
    connection?.effectiveType === "2g";

  if (memoryGb !== undefined && memoryGb <= 2) return "static";
  if (cores <= 2 && memoryGb !== undefined && memoryGb <= 4) return "static";
  if (cores <= 2 || (memoryGb !== undefined && memoryGb <= 4)) return "light";
  if (slowNetwork) return "light";

  return "full";
}

export function microPulseCount(tier: HeroPerformanceTier, theme: "dark" | "light"): number {
  if (tier === "static") return 0;
  if (tier === "light") return theme === "light" ? 10 : 8;
  return theme === "light" ? 26 : 22;
}

export function shouldRenderComet(tier: HeroPerformanceTier): boolean {
  return tier !== "static";
}
