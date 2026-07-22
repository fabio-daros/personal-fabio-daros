"use client";

import { useEffect } from "react";
import { scrollToSection } from "@/lib/nav";

export default function HashScroll() {
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;

    const run = () => scrollToSection(hash);
    const id = window.setTimeout(run, 50);
    return () => window.clearTimeout(id);
  }, []);

  return null;
}
