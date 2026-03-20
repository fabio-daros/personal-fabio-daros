import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CONTACT_EMAILS: Record<string, string> = {
  pt: "contato@fabiodaros.com",
  en: "contact@fabiodaros.com",
};

const EMAIL_LABELS: Record<string, { name: string; email: string; subject: string; message: string }> = {
  pt: { name: "Nome", email: "Email", subject: "Assunto", message: "Mensagem" },
  en: { name: "Name", email: "Email", subject: "Subject", message: "Message" },
};
const RESEND_FROM = process.env.RESEND_FROM || "Fabio Daros <contact@fabiodaros.com>";

export async function POST(request: NextRequest) {
  if (!RESEND_API_KEY) {
    console.error("[Contact API] RESEND_API_KEY is not set. Add it to .env.local");
    return new NextResponse("Email service not configured", { status: 500 });
  }

  try {
    const formData = await request.formData();
    const locale = ((formData.get("locale") as string)?.trim() || "en") as keyof typeof CONTACT_EMAILS;
    const toEmail = CONTACT_EMAILS[locale] || CONTACT_EMAILS.en;
    const name = (formData.get("name") as string)?.trim() || "";
    const email = (formData.get("email") as string)?.trim() || "";
    const subject = (formData.get("subject") as string)?.trim() || "";
    const message = (formData.get("message") as string)?.trim() || "";

    if (!name || !email || !subject || !message) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const resend = new Resend(RESEND_API_KEY);
    const labels = EMAIL_LABELS[locale] || EMAIL_LABELS.en;

    const { data, error } = await resend.emails.send({
      from: RESEND_FROM,
      to: toEmail,
      replyTo: email,
      subject: `[Site] ${subject}`,
      html: `
        <p><strong>${labels.name}:</strong> ${escapeHtml(name)}</p>
        <p><strong>${labels.email}:</strong> ${escapeHtml(email)}</p>
        <p><strong>${labels.subject}:</strong> ${escapeHtml(subject)}</p>
        <hr />
        <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
      `,
    });

    if (error) {
      console.error("[Contact API] Resend error:", JSON.stringify(error, null, 2));
      return new NextResponse(error.message || "Failed to send email", { status: 500 });
    }

    return new NextResponse("OK", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Contact API] Exception:", message, err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
