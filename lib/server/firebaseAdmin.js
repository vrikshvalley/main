import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Firebase Admin (server only). Orders, payments and stock are written with
 * these privileged credentials, so Firestore rules can block browsers from
 * writing orders at all (see firestore.rules).
 *
 * Provide ONE of:
 *   FIREBASE_SERVICE_ACCOUNT_BASE64   base64 of the service-account JSON, or
 *   FIREBASE_ADMIN_CLIENT_EMAIL + FIREBASE_ADMIN_PRIVATE_KEY
 * (Firebase console > Project settings > Service accounts > Generate new private key.)
 * Works on the free Spark plan: the Admin SDK runs inside our own API routes.
 */

const APP_NAME = "vv-admin";

function readCredentials() {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (b64) {
    const json = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
    return { projectId: json.project_id, clientEmail: json.client_email, privateKey: json.private_key };
  }
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (clientEmail && privateKey) {
    return {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail,
      // .env files usually store the key with literal "\n"
      privateKey: privateKey.replace(/\\n/g, "\n"),
    };
  }
  return null;
}

export function isAdminConfigured() {
  try {
    return Boolean(readCredentials());
  } catch {
    return false;
  }
}

function getAdminApp() {
  if (typeof window !== "undefined") throw new Error("firebaseAdmin is server-only");
  const existing = getApps().find((a) => a.name === APP_NAME);
  if (existing) return existing;
  const creds = readCredentials();
  if (!creds) throw new Error("Firebase Admin credentials are not configured");
  return initializeApp({ credential: cert(creds), projectId: creds.projectId }, APP_NAME);
}

let dbInstance = null;

/** Admin Firestore. Throws if credentials are missing (callers fail closed). */
export function adminDb() {
  if (!dbInstance) dbInstance = getFirestore(getAdminApp());
  return dbInstance;
}

/** Admin Auth (find / create customers at checkout). Throws if credentials are missing. */
export function adminAuth() {
  return getAuth(getAdminApp());
}
