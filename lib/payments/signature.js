import crypto from "crypto";

/**
 * Razorpay signature checks. Pure functions (secret passed in) so they can be
 * unit-tested; all comparisons are constant-time.
 *
 * Checkout:  HMAC_SHA256(key_secret, `${razorpay_order_id}|${razorpay_payment_id}`)
 * Webhooks:  HMAC_SHA256(webhook_secret, rawRequestBody)
 * https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/build-integration/#verify-payment-signature
 */

export function hmacHex(secret, message) {
  return crypto.createHmac("sha256", secret).update(message).digest("hex");
}

export function safeEqualHex(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a.trim().toLowerCase(), "utf8");
  const bufB = Buffer.from(b.trim().toLowerCase(), "utf8");
  if (bufA.length !== bufB.length || bufA.length === 0) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/** True only if the checkout handler's signature matches this order + payment. */
export function isValidPaymentSignature({ razorpayOrderId, razorpayPaymentId, signature, secret }) {
  if (!secret || !razorpayOrderId || !razorpayPaymentId || !signature) return false;
  return safeEqualHex(signature, hmacHex(secret, `${razorpayOrderId}|${razorpayPaymentId}`));
}

/** True only if the webhook body was signed with our webhook secret. */
export function isValidWebhookSignature({ rawBody, signature, secret }) {
  if (!secret || typeof rawBody !== "string" || !signature) return false;
  return safeEqualHex(signature, hmacHex(secret, rawBody));
}
