import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { verifyMathChallenge } from "@/lib/contactCaptcha";

/** Cloudflare documented dummy keys — allowed in local `next dev` only. */
function isCloudflareDummySiteKey(value: string): boolean {
  return /^1x0+AA$/i.test(value) || /^2x0+AB$/i.test(value) || /^3x0+FF$/i.test(value);
}

function isCloudflareDummySecretKey(value: string): boolean {
  return /^1x0+AA$/i.test(value) || /^2x0+BB$/i.test(value) || /^3x0+DD$/i.test(value);
}

function isProductionRuntime(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production"
  );
}

function getTurnstileConfig():
  | { ok: true; siteKey: string; secret: string }
  | { ok: false; reason: string } {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim() ?? "";

  if (!siteKey || !secret) {
    return {
      ok: false,
      reason: "NEXT_PUBLIC_TURNSTILE_SITE_KEY and/or TURNSTILE_SECRET_KEY is missing",
    };
  }

  if (
    isProductionRuntime() &&
    (isCloudflareDummySiteKey(siteKey) || isCloudflareDummySecretKey(secret))
  ) {
    return {
      ok: false,
      reason: "Cloudflare Turnstile dummy/test keys are not allowed in production",
    };
  }

  return { ok: true, siteKey, secret };
}

async function verifyTurnstile(secret: string, token: string, ip: string): Promise<boolean> {
  if (!secret || !token) return false;

  try {
    const body = new URLSearchParams();
    body.set("secret", secret);
    body.set("response", token);
    if (ip && ip !== "unknown") body.set("remoteip", ip);

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const data = (await response.json()) as {
      success?: boolean;
      "error-codes"?: string[];
      hostname?: string;
    };

    if (!response.ok || !data.success) {
      console.warn("[Contact API] Turnstile siteverify rejected", {
        ok: response.ok,
        status: response.status,
        success: data.success,
        errorCodes: data["error-codes"],
        hostname: data.hostname,
      });
      return false;
    }

    return true;
  } catch (err) {
    console.error("[Contact API] Turnstile verify failed:", err);
    return false;
  }
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CONTACT_EMAILS: Record<"pt" | "en", string> = {
  pt: "contato@fabiodaros.com",
  en: "contact@fabiodaros.com",
};

const EMAIL_LABELS: Record<"pt" | "en", { name: string; email: string; subject: string; message: string }> = {
  pt: { name: "Nome", email: "Email", subject: "Assunto", message: "Mensagem" },
  en: { name: "Name", email: "Email", subject: "Subject", message: "Message" },
};

const RESEND_FROM =
  process.env.RESEND_FROM?.trim() || "Fabio Daros Site <noreply@fabiodaros.com>";

const LIMITS = {
  name: 120,
  email: 254,
  subject: 200,
  message: 5000,
} as const;

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 3;

type RateBucket = { count: number; resetAt: number };

const rateBuckets = new Map<string, RateBucket>();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);

  if (!bucket || now >= bucket.resetAt) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (bucket.count >= RATE_LIMIT_MAX) return true;

  bucket.count += 1;
  return false;
}

function readField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeLocale(raw: string): "pt" | "en" {
  return raw === "pt" ? "pt" : "en";
}

export async function POST(request: NextRequest) {
  if (!RESEND_API_KEY) {
    console.error("[Contact API] RESEND_API_KEY is not set");
    return new NextResponse("Email service not configured", { status: 500 });
  }

  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return new NextResponse("Too many requests. Please try again later.", { status: 429 });
  }

  try {
    const formData = await request.formData();

    // Honeypot: real users leave this empty; bots often fill it.
    const honeypot = readField(formData, "company_website");
    if (honeypot) {
      console.info("[Contact API] Rejected honeypot submission", { ip });
      return new NextResponse("OK", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const turnstileConfig = getTurnstileConfig();
    if (!turnstileConfig.ok) {
      console.error("[Contact API] Turnstile configuration missing/invalid:", turnstileConfig.reason);
      return new NextResponse("Anti-spam is not configured", { status: 503 });
    }

    const turnstileToken = readField(formData, "cf-turnstile-response");
    const captchaToken = readField(formData, "captcha_token");
    const captchaAnswer = readField(formData, "captcha_answer");

    let captchaOk = false;
    if (turnstileToken) {
      captchaOk = await verifyTurnstile(turnstileConfig.secret, turnstileToken, ip);
      if (captchaOk) {
        console.info("[Contact API] Turnstile siteverify ok", { ip });
      }
    }
    if (!captchaOk && captchaToken && captchaAnswer) {
      captchaOk = verifyMathChallenge(captchaToken, captchaAnswer);
    }
    if (!captchaOk) {
      return new NextResponse("Captcha verification failed", { status: 403 });
    }

    const locale = normalizeLocale(readField(formData, "locale") || "en");
    const override = process.env.CONTACT_EMAIL_OVERRIDE?.trim();
    const toEmail = override || CONTACT_EMAILS[locale];
    const name = readField(formData, "name");
    const email = readField(formData, "email");
    const subject = readField(formData, "subject");
    const message = readField(formData, "message");

    if (!name || !email || !subject || !message) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    if (
      name.length > LIMITS.name ||
      email.length > LIMITS.email ||
      subject.length > LIMITS.subject ||
      message.length > LIMITS.message
    ) {
      return new NextResponse("One or more fields exceed the allowed length", { status: 400 });
    }

    if (!EMAIL_RE.test(email)) {
      return new NextResponse("Invalid email address", { status: 400 });
    }

    const resend = new Resend(RESEND_API_KEY);
    const labels = EMAIL_LABELS[locale];
    const safeMessageHtml = escapeHtml(message).replace(/\n/g, "<br>");

    const { data, error } = await resend.emails.send({
      from: RESEND_FROM,
      to: toEmail,
      replyTo: email,
      subject: `[Site] ${subject.slice(0, LIMITS.subject)}`,
      text: [
        `${labels.name}: ${name}`,
        `${labels.email}: ${email}`,
        `${labels.subject}: ${subject}`,
        "",
        message,
      ].join("\n"),
      html: `
        <p><strong>${labels.name}:</strong> ${escapeHtml(name)}</p>
        <p><strong>${labels.email}:</strong> ${escapeHtml(email)}</p>
        <p><strong>${labels.subject}:</strong> ${escapeHtml(subject)}</p>
        <hr />
        <p>${safeMessageHtml}</p>
      `,
    });

    if (error) {
      console.error("[Contact API] Resend error:", JSON.stringify(error, null, 2));
      return new NextResponse(error.message || "Failed to send email", { status: 500 });
    }

    console.info("[Contact API] Sent", {
      id: data?.id,
      to: toEmail,
      locale,
      override: Boolean(override),
    });

    return new NextResponse("OK", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Contact API] Exception:", message);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
