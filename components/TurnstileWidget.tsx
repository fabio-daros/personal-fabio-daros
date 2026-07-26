"use client";

import { useEffect, useRef } from "react";

type TurnstileApi = {
  ready: (callback: () => void) => void;
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme?: "light" | "dark" | "auto";
      callback?: (token: string) => void;
      "error-callback"?: () => void;
      "expired-callback"?: () => void;
      "timeout-callback"?: () => void;
    }
  ) => string;
  remove: (widgetId: string) => void;
  reset: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type TurnstileWidgetProps = {
  onTokenChange: (token: string) => void;
  onStatusChange: (status: "loading" | "ready" | "error") => void;
  resetSignal?: number;
};

const SCRIPT_ID = "cf-turnstile-script";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const LOAD_TIMEOUT_MS = 8000;

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("ssr"));
  if (window.turnstile) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if (window.turnstile) {
        resolve();
        return;
      }
      const onLoad = () => resolve();
      const onError = () => reject(new Error("Turnstile script failed"));
      existing.addEventListener("load", onLoad, { once: true });
      existing.addEventListener("error", onError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Turnstile script failed"));
    document.head.appendChild(script);
  });
}

export function isTurnstileConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim());
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

  onTokenChangeRef.current = onTokenChange;
  onStatusChangeRef.current = onStatusChange;

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
    if (!siteKey) {
      onStatusChangeRef.current("error");
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      if (!cancelled) onStatusChangeRef.current("error");
    }, LOAD_TIMEOUT_MS);

    onStatusChangeRef.current("loading");
    onTokenChangeRef.current("");

    (async () => {
      try {
        await loadTurnstileScript();
        if (cancelled || !containerRef.current || !window.turnstile) {
          throw new Error("Turnstile unavailable");
        }

        await new Promise<void>((resolve) => {
          window.turnstile!.ready(() => resolve());
        });

        if (cancelled || !containerRef.current || !window.turnstile) {
          throw new Error("Turnstile unavailable");
        }

        if (widgetIdRef.current) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            // ignore
          }
          widgetIdRef.current = null;
        }

        containerRef.current.innerHTML = "";

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: "dark",
          callback: (token) => {
            onTokenChangeRef.current(token);
            onStatusChangeRef.current("ready");
          },
          "error-callback": () => {
            onTokenChangeRef.current("");
            onStatusChangeRef.current("error");
          },
          "expired-callback": () => {
            onTokenChangeRef.current("");
          },
          "timeout-callback": () => {
            onTokenChangeRef.current("");
            onStatusChangeRef.current("error");
          },
        });

        window.clearTimeout(timeoutId);
        if (!cancelled) onStatusChangeRef.current("ready");
      } catch {
        window.clearTimeout(timeoutId);
        if (!cancelled) onStatusChangeRef.current("error");
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }
    };
  }, [resetSignal]);

  return (
    <div ref={hostRef} className="contact-turnstile-wrap">
      <div ref={containerRef} className="contact-turnstile" />
    </div>
  );
}
