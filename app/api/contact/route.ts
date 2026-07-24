import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

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
const RATE_LIMIT_MAX = 5;

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

    // `override` only means CONTACT_EMAIL_OVERRIDE is set in env (routes all mail to that inbox).
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
