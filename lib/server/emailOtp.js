import crypto from "crypto";
import { adminDb } from "./firebaseAdmin";
import { sendRawEmail } from "@/lib/services/emailService";

const OTPS = "email_otps";
const OTP_TTL_MS = 10 * 60_000;
const TOKEN_TTL_MS = 30 * 60_000;
const MAX_ATTEMPTS = 5;

function emailKey(email) {
  return crypto.createHash("sha256").update(String(email).trim().toLowerCase()).digest("hex");
}

function hashCode(email, code) {
  return crypto.createHash("sha256").update(`${String(email).trim().toLowerCase()}:${String(code).trim()}`).digest("hex");
}

function tokenSecret() {
  const secret =
    process.env.EMAIL_OTP_SECRET ||
    process.env.RAZORPAY_KEY_SECRET ||
    process.env.FIREBASE_ADMIN_PRIVATE_KEY ||
    process.env.DELHIVERY_WEBHOOK_SECRET;
  if (!secret) throw new Error("Email OTP signing secret is not configured");
  return secret;
}

function safeEqualHex(a, b) {
  const bufA = Buffer.from(String(a), "utf8");
  const bufB = Buffer.from(String(b), "utf8");
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

export function signEmailToken(email) {
  const payload = Buffer.from(
    JSON.stringify({ email: String(email).trim().toLowerCase(), exp: Date.now() + TOKEN_TTL_MS }),
    "utf8"
  ).toString("base64url");
  const sig = crypto.createHmac("sha256", tokenSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyEmailToken(token, expectedEmail) {
  if (typeof token !== "string" || !token.includes(".")) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  let expectedSig;
  try {
    expectedSig = crypto.createHmac("sha256", tokenSecret()).update(payload).digest("base64url");
  } catch {
    return false;
  }
  if (!safeEqualHex(sig, expectedSig)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return (
      Number(data.exp) > Date.now() &&
      String(data.email || "").toLowerCase() === String(expectedEmail || "").trim().toLowerCase()
    );
  } catch {
    return false;
  }
}

export async function sendEmailOtp(rawEmail) {
  const email = String(rawEmail || "").trim().toLowerCase();
  const code = String(crypto.randomInt(100000, 1000000));
  const ref = adminDb().collection(OTPS).doc(emailKey(email));

  await ref.set({
    email,
    code_hash: hashCode(email, code),
    expires_at: Date.now() + OTP_TTL_MS,
    attempts: 0,
    created_at: new Date().toISOString(),
  });

  const { error } = await sendRawEmail({
    to: email,
    subject: `${code} is your Vriksh Valley verification code`,
    text: `Your Vriksh Valley email verification code is ${code}. It expires in 10 minutes.`,
    html: `<div style="font-family:Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
      <h2 style="margin:0 0 8px;color:#073b22;">Verify your email</h2>
      <p style="color:#374151;margin:0 0 16px;">Use this 6-digit code to verify your email for your Vriksh Valley order:</p>
      <div style="font-size:28px;font-weight:700;letter-spacing:6px;color:#073b22;background:#f0fdf4;padding:14px 20px;border-radius:10px;text-align:center;">${code}</div>
      <p style="color:#6b7280;font-size:13px;margin:16px 0 0;">This code expires in 10 minutes. If you didn&apos;t request this, you can ignore it.</p>
    </div>`,
  });
  if (error) {
    throw new Error(error.message || "Could not send verification email");
  }
  return { sent: true };
}

export async function verifyEmailOtp(rawEmail, rawCode) {
  const email = String(rawEmail || "").trim().toLowerCase();
  const code = String(rawCode || "").trim();
  if (!/^\d{6}$/.test(code)) return { ok: false, reason: "Enter the 6-digit code" };

  const ref = adminDb().collection(OTPS).doc(emailKey(email));
  const snap = await ref.get();
  if (!snap.exists) return { ok: false, reason: "Code expired or not found. Please request a new one." };
  const doc = snap.data();

  if (Date.now() > Number(doc.expires_at)) {
    await ref.delete().catch(() => null);
    return { ok: false, reason: "Code expired. Please request a new one." };
  }
  if (Number(doc.attempts || 0) >= MAX_ATTEMPTS) {
    return { ok: false, reason: "Too many wrong attempts. Please request a new code." };
  }

  if (!safeEqualHex(hashCode(email, code), doc.code_hash)) {
    await ref.update({ attempts: Number(doc.attempts || 0) + 1 }).catch(() => null);
    return { ok: false, reason: "Incorrect verification code" };
  }

  await ref.delete().catch(() => null);
  return { ok: true, emailToken: signEmailToken(email) };
}
