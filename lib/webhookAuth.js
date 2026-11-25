import crypto from "crypto";

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verifies a Delhivery webhook against DELHIVERY_WEBHOOK_SECRET.
 *
 * Accepts either:
 *  - an HMAC-SHA256 hex signature of the raw body in `x-delhivery-signature`, or
 *  - the shared secret itself in `x-webhook-token` / `Authorization: Bearer <secret>`
 *    (use this if the Delhivery dashboard only supports a static token header).
 *
 * Fails closed: with no secret configured, every request is rejected.
 */
export function verifyDelhiveryWebhook(request, rawBody) {
  const secret = process.env.DELHIVERY_WEBHOOK_SECRET;
  if (!secret) return false;

  const signature = request.headers.get("x-delhivery-signature");
  if (signature) {
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    return safeEqual(signature.trim().toLowerCase(), expected);
  }

  const token =
    request.headers.get("x-webhook-token") ||
    (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");

  return Boolean(token) && safeEqual(token, secret);
}
