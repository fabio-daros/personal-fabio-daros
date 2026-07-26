"use client";

import { useEffect, useRef, useState } from "react";

type TurnstileApi = {
  ready: (callback: () => void) => void;
  render: (
    element: HTMLElement,
    options: {
      sitekey: string;
      theme?: "light" | "dark" | "auto";
      size?: "normal" | "compact";
      appearance?: "always" | "execute" | "interaction-only";
      retry?: "auto" | "never";
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
      "timeout-callback"?: () => void;
    },
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type TurnstileWidgetProps = {
  onTokenChange: (token: string) => void;
  onStatusChange?: (status: "loading" | "ready" | "error") => void;
  resetSignal?: number;
};

const SCRIPT_ID = "cf-turnstile-script";
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || "";

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();

  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    return new Promise((resolve, reject) => {
      if (window.turnstile) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Turnstile script failed")), {
        once: true,
      });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Turnstile script failed"));
    document.head.appendChild(script);
  });
}

function currentTheme(): "light" | "dark" {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function waitUntilVisible(element: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    const visible =
      style.visibility !== "hidden" &&
      style.display !== "none" &&
      Number(style.opacity || "1") > 0.05 &&
      rect.width > 0 &&
      rect.height > 0;

    if (visible) {
      resolve();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        const next = window.getComputedStyle(element);
        if (Number(next.opacity || "1") <= 0.05) return;
        observer.disconnect();
        window.setTimeout(() => resolve(), 120);
      },
      { threshold: 0.2 },
    );

    observer.observe(element);
    window.setTimeout(() => {
      observer.disconnect();
      resolve();
    }, 4000);
  });
}

export default function TurnstileWidget({
  onTokenChange,
  onStatusChange,
  resetSignal = 0,
}: TurnstileWidgetProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenChangeRef = useRef(onTokenChange);
  const onStatusChangeRef = useRef(onStatusChange);
  const [failed, setFailed] = useState(false);
  const [mountKey, setMountKey] = useState(0);

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  useEffect(() => {
    if (!SITE_KEY || !hostRef.current || !containerRef.current) return;

    let cancelled = false;
    onStatusChangeRef.current?.("loading");
    setFailed(false);

    const mount = async () => {
      try {
        await waitUntilVisible(hostRef.current!);
        if (cancelled) return;

        await loadTurnstileScript();
        if (cancelled || !containerRef.current || !window.turnstile) return;

        await new Promise<void>((resolve) => {
          window.turnstile!.ready(() => resolve());
        });
        if (cancelled || !containerRef.current || !window.turnstile) return;

        if (widgetIdRef.current) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            /* ignore */
          }
          widgetIdRef.current = null;
        }

        containerRef.current.innerHTML = "";
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          theme: currentTheme(),
          size: "normal",
          appearance: "always",
          retry: "auto",
          callback: (token) => {
            setFailed(false);
            onStatusChangeRef.current?.("ready");
            onTokenChangeRef.current(token);
          },
          "expired-callback": () => {
            onTokenChangeRef.current("");
            onStatusChangeRef.current?.("loading");
          },
          "timeout-callback": () => {
            onTokenChangeRef.current("");
            setFailed(true);
            onStatusChangeRef.current?.("error");
          },
          "error-callback": () => {
            onTokenChangeRef.current("");
            setFailed(true);
            onStatusChangeRef.current?.("error");
          },
        });
      } catch {
        if (cancelled) return;
        setFailed(true);
        onTokenChangeRef.current("");
        onStatusChangeRef.current?.("error");
      }
    };

    void mount();

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* ignore */
        }
        widgetIdRef.current = null;
      }
    };
  }, [mountKey]);

  useEffect(() => {
    if (!resetSignal) return;
    setMountKey((value) => value + 1);
    onTokenChange("");
    onStatusChangeRef.current?.("loading");
  }, [resetSignal, onTokenChange]);

  if (!SITE_KEY) return null;

  return (
    <div ref={hostRef} className="contact-turnstile-wrap">
      <div ref={containerRef} className="contact-turnstile" />
      {failed ? (
        <p className="contact-turnstile-error">
          Anti-spam check failed to load. If you use Brave/adblock, allow this site (or
          challenges.cloudflare.com), then tap retry.
        </p>
      ) : null}
    </div>
  );
}

export function isTurnstileConfigured(): boolean {
  return Boolean(SITE_KEY);
}
