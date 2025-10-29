// src/app/api/auth/verify/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import User from "@/model/user";
import { z } from "zod";
import bcrypt from "bcryptjs";

const VerifySchema = z.object({
  email: z.string().email(),
  // accept string or number, we’ll normalize
  code: z.union([z.string(), z.number()]),
});

export async function POST(req: Request) {
  await dbConnect();

  const body = await req.json().catch(() => null);
  const parsed = VerifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid input" },
      { status: 400 }
    );
  }

  const email = String(parsed.data.email).trim().toLowerCase();
  // digits only, trimmed; supports copy/paste with spaces/newlines
  const code = String(parsed.data.code).trim().replace(/\D+/g, "");

  // Require exactly 6 digits
  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json(
      { ok: false, error: "Invalid or expired code" },
      { status: 400 }
    );
  }

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "User not found" },
      { status: 404 }
    );
  }

  // In some parts of your codebase you use `emailVerified`, elsewhere `isVerified`.
  // Honor both to avoid logic drift.
  if (user.isVerified || user.emailVerified) {
    return NextResponse.json({ ok: true, already: true }, { status: 200 });
  }

  const storedCode = user.verifyCode; // could be number, string, or a bcrypt hash
  const expires = user.verifyCodeExpires; // should be a Date or ISO string

  // Basic presence + expiry window
  const expired = !expires || new Date(expires).getTime() < Date.now();
  if (!storedCode || expired) {
    return NextResponse.json(
      { ok: false, error: "Invalid or expired code" },
      { status: 400 }
    );
  }

  // If you stored plaintext (string/number)
  let ok = false;
  if (typeof storedCode === "number" || /^\d{6}$/.test(String(storedCode))) {
    ok = String(storedCode).padStart(6, "0") === code; // pad to preserve leading zeros
  } else {
    // If you stored a bcrypt hash (starts with $2a/$2b/$2y)
    if (/^\$2[aby]\$/.test(String(storedCode))) {
      ok = await bcrypt.compare(code, String(storedCode));
    }
  }

  if (!ok) {
    return NextResponse.json(
      { ok: false, error: "Invalid or expired code" },
      { status: 400 }
    );
  }

  // Mark verified and clear code so it can't be reused
  user.isVerified = true;
  user.emailVerified = true; // keep both flags in sync for now
  user.verifyCode = undefined;
  user.verifyCodeExpires = undefined;
  await user.save();

  return NextResponse.json({ ok: true }, { status: 200 });
}
