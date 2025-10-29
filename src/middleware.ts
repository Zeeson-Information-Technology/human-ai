// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isAdminAreaRole } from "@/lib/admin-auth";

function decodeRoleFromJwt(token: string): string | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  try {
    const json = typeof atob === 'function'
      ? atob(b64)
      : Buffer.from(b64, 'base64').toString('utf-8');
    const payload = JSON.parse(json);
    return typeof payload?.role === "string" ? payload.role : null;
  } catch {
    try {
      // Fallback using global Buffer if available
      const G = globalThis as unknown as { Buffer?: typeof Buffer };
      const buf = G.Buffer?.from
        ? G.Buffer.from(b64, "base64").toString("utf-8")
        : null;
      if (!buf) return null;
      const payload = JSON.parse(buf);
      return typeof payload?.role === "string" ? payload.role : null;
    } catch {
      return null;
    }
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /admin routes
  if (pathname.startsWith("/admin")) {
    // Try to get token from cookies
    const token =
      req.cookies.get("admin_token")?.value ||
      req.cookies.get("token")?.value ||
      "";

    const role = token ? decodeRoleFromJwt(token) : null;
    // Only allow admin area roles (admin, company, recruiter, manager)
    if (!role || !isAdminAreaRole(role)) {
      return NextResponse.redirect(
        new URL("/zuri/start/login?role=admin", req.url)
      );
    }
  }

  // Allow login page and static assets under /_next and /public
  const isLogin = pathname === "/admin/login";
  const isStatic =
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/assets") ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|css|js|map|txt)$/i);

  if (isLogin || isStatic) return NextResponse.next();

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
