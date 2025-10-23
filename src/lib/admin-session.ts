// src/lib/admin-session.ts
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { isAdminAreaRole } from "@/lib/admin-auth";

export type AdminSession = {
  id: string;
  email: string;
  role: "admin" | "company" | "recruiter" | "manager";
  name?: string;
  company?: string;
  isVerified?: boolean;
  phone?: string;
  linkedin?: string;
  resume?: { url: string; fileName?: string; publicId?: string } | null;
};

/**
 * Lightweight helper for server components to determine if the current
 * request has an admin/company session. Prefers the legacy `admin_token`
 * but also accepts the unified `token` cookie.
 *
 * Intentionally synchronous to match usage in server components.
 */
export function getAdminFromCookies(): AdminSession | null {
  try {
    const jar: any = (cookies as any)();
    const adminCookie: string | undefined = jar?.get?.("admin_token")?.value;
    const userCookie: string | undefined = jar?.get?.("token")?.value;

    const payload = verifyToken(adminCookie || userCookie || "");
    if (!payload || typeof payload === "string") return null;

    const role = String(payload.role || "");
    if (!isAdminAreaRole(role)) return null;

    return {
      id: String(payload.userId || ""),
      email: payload.email,
      role: role as AdminSession["role"],
    };
  } catch {
    return null;
  }
}
