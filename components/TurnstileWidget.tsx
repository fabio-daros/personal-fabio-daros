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

export type TurnstileStatus = "loading" | "ready" | "blocked" | "error";

type TurnstileWidgetProps = {
  onTokenChange: (token: string) => void;
  onStatusChange: (status: TurnstileStatus) => void;
  resetSignal?: number;
};

const SCRIPT_ID = "cf-turnstile-script";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const LOAD_TIMEOUT_MS = 15000;

function loadTurnstileScript(): Promise<TurnstileApi> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("blocked"));
  }
  if (window.turnstile) return Promise.resolve(window.turnstile);

  return new Promise((resolve, reject) => {
    const finish = () => {
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error("blocked"));
    };

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if (window.turnstile) {
        resolve(window.turnstile);
        return;
      }
      existing.addEventListener("load", finish, { once: true });
      existing.addEventListener("error", () => reject(new Error("blocked")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = finish;
    script.onerror = () => reject(new Error("blocked"));
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

    const report = (status: TurnstileStatus) => {
      if (!cancelled) onStatusChangeRef.current(status);
    };

    const timeoutId = window.setTimeout(() => {
      if (!cancelled && !rendered) {
        report("blocked");
      }
    }, LOAD_TIMEOUT_MS);

    report("loading");
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
            report("ready");
          },
          "error-callback": () => {
            if (cancelled || rendered) {
              onTokenChangeRef.current("");
              return;
            }
            onTokenChangeRef.current("");
            report("error");
          },
          "expired-callback": () => {
            if (cancelled) return;
            onTokenChangeRef.current("");
          },
          "timeout-callback": () => {
            if (cancelled) return;
            onTokenChangeRef.current("");
            if (!rendered) report("blocked");
          },
        });

        rendered = true;
        window.clearTimeout(timeoutId);
        if (!cancelled) report("ready");
      } catch (err) {
        window.clearTimeout(timeoutId);
        const message = err instanceof Error ? err.message : "";
        report(message === "blocked" ? "blocked" : "error");
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
