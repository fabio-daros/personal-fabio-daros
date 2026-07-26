"use client";

import { useEffect, useRef, useState } from "react";

type TurnstileApi = {
  ready: (callback: () => void) => void;
  render: (
    element: HTMLElement,
    options: {
      sitekey: string;
      theme?: "light" | "dark" | "auto";
      size?: "normal" | "flexible" | "compact";
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

export default function TurnstileWidget({
  onTokenChange,
  onStatusChange,
  resetSignal = 0,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenChangeRef = useRef(onTokenChange);
  const onStatusChangeRef = useRef(onStatusChange);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  useEffect(() => {
    if (!SITE_KEY || !containerRef.current) return;

    let cancelled = false;
    onStatusChangeRef.current?.("loading");

    const mount = async () => {
      try {
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
          size: "flexible",
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
  }, []);

  useEffect(() => {
    if (!resetSignal || !widgetIdRef.current || !window.turnstile) return;
    setFailed(false);
    onTokenChange("");
    onStatusChangeRef.current?.("loading");
    try {
      window.turnstile.reset(widgetIdRef.current);
    } catch {
      /* ignore */
    }
  }, [resetSignal, onTokenChange]);

  if (!SITE_KEY) return null;

  return (
    <div className="contact-turnstile-wrap">
      <div ref={containerRef} className="contact-turnstile" />
      {failed ? (
        <p className="contact-turnstile-error">
          Anti-spam check failed to load. Allow challenges.cloudflare.com (disable Brave shields /
          adblock on this site), confirm fabiodaros.com and www.fabiodaros.com are in the Turnstile
          hostnames, then reload.
        </p>
      ) : null}
    </div>
  );
}

export function isTurnstileConfigured(): boolean {
  return Boolean(SITE_KEY);
}
