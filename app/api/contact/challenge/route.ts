import { NextResponse } from "next/server";
import { createMathChallenge } from "@/lib/contactCaptcha";

export async function GET() {
  const challenge = createMathChallenge();
  return NextResponse.json(challenge, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
