"use client";

import { useEffect } from "react";
import { scrollToSection } from "@/lib/nav";

/** On first paint, scroll to the URL hash if present (e.g. /#about from redirects). */
export default function HashScroll() {
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;

    const run = () => scrollToSection(hash);
    // Wait a tick so section layout is ready after hydration.
    const id = window.setTimeout(run, 50);
    return () => window.clearTimeout(id);
  }, []);

  return null;
}
