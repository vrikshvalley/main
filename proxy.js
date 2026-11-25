import { NextResponse } from "next/server";

/**
 * Host routing. The staff area lives in this codebase but is only reachable on
 * the admin host (admin.vrikshvalley.com; admin.localhost:3000 for local work).
 *   - admin host: "/" opens the admin app; the shop's pages are not served.
 *   - any other host: "/admin" is a 404, so the shop never exposes it.
 * The admin API is separately protected by a verified Firebase staff token.
 */
export function proxy(request) {
  const host = (request.headers.get("host") || "").toLowerCase();
  const { pathname } = request.nextUrl;
  const isAdminHost = host.startsWith("admin.");
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdminHost) {
    if (pathname === "/") return NextResponse.rewrite(new URL("/admin", request.url));
    if (isAdminPath || pathname.startsWith("/api/")) return NextResponse.next();
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isAdminPath || pathname.startsWith("/api/admin/")) {
    return NextResponse.rewrite(new URL("/__not-found", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Skip Next internals and files with an extension (images, fonts, robots.txt...).
  matcher: ["/((?!_next/|.*[.]).*)"],
};
