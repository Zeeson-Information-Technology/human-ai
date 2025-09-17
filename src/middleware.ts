// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const pass = process.env.ADMIN_PASS;
  if (!pass) return NextResponse.next();

  const auth = req.headers.get("authorization") || "";
  // Expect "Basic base64(username:password)"
  if (!auth.startsWith("Basic ")) {
    return new NextResponse("Auth required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
    });
  }

  const decoded = Buffer.from(auth.slice(6), "base64").toString("utf8");
  const [user, pwd] = decoded.split(":");
  if (!user || pwd !== pass) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
