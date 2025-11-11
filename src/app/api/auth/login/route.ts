// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import User from "@/model/user";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signToken } from "@/lib/auth";

// Accept only valid backend roles; normalize aliases later
const LoginSchema = z.object({
  role: z.string().optional(), // Accept any string, normalize below
  email: z.string().email(),
  password: z.string().min(6),
  remember: z.boolean().optional(),
});

export async function POST(req: Request) {
  await dbConnect();

  let body = await req.json().catch(() => ({}));

  // Normalize role if present
  if (body.role === "client") body.role = "company";
  if (body.role === "candidate") body.role = "talent";
  // role is optional and not used for DB lookup

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid input" },
      { status: 400 }
    );
  }

  const { email, password, remember } = parsed.data;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "No account found for this email." },
      { status: 401 }
    );
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { ok: false, error: "Incorrect password." },
      { status: 401 }
    );
  }

  // Use DB role as the truth. Apply remember-me to JWT expiry as well.
  const jwtTtl: "30d" | "1h" = remember ? "30d" : "1h";
  const token = signToken(
    {
      userId: String(user._id),
      email: user.email,
      role: user.role,
    },
    { expiresIn: jwtTtl }
  );

  const res = NextResponse.json({
    ok: true,
    user: {
      id: String(user._id),
      email: user.email,
      role: user.role,
      name: user.name,
      company: user.company,
      isVerified: user.isVerified ?? false,
      mustChangePassword: user.mustChangePassword ?? false, // <-- add this
    },
  });

  // If remember is true, keep users signed in longer (30 days); else ~1 hour
  const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60; // seconds
  res.cookies.set("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });

  // Clear legacy admin cookie that could overshadow `token` when expired
  // (some server helpers previously prioritized `admin_token`).
  res.cookies.set("admin_token", "", { path: "/", maxAge: 0 });

  return res;
}
