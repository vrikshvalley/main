import { NextResponse } from "next/server";
import { validateEmail } from "@/lib/payments/address";
import { isAdminConfigured } from "@/lib/server/firebaseAdmin";
import { verifyEmailOtp } from "@/lib/server/emailOtp";
import { claimVerifiedOrder } from "@/lib/server/orders";
import { jsonError, rateLimited } from "@/lib/server/http";

export async function POST(request) {
  const limited = rateLimited(request, "verify-email-otp", { limit: 10 });
  if (limited) return limited;
  if (!isAdminConfigured()) return jsonError("Email verification is not configured yet", 503);

  try {
    const body = await request.json().catch(() => null);
    const email = validateEmail(body?.email);
    if (!email) return jsonError("Please enter a valid email address", 400, "EMAIL");

    const res = await verifyEmailOtp(email, body?.code);
    if (!res.ok) return jsonError(res.reason, 400, "INVALID_OTP");

    if (body?.orderId) {
      await claimVerifiedOrder({ orderId: String(body.orderId), email });
    }

    return NextResponse.json({ success: true, emailToken: res.emailToken });
  } catch (error) {
    console.error("verify-otp error:", error.message);
    return jsonError("Verification failed. Please try again.", 500);
  }
}
