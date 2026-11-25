import { NextResponse } from "next/server";
import { validateEmail } from "@/lib/payments/address";
import { jsonError, rateLimited } from "@/lib/server/http";

/** POST /api/newsletter { email } -> appended to the Google Sheet via the Apps Script web app. */
export async function POST(request) {
  const limited = rateLimited(request, "newsletter", { limit: 5 });
  if (limited) return limited;

  const url = process.env.NEWSLETTER_SHEET_URL;
  const secret = process.env.NEWSLETTER_SECRET;
  if (!url || !secret) return jsonError("Newsletter sign-up is not available right now.", 503);

  const { email } = (await request.json().catch(() => ({}))) || {};
  const clean = String(email || "").trim().toLowerCase();
  if (!clean || clean.length > 254 || !validateEmail(clean)) return jsonError("Please enter a valid email address.");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ email: clean, secret, source: "footer" }),
      redirect: "follow",
      signal: AbortSignal.timeout(10_000),
    });
    const data = await res.json().catch(() => ({}));
    if (!data.ok) throw new Error(data.error || `status ${res.status}`);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Newsletter sign-up failed:", e.message);
    return jsonError("Could not subscribe right now. Please try again later.", 502);
  }
}
