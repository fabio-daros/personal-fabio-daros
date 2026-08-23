export const SITE_SECTIONS = [
  { id: "hero", labelKey: "home" as const, href: "/#hero" },
  { id: "about", labelKey: "about" as const, href: "/#about" },
  { id: "resume", labelKey: "resume" as const, href: "/#resume" },
  { id: "research", labelKey: "research" as const, href: "/#research" },
  { id: "expertise", labelKey: "expertise" as const, href: "/#expertise" },
  { id: "contact", labelKey: "contact" as const, href: "/#contact" },
] as const;

export type SiteSectionId = (typeof SITE_SECTIONS)[number]["id"];

/** Measured sticky header height + gap so titles aren't flush under the header. */
export function getHeaderOffset() {
  const header = document.getElementById("header");
  const height = header?.getBoundingClientRect().height ?? 56;
  return Math.ceil(height) + 20;
}

function setHash(id: string) {
  history.replaceState(null, "", `#${id}`);
}

export function scrollToSection(id: string) {
  if (id === "hero") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setHash("hero");
    return;
  }

  const el = document.getElementById(id);
  if (!el) return;

  const top = window.scrollY + el.getBoundingClientRect().top - getHeaderOffset();
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  setHash(id);
}

/** Scroll so the contact/"Get In Touch" section fills the viewport as well as possible. */
export function scrollToContactSection() {
  const el = document.getElementById("contact");
  if (!el) return;

  const offset = getHeaderOffset();
  const available = window.innerHeight - offset;
  const sectionHeight = el.getBoundingClientRect().height || el.offsetHeight;
  const rectTop = window.scrollY + el.getBoundingClientRect().top;

  if (sectionHeight <= available) {
    const centered = rectTop - (available - sectionHeight) / 2 - offset;
    window.scrollTo({ top: Math.max(0, centered), behavior: "smooth" });
  } else {
    window.scrollTo({ top: Math.max(0, rectTop - offset), behavior: "smooth" });
  }

  setHash("contact");
}
