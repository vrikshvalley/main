import { NextResponse } from "next/server";
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

/**
 * Server-side Firebase ID-token verification for API routes.
 *
 * verifyIdToken only needs the project id (it checks the token against
 * Google's public keys), so no service-account secret is required here.
 */
function getAdminApp() {
  const existing = getApps().find((a) => a.name === "vv-server-auth");
  if (existing) return existing;
  return initializeApp(
    { projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID },
    "vv-server-auth"
  );
}

/**
 * Returns { user } with the decoded token, or { response } (a 401 NextResponse)
 * that the route should return as-is.
 */
export async function requireAuth(request) {
  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return {
      response: NextResponse.json(
        { error: { message: "Authentication required" } },
        { status: 401 }
      ),
    };
  }

  try {
    const user = await getAuth(getAdminApp()).verifyIdToken(match[1]);
    return { user };
  } catch (error) {
    return {
      response: NextResponse.json(
        { error: { message: "Invalid or expired session" } },
        { status: 401 }
      ),
    };
  }
}

/** The signed-in user if a valid token was sent, otherwise null (never a 401). */
export async function getOptionalUser(request) {
  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  try {
    return await getAuth(getAdminApp()).verifyIdToken(match[1]);
  } catch {
    return null;
  }
}

/**
 * Store staff only: a Firebase user with the custom claim `admin: true`, or a
 * verified email listed in ADMIN_EMAILS (comma-separated).
 */
export async function requireAdmin(request) {
  const auth = await requireAuth(request);
  if (auth.response) return auth;
  const allow = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const email = (auth.user.email || "").toLowerCase();
  const isAdmin = auth.user.admin === true || (auth.user.email_verified && allow.includes(email));
  if (!isAdmin) {
    return {
      response: NextResponse.json({ error: { message: "Not allowed" } }, { status: 403 }),
    };
  }
  return auth;
}
