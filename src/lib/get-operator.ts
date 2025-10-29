// src/lib/get-operator.ts
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { isAdminAreaRole } from "@/lib/admin-auth";

export async function getOperatorFromCookies() {
  const c = await cookies();
  const token = c.get("admin_token")?.value || c.get("token")?.value || "";
  if (!token) return null;
  const u = verifyToken(token);
  if (u && isAdminAreaRole(u.role)) return u; // { id, email, role, parentCompanyId, company? }
  return null;
}
