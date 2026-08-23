"use client";

import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
import NightSkyBackground from "@/components/NightSkyBackground";
import type { Locale } from "@/lib/translations";

type ProvidersProps = {
  children: React.ReactNode;
  initialLocale: Locale;
};

export default function Providers({ children, initialLocale }: ProvidersProps) {
  return (
    <ThemeProvider>
      <NightSkyBackground />
      <LanguageProvider initialLocale={initialLocale}>{children}</LanguageProvider>
    </ThemeProvider>
  );
}
