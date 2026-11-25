import { NextResponse } from "next/server";
import { validateEmail } from "@/lib/payments/address";
import { isAdminConfigured } from "@/lib/server/firebaseAdmin";
import { sendEmailOtp } from "@/lib/server/emailOtp";
import { jsonError, rateLimited } from "@/lib/server/http";

export async function POST(request) {
  const limited = rateLimited(request, "send-email-otp", { limit: 5 });
  if (limited) return limited;
  if (!isAdminConfigured()) return jsonError("Email verification is not configured yet", 503);

  try {
    const body = await request.json().catch(() => null);
    const email = validateEmail(body?.email);
    if (!email) return jsonError("Please enter a valid email address", 400, "EMAIL");

    await sendEmailOtp(email);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("send-otp error:", error.message);
    return jsonError("Could not send verification code. Please try again.", 502);
  }
}
