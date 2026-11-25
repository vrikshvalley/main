/**
 * Only same-site paths may be used as a post-login redirect. The `redirect`
 * query parameter is attacker-controllable: without this, a link such as
 * /auth/signin?redirect=https://evil.example would send a freshly signed-in
 * customer to a phishing page.
 */
export function safeRedirect(value, fallback = "/") {
  if (typeof value !== "string") return fallback;
  const v = value.trim();
  // Must be a single-slash path: not "//host", "/\host", "https://...", "javascript:..."
  if (!v.startsWith("/") || v.startsWith("//") || v.startsWith("/\\")) return fallback;
  // No control characters (CR/LF etc.)
  for (let i = 0; i < v.length; i++) {
    if (v.charCodeAt(i) < 32) return fallback;
  }
  return v;
}
