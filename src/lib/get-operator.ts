// src/lib/get-operator.ts
import { cookies } from "next/headers";
import { verifyToken, type TokenPayload } from "@/lib/auth";
import { isAdminAreaRole } from "@/lib/admin-auth";

/**
 * Normalize operator payload from cookies for admin/company areas.
 * Ensures `id` is present (mapped from JWT `userId`) so downstream queries work.
 */
export async function getOperatorFromCookies(): Promise<
  | {
      id: string;
      email?: string;
      role?: string;
      parentCompanyId?: string;
      company?: string;
      userId?: string; // keep original for back-compat
    }
  | null
> {
  const c = await cookies();
  const token = c.get("admin_token")?.value || c.get("token")?.value || "";
  if (!token) return null;
  const u: TokenPayload | null = verifyToken(token);
  if (!u || !isAdminAreaRole(u.role)) return null;

  // Map userId -> id for consistency across server helpers
  const id = (u as any).id || u.userId;
  if (!id) return null;

  return {
    id: String(id),
    email: u.email,
    role: u.role,
    // pass-throughs if present (won't harm if absent)
    parentCompanyId: (u as any).parentCompanyId,
    company: (u as any).company,
    userId: u.userId, // optional back-compat
  };
}
