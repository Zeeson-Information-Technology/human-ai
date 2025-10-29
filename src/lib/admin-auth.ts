// src/lib/admin-auth.ts
import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export type AdminishRole =
  | "admin"
  | "company"
  | "recruiter"
  | "manager";

export function isAdminAreaRole(role?: string): role is AdminishRole {
  return (
    role === "admin" ||
    role === "company" ||
    role === "recruiter" ||
    role === "manager"
  );
}

/**
 * Who can invite?
 * - admin (owner or sub-user) => yes
 * - company (owner) => yes
 * - sub-users (recruiter/manager) => no
 */
export function canInviteSubUsers(user?: {
  role?: string;
  parentCompanyId?: string | null;
}): boolean {
  if (!user?.role) return false;
  if (user.role === "admin") return true; // admin sub-user CAN invite
  if (user.role === "company" && !user.parentCompanyId)
    // owner company user (no parent) CAN invite
    return true;
  return false;
}

// Get the root company id for any user (company or sub-user)
export function companyRootIdOf(user: { parentCompanyId?: unknown; id?: unknown; _id?: unknown; userId?: unknown } | null | undefined): string {
  if (!user) return "";
  // If this is a sub-user, use their parentCompanyId; else use their own id
  if (user.parentCompanyId) return String(user.parentCompanyId as string);
  const primary = (user.id as string) || (user._id as string) || (user.userId as string);
  return primary ? String(primary) : "";
}

/** Existing helper stays as-is, but export for convenience if not already exported. */
export function isAdmin(req: NextRequest) {
  const header = req.headers.get("x-admin-key")?.trim();
  const param = req.nextUrl.searchParams.get("key")?.trim();
  const want = (process.env.ADMIN_API_KEY || "").trim();
  if (want && (header === want || param === want)) return true;

  try {
    const adminCookie = req.cookies.get("admin_token")?.value || "";
    const userCookie = req.cookies.get("token")?.value || "";

    const adminPayload = adminCookie ? verifyToken(adminCookie) : null;
    if (isAdminAreaRole(adminPayload?.role)) return true;

    const userPayload = userCookie ? verifyToken(userCookie) : null;
    if (isAdminAreaRole(userPayload?.role)) return true;

    return false;
  } catch {
    return false;
  }
}
