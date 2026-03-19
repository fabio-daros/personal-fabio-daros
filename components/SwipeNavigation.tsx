"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const PAGES = ["/", "/about", "/resume", "/expertise"] as const;
const SWIPE_THRESHOLD = 80; // mínima distância para considerar swipe
const SWIPE_MAX_VERTICAL = 80; // máx movimento vertical para não confundir com scroll

export default function SwipeNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [canSwipe, setCanSwipe] = useState(true);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const currentIndex = PAGES.indexOf(pathname as (typeof PAGES)[number]);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < PAGES.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) {
      setCanSwipe(false);
      router.push(PAGES[currentIndex - 1]);
    }
  }, [currentIndex, hasPrev, router]);

  const goNext = useCallback(() => {
    if (hasNext) {
      setCanSwipe(false);
      router.push(PAGES[currentIndex + 1]);
    }
  }, [currentIndex, hasNext, router]);

  useEffect(() => {
    setCanSwipe(true);
  }, [pathname]);

  useEffect(() => {
    if (!canSwipe) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = endX - touchStart.current.x;
      const diffY = endY - touchStart.current.y;

      if (Math.abs(diffY) > SWIPE_MAX_VERTICAL) return;
      if (diffX < -SWIPE_THRESHOLD && hasNext) goNext();
      else if (diffX > SWIPE_THRESHOLD && hasPrev) goPrev();

      touchStart.current = null;
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [canSwipe, hasNext, hasPrev, goNext, goPrev]);

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
    </>
  );
}
