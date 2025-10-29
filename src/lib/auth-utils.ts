// src/lib/auth-utils.ts
import { NextRequest } from "next/server";
import { cookies, headers } from "next/headers";
import { verifyToken, TokenPayload } from "@/lib/auth";

export type SessionUser = {
  id: string;
  email?: string;
  role?: "admin" | "company" | "talent";
  name?: string;
  company?: string;
};

/** Try to read a JWT from common places (Authorization header or cookies). */
export async function extractToken(req?: NextRequest): Promise<string | null> {
  // 1) Authorization: Bearer <token>
  const hdr = req
    ? req.headers.get("authorization")
    : (await headers()).get("authorization");

  if (hdr && hdr.toLowerCase().startsWith("bearer ")) {
    return hdr.slice(7).trim();
  }

  // 2) Cookie candidates (adjust names to your app)
  const jar = req ? req.cookies : await cookies();
  const fromCookie =
    jar.get?.("token")?.value ||
    jar.get?.("auth_token")?.value ||
    jar.get?.("access_token")?.value;

  return fromCookie || null;
}

/** Server-side: returns the user decoded from JWT or null if invalid/missing. */
export async function getSessionUser(
  req?: NextRequest
): Promise<SessionUser | null> {
  const token = await extractToken(req);
  if (!token) return null;

  const payload: TokenPayload | null = verifyToken(token);
  if (!payload?.userId) return null;

  return {
    id: payload.userId,
    email: payload.email,
    role: payload.role as SessionUser["role"],
  };
}
