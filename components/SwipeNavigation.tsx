"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";

const PAGES = ["/", "/about", "/resume", "/expertise"] as const;

export default function SwipeNavigation() {
  const pathname = usePathname();
  const router = useTransitionRouter();
  const [canSwipe, setCanSwipe] = useState(true);

  const currentIndex = PAGES.indexOf(pathname as (typeof PAGES)[number]);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < PAGES.length - 1;

  const applyTransitionDir = useCallback((dir: "next" | "prev") => {
    const style = document.getElementById("vt-dir-styles") as HTMLStyleElement | null;
    if (style) {
      if (dir === "next") {
        style.textContent = `::view-transition-old(root){animation:vt-slide-out-left .35s cubic-bezier(0.32,0.72,0,1) both}::view-transition-new(root){animation:vt-slide-in-right .35s cubic-bezier(0.32,0.72,0,1) both}`;
      } else {
        style.textContent = `::view-transition-old(root){animation:vt-slide-out-right .35s cubic-bezier(0.32,0.72,0,1) both}::view-transition-new(root){animation:vt-slide-in-left .35s cubic-bezier(0.32,0.72,0,1) both}`;
      }
    }
  }, []);

  const goPrev = useCallback(() => {
    if (hasPrev) {
      setCanSwipe(false);
      applyTransitionDir("prev");
      router.push(PAGES[currentIndex - 1]);
    }
  }, [currentIndex, hasPrev, router, applyTransitionDir]);

  const goNext = useCallback(() => {
    if (hasNext) {
      setCanSwipe(false);
      applyTransitionDir("next");
      router.push(PAGES[currentIndex + 1]);
    }
  }, [currentIndex, hasNext, router, applyTransitionDir]);

  useEffect(() => {
    setCanSwipe(true);
    // Prefetch das páginas adjacentes para navegação mais rápida (reduz delay)
    if (currentIndex > 0) router.prefetch(PAGES[currentIndex - 1]);
    if (currentIndex >= 0 && currentIndex < PAGES.length - 1) router.prefetch(PAGES[currentIndex + 1]);
    // Limpar estilos só após a transição terminar (evita usar fallback errado)
    const style = document.getElementById("vt-dir-styles") as HTMLStyleElement | null;
    const t = setTimeout(() => {
      if (style) style.textContent = "";
    }, 500);
    return () => clearTimeout(t);
  }, [pathname, currentIndex, router]);

  /* Touch/swipe é tratado pelo SwipeDragWrapper no mobile */

  const goToPage = useCallback(
    (index: number) => {
      if (index === currentIndex) return;
      setCanSwipe(false);
      applyTransitionDir(index > currentIndex ? "next" : "prev");
      router.push(PAGES[index]);
    },
    [currentIndex, router, applyTransitionDir]
  );

  if (currentIndex < 0) return null;

  return (
    <>
      {/* Seta esquerda - página anterior */}
      {hasPrev && (
        <Link
          href={PAGES[currentIndex - 1]}
          className="swipe-nav-btn swipe-nav-prev d-none d-md-flex align-items-center justify-content-center"
          aria-label="Página anterior"
        >
          <i className="bi bi-chevron-left" />
        </Link>
      )}
      {/* Seta direita - próxima página */}
      {hasNext && (
        <Link
          href={PAGES[currentIndex + 1]}
          className="swipe-nav-btn swipe-nav-next d-none d-md-flex align-items-center justify-content-center"
          aria-label="Próxima página"
        >
          <i className="bi bi-chevron-right" />
        </Link>
      )}
      {/* Indicadores de página (bolinhas) - apenas mobile */}
      <nav
        className="swipe-nav-dots d-flex d-md-none align-items-center justify-content-center"
        aria-label="Indicador de páginas"
      >
        {PAGES.map((_, i) => (
          <button
            key={PAGES[i]}
            type="button"
            onClick={() => goToPage(i)}
            className={`swipe-nav-dot ${i === currentIndex ? "active" : ""}`}
            aria-label={`Página ${i + 1}`}
            aria-current={i === currentIndex ? "true" : undefined}
          />
        ))}
      </nav>
    </>
  );
}
