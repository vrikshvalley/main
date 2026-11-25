import { auth } from "@/lib/firebaseConfig";

/**
 * fetch() that attaches the signed-in user's Firebase ID token, for API routes
 * guarded by requireAuth (lib/serverAuth.js).
 */
export async function authFetch(url, options = {}) {
  const token = await auth.currentUser?.getIdToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(url, { ...options, headers });
}
