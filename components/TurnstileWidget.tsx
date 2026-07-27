"use client";

import { useEffect, useRef } from "react";

type TurnstileApi = {
  ready: (callback: () => void) => void;
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme?: "light" | "dark" | "auto";
      size?: "normal" | "compact" | "flexible";
      callback?: (token: string) => void;
      "error-callback"?: (errorCode: string) => void;
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

export type TurnstileStatus = "loading" | "ready" | "error";

/** Only use client-block messaging for these confirmed failure modes. */
export type TurnstileBlockCode = "ERR_BLOCKED_BY_CLIENT" | "blocked:csp";

export type TurnstileFailure = {
  code: string;
  /** True only for ERR_BLOCKED_BY_CLIENT or blocked:csp */
  isClientBlock: boolean;
};

type TurnstileWidgetProps = {
  onTokenChange: (token: string) => void;
  onStatusChange: (status: TurnstileStatus) => void;
  onFailureChange?: (failure: TurnstileFailure | null) => void;
  resetSignal?: number;
};

const SCRIPT_ID = "cf-turnstile-script";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptLoadPromise: Promise<void> | null = null;

const CF_ERROR_HINTS: Record<string, string> = {
  "110100": "Invalid sitekey",
  "110110": "Sitekey not found",
  "110200": "Domain not authorized — add this hostname in Turnstile Hostname Management",
  "400020": "Invalid sitekey (Cloudflare docs). Re-copy Site Key from the Turnstile widget or create a new widget; also common on localhost with production keys",
  "400070": "Sitekey disabled",
};

function describeTurnstileError(code: string): string {
  const hint = CF_ERROR_HINTS[code];
  return hint ? `${code} (${hint})` : code;
}

function isClientBlockCode(code: string): code is TurnstileBlockCode {
  return code === "ERR_BLOCKED_BY_CLIENT" || code === "blocked:csp";
}

function classifyScriptLoadFailure(cspBlocked: boolean): string {
  // Only label a client/CSP block when we have direct evidence.
  // Do not infer Brave/adblock from a generic script.onerror (Safari and others).
  if (cspBlocked) return "blocked:csp";
  return "script_onerror";
}

function ensureTurnstileScript(cspBlockedRef: { current: boolean }): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("ssr"));
  }

  if (window.turnstile) {
    console.info("[Turnstile] window.turnstile available");
    return Promise.resolve();
  }

  // Replace any previous api.js tag that used async/defer (incompatible with ready()).
  const stale = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (stale && (stale.async || stale.defer)) {
    stale.remove();
    scriptLoadPromise = null;
  }

  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise<void>((resolve, reject) => {
    const onReady = () => {
      console.info("[Turnstile] script loaded");
      if (window.turnstile) {
        console.info("[Turnstile] window.turnstile available");
        resolve();
        return;
      }
      scriptLoadPromise = null;
      reject(new Error("turnstile_api_missing"));
    };

    const onFailed = () => {
      scriptLoadPromise = null;
      const code = classifyScriptLoadFailure(cspBlockedRef.current);
      reject(new Error(code));
    };

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if (window.turnstile) {
        onReady();
        return;
      }
      existing.addEventListener("load", onReady, { once: true });
      existing.addEventListener("error", onFailed, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    // Dynamically inserted scripts default to async=true; turnstile.ready() requires
    // async/defer to be absent/false on the api.js tag.
    script.async = false;
    script.addEventListener("load", onReady, { once: true });
    script.addEventListener("error", onFailed, { once: true });
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

export function isTurnstileConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim());
}

export default function TurnstileWidget({
  onTokenChange,
  onStatusChange,
  onFailureChange,
  resetSignal = 0,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenChangeRef = useRef(onTokenChange);
  const onStatusChangeRef = useRef(onStatusChange);
  const onFailureChangeRef = useRef(onFailureChange);

  onTokenChangeRef.current = onTokenChange;
  onStatusChangeRef.current = onStatusChange;
  onFailureChangeRef.current = onFailureChange;

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";
    const siteKeyPresent = Boolean(siteKey);

    console.info("[Turnstile] site key present:", siteKeyPresent, {
      length: siteKey.length,
      // Do not log the key value or any secret.
    });

    if (!siteKeyPresent) {
      console.error("[Turnstile] site key ausente (NEXT_PUBLIC_TURNSTILE_SITE_KEY)");
      onFailureChangeRef.current?.({ code: "missing_sitekey", isClientBlock: false });
      onStatusChangeRef.current("error");
      return;
    }

    // Dummy keys are allowed in `next dev` via .env.development.local only.
    if (
      process.env.NODE_ENV === "production" &&
      (/^1x0+AA$/i.test(siteKey) || /^2x0+AB$/i.test(siteKey) || /^3x0+FF$/i.test(siteKey))
    ) {
      console.error("[Turnstile] Cloudflare dummy/test site key is not allowed in production");
      onFailureChangeRef.current?.({ code: "test_sitekey_forbidden", isClientBlock: false });
      onStatusChangeRef.current("error");
      return;
    }

    let cancelled = false;
    const cspBlockedRef = { current: false };

    const onCspViolation = (event: SecurityPolicyViolationEvent) => {
      const blockedUri = event.blockedURI || "";
      if (blockedUri.includes("challenges.cloudflare.com")) {
        cspBlockedRef.current = true;
        console.error("[Turnstile] CSP blocked challenges.cloudflare.com", {
          violatedDirective: event.violatedDirective,
          blockedURI: blockedUri,
        });
      }
    };

    document.addEventListener("securitypolicyviolation", onCspViolation);

    const reportFailure = (code: string) => {
      if (cancelled) return;
      const isClientBlock = isClientBlockCode(code);
      onFailureChangeRef.current?.({ code, isClientBlock });
      onStatusChangeRef.current("error");
    };

    const clearFailure = () => {
      if (!cancelled) onFailureChangeRef.current?.(null);
    };

    onStatusChangeRef.current("loading");
    onTokenChangeRef.current("");
    clearFailure();

    (async () => {
      try {
        await ensureTurnstileScript(cspBlockedRef);
        if (cancelled || !containerRef.current || !window.turnstile) return;

        const renderWidget = () => {
          if (cancelled || !containerRef.current || !window.turnstile) return;

          if (widgetIdRef.current) {
            try {
              window.turnstile.remove(widgetIdRef.current);
            } catch {
              // ignore
            }
            widgetIdRef.current = null;
          }

          // Plain container only — do not use className="cf-turnstile" (implicit mode).
          containerRef.current.innerHTML = "";

          const activeWidgetId = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            theme: "dark",
            size: "normal",
            callback: (token) => {
              if (cancelled || widgetIdRef.current !== activeWidgetId) return;
              console.info("[Turnstile] token received");
              onTokenChangeRef.current(token);
              clearFailure();
              onStatusChangeRef.current("ready");
            },
            "error-callback": (errorCode) => {
              if (cancelled || widgetIdRef.current !== activeWidgetId) return;
              const code = String(errorCode || "unknown_cf_error");
              const host = window.location.hostname;
              console.error(
                `Turnstile error: ${describeTurnstileError(code)} | hostname=${host} origin=${window.location.origin}`
              );
              if (code === "400020" && (host === "localhost" || host === "127.0.0.1")) {
                console.error(
                  "[Turnstile] Production sitekeys often reject localhost. Use http://localhost.fabiodaros.com:3000 (add 127.0.0.1 localhost.fabiodaros.com to /etc/hosts). Cloudflare docs: production keys should not rely on localhost."
                );
              }
              onTokenChangeRef.current("");
              reportFailure(code);
            },
            "expired-callback": () => {
              if (cancelled || widgetIdRef.current !== activeWidgetId) return;
              console.info("[Turnstile] token expired");
              onTokenChangeRef.current("");
            },
            "timeout-callback": () => {
              if (cancelled || widgetIdRef.current !== activeWidgetId) return;
              console.error("Turnstile error: timeout");
              onTokenChangeRef.current("");
              reportFailure("timeout");
            },
          });

          widgetIdRef.current = activeWidgetId;

          console.info("[Turnstile] widget rendered", activeWidgetId);
          // Widget is mounted; token may arrive asynchronously via callback.
          if (!cancelled) onStatusChangeRef.current("ready");
        };

        // Official explicit path: ready() then render(). If a prior HMR load used
        // async api.js, ready() throws — script is already available, so render directly.
        try {
          window.turnstile.ready(renderWidget);
        } catch (readyErr) {
          const message = readyErr instanceof Error ? readyErr.message : String(readyErr);
          if (/async\/defer|turnstile\.ready/i.test(message)) {
            console.warn("[Turnstile] ready() rejected async script; rendering after load");
            renderWidget();
          } else {
            throw readyErr;
          }
        }
      } catch (err) {
        if (cancelled) return;
        const code = err instanceof Error ? err.message : "script_load_failed";
        console.error("Turnstile error:", code);
        reportFailure(code);
      }
    })();

    return () => {
      cancelled = true;
      document.removeEventListener("securitypolicyviolation", onCspViolation);
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
      {/* Explicit render target only — do not use className="cf-turnstile". */}
      <div ref={containerRef} className="contact-turnstile-host" />
    </div>
  );
}
