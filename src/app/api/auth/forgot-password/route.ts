import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import User from "@/model/user";
import { z } from "zod";
import sendEmail from "@/lib/sendSmtpMail";
import crypto from "crypto";

const ForgotSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();
  const parsed = ForgotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid input" },
      { status: 400 }
    );
  }
  const { email } = parsed.data;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Don't leak user existence
    return NextResponse.json({ ok: true });
  }

  // Generate a reset token and expiry (1 hour)
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  user.verifyCode = token;
  user.verifyCodeExpires = expires;
  await user.save();

  // Send reset email
  await sendEmail({
    to: user.email,
    subject: "Reset your password",
    template: "reset-password",
    replacements: {
      name: user.name || user.email,
      url: `${
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/zuri/start/reset-password?token=${token}&email=${encodeURIComponent(
        user.email
      )}`,
      year: new Date().getFullYear(),
    },
  });

  return NextResponse.json({ ok: true });
}
