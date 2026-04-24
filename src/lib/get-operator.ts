// src/lib/get-operator.ts
import { cookies } from "next/headers";
import { verifyToken, type TokenPayload } from "@/lib/auth";
import { isAdminAreaRole } from "@/lib/admin-auth";
import dbConnect from "@/lib/db-connect";
import User from "@/model/user";

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
      permissions?: {
        canCreateOpportunity?: boolean;
        canManageInquiries?: boolean;
      };
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

  await dbConnect();
  const user = await User.findById(String(id), {
    email: 1,
    role: 1,
    parentCompanyId: 1,
    company: 1,
    accessRevokedAt: 1,
    permissions: 1,
  }).lean();
  if (!user || (user as any).accessRevokedAt) return null;

  return {
    id: String(id),
    email: (user as any).email || u.email,
    role: (user as any).role || u.role,
    // pass-throughs if present (won't harm if absent)
    parentCompanyId:
      (user as any).parentCompanyId?.toString?.() ||
      (u as any).parentCompanyId,
    company: (user as any).company || (u as any).company,
    permissions: (user as any).permissions || undefined,
    userId: u.userId, // optional back-compat
  };
}
