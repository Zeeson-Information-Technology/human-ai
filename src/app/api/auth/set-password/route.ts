import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import User from "@/model/user";
import bcrypt from "bcryptjs";
import { z } from "zod";
import sendEmail from "@/lib/sendSmtpMail";

const SetPasswordSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(6),
  token: z.string().optional(),
});

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();
  const parsed = SetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid input" },
      { status: 400 }
    );
  }
  const { email, password, token } = parsed.data;
  let user;
  if (token) {
    user = await User.findOne({
      verifyCode: token,
      verifyCodeExpires: { $gt: new Date() },
    });
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Invalid or expired token" },
        { status: 400 }
      );
    }
  } else if (email) {
    user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }
  } else {
    return NextResponse.json(
      { ok: false, error: "Missing email or token" },
      { status: 400 }
    );
  }
  const passwordHash = await bcrypt.hash(password, 10);
  user.passwordHash = passwordHash;
  user.mustChangePassword = false;
  user.verifyCode = undefined;
  user.verifyCodeExpires = undefined;
  await user.save();

  // Send password reset success email
  try {
    await sendEmail({
      to: user.email,
      subject: "Your password was changed",
      template: "success-password-reset",
      replacements: {
        name: user.name || user.email,
        year: new Date().getFullYear(),
      },
    });
  } catch (e) {
    // Log but do not block response
    console.error("Failed to send password reset success email", e);
  }

  return NextResponse.json({ ok: true });
}
