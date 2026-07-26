import { createHmac, randomInt, timingSafeEqual } from "crypto";

function captchaSecret(): string {
  return (
    process.env.CONTACT_CAPTCHA_SECRET?.trim() ||
    process.env.RESEND_API_KEY?.trim() ||
    "fabiodaros-contact-captcha-dev"
  );
}

function sign(payload: string): string {
  return createHmac("sha256", captchaSecret()).update(payload).digest("hex");
}

export function createMathChallenge(): { question: string; token: string } {
  const a = randomInt(2, 12);
  const b = randomInt(2, 12);
  const answer = a + b;
  const expiresAt = Date.now() + 15 * 60 * 1000;
  const payload = `${answer}.${expiresAt}`;
  return {
    question: `${a} + ${b}`,
    token: `${payload}.${sign(payload)}`,
  };
}

export function verifyMathChallenge(token: string, answerRaw: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [answer, expiresAt, signature] = parts;
  if (!answer || !expiresAt || !signature) return false;

  const payload = `${answer}.${expiresAt}`;
  const expected = sign(payload);
  const left = Buffer.from(expected);
  const right = Buffer.from(signature);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return false;

  const expiry = Number(expiresAt);
  if (!Number.isFinite(expiry) || Date.now() > expiry) return false;

  const provided = Number(String(answerRaw).trim());
  return Number.isFinite(provided) && provided === Number(answer);
}
