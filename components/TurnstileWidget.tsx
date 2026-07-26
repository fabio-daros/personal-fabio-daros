"use client";

import { useEffect, useRef } from "react";

type TurnstileApi = {
  ready?: (callback: () => void) => void;
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
const LOAD_TIMEOUT_MS = 15000;

function loadTurnstileScript(): Promise<TurnstileApi> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("ssr"));
  }
  if (window.turnstile) return Promise.resolve(window.turnstile);

  return new Promise((resolve, reject) => {
    const finish = () => {
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error("Turnstile API missing after script load"));
    };

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if (window.turnstile) {
        resolve(window.turnstile);
        return;
      }
      existing.addEventListener("load", finish, { once: true });
      existing.addEventListener("error", () => reject(new Error("Turnstile script failed")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = finish;
    script.onerror = () => reject(new Error("Turnstile script failed"));
    document.head.appendChild(script);
  });
}

async function whenTurnstileReady(api: TurnstileApi): Promise<void> {
  if (typeof api.ready !== "function") return;
  await new Promise<void>((resolve) => {
    api.ready!(() => resolve());
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
    let rendered = false;

    const markError = () => {
      // Only fail the whole widget before a successful render.
      // Post-render error-callback often fires during React remount/remove.
      if (!cancelled && !rendered) {
        onStatusChangeRef.current("error");
      }
    };

    const timeoutId = window.setTimeout(() => {
      if (!cancelled && !rendered) {
        onStatusChangeRef.current("error");
      }
    }, LOAD_TIMEOUT_MS);

    onStatusChangeRef.current("loading");
    onTokenChangeRef.current("");

    (async () => {
      try {
        const api = await loadTurnstileScript();
        if (cancelled || !containerRef.current) return;

        await whenTurnstileReady(api);
        if (cancelled || !containerRef.current || !window.turnstile) return;

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
            if (cancelled) return;
            onTokenChangeRef.current(token);
            onStatusChangeRef.current("ready");
          },
          "error-callback": () => {
            if (cancelled) return;
            onTokenChangeRef.current("");
            // Keep widget status ready if already rendered; user can retry via reset.
            // Fatal only before first successful render.
            markError();
          },
          "expired-callback": () => {
            if (cancelled) return;
            onTokenChangeRef.current("");
          },
          "timeout-callback": () => {
            if (cancelled) return;
            onTokenChangeRef.current("");
            markError();
          },
        });

        rendered = true;
        window.clearTimeout(timeoutId);
        if (!cancelled) onStatusChangeRef.current("ready");
      } catch {
        window.clearTimeout(timeoutId);
        markError();
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
    <div className="contact-turnstile-wrap">
      <div ref={containerRef} className="contact-turnstile" />
    </div>
  );
}
