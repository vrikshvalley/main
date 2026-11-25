import { NextResponse } from "next/server";
import { ONLINE_PAYMENTS_ENABLED } from "@/lib/commerce";
import { isAdminConfigured } from "./firebaseAdmin";
import { CheckoutError } from "./orders";

export function jsonError(message, status = 400, code) {
  return NextResponse.json({ success: false, error: { message, code } }, { status });
}

/** Maps thrown errors to a safe response (internal details stay in the logs). */
export function handleRouteError(error, label) {
  if (error instanceof CheckoutError) return jsonError(error.message, error.status, error.code);
  console.error(`${label}:`, error);
  return jsonError("Something went wrong. Please try again.", 500, "INTERNAL");
}

/**
 * Payments stay "coming soon" until the client approves them. Every payment
 * route checks this first, so flipping NEXT_PUBLIC_ONLINE_PAYMENTS is the only
 * switch, and a half-configured server refuses instead of taking money it
 * cannot record.
 */
export function paymentsUnavailable() {
  if (!ONLINE_PAYMENTS_ENABLED) return jsonError("Online payment is coming soon. Please order on WhatsApp for now.", 503, "PAYMENTS_DISABLED");
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET || !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
    console.error("Payments enabled but Razorpay keys are missing");
    return jsonError("Online payment is temporarily unavailable.", 503, "NOT_CONFIGURED");
  }
  if (!isAdminConfigured()) {
    console.error("Payments enabled but Firebase Admin credentials are missing");
    return jsonError("Online payment is temporarily unavailable.", 503, "NOT_CONFIGURED");
  }
  return null;
}

// Best-effort per-instance rate limit (serverless instances don't share memory;
// it still blunts scripted abuse of a single instance).
const buckets = new Map();
export function rateLimited(request, key, { limit = 10, windowMs = 60_000 } = {}) {
  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
  const id = `${key}:${ip}`;
  const t = Date.now();
  const b = buckets.get(id);
  if (!b || t - b.start > windowMs) {
    buckets.set(id, { start: t, count: 1 });
    if (buckets.size > 5000) buckets.clear();
    return null;
  }
  b.count += 1;
  return b.count > limit ? jsonError("Too many attempts. Please wait a minute and try again.", 429, "RATE_LIMITED") : null;
}

/**
 * Developer test routes (/api/sample-order/*) let the caller choose the amount
 * and book real courier pickups, so they are off in production unless
 * ENABLE_TEST_ROUTES=true is set deliberately.
 */
export function testRoutesDisabled() {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_TEST_ROUTES !== "true") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return null;
}
