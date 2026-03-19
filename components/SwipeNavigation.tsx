"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";

const PAGES = ["/", "/about", "/resume", "/expertise"] as const;
const SWIPE_THRESHOLD = 100; // mínima distância para considerar swipe (evita acionamento acidental)
const SWIPE_MAX_VERTICAL = 100; // máx movimento vertical para não confundir com scroll
const SWIPE_COOLDOWN_MS = 500; // cooldown para evitar duplo swipe

export default function SwipeNavigation() {
  const pathname = usePathname();
  const router = useTransitionRouter();
  const [canSwipe, setCanSwipe] = useState(true);
  const touchStart = useRef<{ x: number; y: number; id: number } | null>(null);
  const lastSwipeTime = useRef(0);

  const currentIndex = PAGES.indexOf(pathname as (typeof PAGES)[number]);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < PAGES.length - 1;

  const applyTransitionDir = useCallback((dir: "next" | "prev") => {
    const style = document.getElementById("vt-dir-styles") as HTMLStyleElement | null;
    if (style) {
      if (dir === "next") {
        style.textContent = `::view-transition-old(root){animation:vt-slide-out-left .45s cubic-bezier(0.32,0.72,0,1) both}::view-transition-new(root){animation:vt-slide-in-right .45s cubic-bezier(0.32,0.72,0,1) both}`;
      } else {
        style.textContent = `::view-transition-old(root){animation:vt-slide-out-right .45s cubic-bezier(0.32,0.72,0,1) both}::view-transition-new(root){animation:vt-slide-in-left .45s cubic-bezier(0.32,0.72,0,1) both}`;
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
    // Limpar estilos só após a transição terminar (evita usar fallback errado)
    const style = document.getElementById("vt-dir-styles") as HTMLStyleElement | null;
    const t = setTimeout(() => {
      if (style) style.textContent = "";
    }, 600);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    if (!canSwipe) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStart.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          id: e.touches[0].identifier,
        };
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current || !e.changedTouches.length) return;

      // Cooldown: ignora swipe se muito recente (evita duplo disparo)
      const now = Date.now();
      if (now - lastSwipeTime.current < SWIPE_COOLDOWN_MS) {
        touchStart.current = null;
        return;
      }

      // Correlaciona com o mesmo dedo (touch identifier)
      const endTouch = Array.from(e.changedTouches).find(
        (t) => t.identifier === touchStart.current!.id
      );
      if (!endTouch) {
        touchStart.current = null;
        return;
      }

      const diffX = endTouch.clientX - touchStart.current.x;
      const diffY = endTouch.clientY - touchStart.current.y;

      touchStart.current = null;

      if (Math.abs(diffY) > SWIPE_MAX_VERTICAL) return;
      if (diffX < -SWIPE_THRESHOLD && hasNext) {
        lastSwipeTime.current = now;
        goNext();
      } else if (diffX > SWIPE_THRESHOLD && hasPrev) {
        lastSwipeTime.current = now;
        goPrev();
      }
    };

    const handleTouchCancel = () => {
      touchStart.current = null;
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchCancel, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [canSwipe, hasNext, hasPrev, goNext, goPrev]);

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
