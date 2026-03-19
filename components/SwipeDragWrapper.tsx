"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";

const PAGES = ["/", "/about", "/resume", "/expertise"] as const;
const DRAG_RESISTANCE = 0.9; // arraste acompanha o dedo (sensação responsiva)
const RELEASE_THRESHOLD = 0.25; // 25% da tela para confirmar navegação
const SWIPE_COOLDOWN_MS = 350;

export default function SwipeDragWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useTransitionRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canSwipe, setCanSwipe] = useState(true);
  const touchState = useRef<{
    x: number;
    y: number;
    id: number;
  } | null>(null);
  const lastSwipeTime = useRef(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);

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

  const resetTransform = useCallback(() => {
    if (contentRef.current) {
      contentRef.current.style.transform = "";
      contentRef.current.style.transition = "";
    }
    touchState.current = null;
    isHorizontalSwipe.current = null;
  }, []);

  useEffect(() => {
    setCanSwipe(true);
    resetTransform();
    if (currentIndex > 0) router.prefetch(PAGES[currentIndex - 1]);
    if (currentIndex >= 0 && currentIndex < PAGES.length - 1) router.prefetch(PAGES[currentIndex + 1]);
    const style = document.getElementById("vt-dir-styles") as HTMLStyleElement | null;
    const t = setTimeout(() => {
      if (style) style.textContent = "";
    }, 500);
    return () => clearTimeout(t);
  }, [pathname, currentIndex, router, resetTransform]);

  useEffect(() => {
    if (!canSwipe || currentIndex < 0) return;

    const content = contentRef.current;
    const container = containerRef.current;
    if (!content || !container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchState.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          id: e.touches[0].identifier,
        };
        isHorizontalSwipe.current = null;
        content.style.transition = "none";
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchState.current || !e.touches.length) return;

      const touch = Array.from(e.touches).find((t) => t.identifier === touchState.current!.id);
      if (!touch) return;

      const deltaX = touch.clientX - touchState.current.x;
      const deltaY = touch.clientY - touchState.current.y;

      // Define se é swipe horizontal na primeira movimentação significativa
      if (isHorizontalSwipe.current === null && (Math.abs(deltaX) > 15 || Math.abs(deltaY) > 15)) {
        isHorizontalSwipe.current = Math.abs(deltaX) > Math.abs(deltaY);
      }

      if (isHorizontalSwipe.current) {
        e.preventDefault();
        const width = container.offsetWidth;
        let translateX = deltaX * DRAG_RESISTANCE;

        // Limite e resistência nas bordas
        if (translateX > 0 && !hasPrev) translateX = 0;
        if (translateX < 0 && !hasNext) translateX = 0;
        if (hasPrev && translateX > 0) {
          translateX = Math.min(translateX, width * 0.4);
        }
        if (hasNext && translateX < 0) {
          translateX = Math.max(translateX, -width * 0.4);
        }

        content.style.transform = `translateX(${translateX}px)`;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchState.current || !e.changedTouches.length) return;

      const endTouch = Array.from(e.changedTouches).find(
        (t) => t.identifier === touchState.current!.id
      );
      if (!endTouch) {
        resetTransform();
        return;
      }

      const deltaX = endTouch.clientX - touchState.current.x;
      const deltaY = endTouch.clientY - touchState.current.y;
      const width = container.offsetWidth;

      if (isHorizontalSwipe.current) {
        const now = Date.now();
        if (now - lastSwipeTime.current < SWIPE_COOLDOWN_MS) {
          resetTransform();
          return;
        }

        const threshold = width * RELEASE_THRESHOLD;
        if (deltaX < -threshold && hasNext) {
          lastSwipeTime.current = now;
          content.style.transition = "transform 0.2s ease-out";
          content.style.transform = `translateX(-${width}px)`;
          setTimeout(() => goNext(), 50);
        } else if (deltaX > threshold && hasPrev) {
          lastSwipeTime.current = now;
          content.style.transition = "transform 0.2s ease-out";
          content.style.transform = `translateX(${width}px)`;
          setTimeout(() => goPrev(), 50);
        } else {
          content.style.transition = "transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)";
          content.style.transform = "";
        }
      }

      touchState.current = null;
      isHorizontalSwipe.current = null;
    };

    const handleTouchCancel = () => {
      resetTransform();
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    container.addEventListener("touchcancel", handleTouchCancel, { passive: true });
    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [canSwipe, hasPrev, hasNext, goNext, goPrev, resetTransform, currentIndex]);

  return (
    <div ref={containerRef} className="swipe-drag-container">
      <div className="swipe-drag-preview swipe-drag-preview-next" aria-hidden />
      <div className="swipe-drag-preview swipe-drag-preview-prev" aria-hidden />
      <div ref={contentRef} className="swipe-drag-content">
        {children}
      </div>
    </div>
  );
}
