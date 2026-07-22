export const SITE_SECTIONS = [
  { id: "hero", labelKey: "home" as const, href: "/#hero" },
  { id: "about", labelKey: "about" as const, href: "/#about" },
  { id: "resume", labelKey: "resume" as const, href: "/#resume" },
  { id: "research", labelKey: "research" as const, href: "/#research" },
  { id: "expertise", labelKey: "expertise" as const, href: "/#expertise" },
  { id: "contact", labelKey: "contact" as const, href: "/#contact" },
] as const;

export type SiteSectionId = (typeof SITE_SECTIONS)[number]["id"];

export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
}
