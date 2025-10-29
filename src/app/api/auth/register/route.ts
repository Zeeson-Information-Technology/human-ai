import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import User from "@/model/user";
import { parsePhone } from "@/lib/phone";
import bcrypt from "bcryptjs";
import { z } from "zod";
import sendEmail from "@/lib/sendSmtpMail";

const RegisterSchema = z.object({
  role: z.enum(["company", "talent"]),
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  company: z.string().min(2).optional(),
  linkedin: z.string().optional(),
  phone: z.string().optional(), // <-- add this
});

export async function POST(req: Request) {
  await dbConnect();
  let body = await req.json();

  // Map frontend role to backend role
  if (body.role === "client") body.role = "company";
  if (body.role === "candidate") body.role = "talent";

  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid input" },
      { status: 400 }
    );
  }
  const { role, email, password, name, company, linkedin, phone } = parsed.data;

  // Require company for company and sub-user roles
  if (
    ["company", "admin", "recruiter", "manager"].includes(role) &&
    (!company || company.trim().length < 2)
  ) {
    return NextResponse.json(
      { ok: false, error: "Company name is required" },
      { status: 400 }
    );
  }

  // Check if user already exists
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    return NextResponse.json(
      { ok: false, error: "Email already registered" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Generate 6-digit code and expiry (15 min)
  const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
  const verifyCodeExpires = new Date(Date.now() + 15 * 60 * 1000);

  const { code: phoneCountryCode, e164: phoneE164 } = parsePhone(phone);

  const user = await User.create({
    email: email.toLowerCase(),
    passwordHash,
    role,
    name,
    company: role === "company" ? company : undefined,
    linkedin: role === "talent" ? linkedin : undefined,
    phone: phoneE164 || phone,
    phoneCountryCode,
    isVerified: false,
    verifyCode,
    verifyCodeExpires,
  });

  // Send verification email
  try {
    await sendEmail({
      to: user.email,
      subject: "Verify your email",
      template: "verify-email", // you need to create this template
      replacements: {
        name: user.name || user.email,
        code: verifyCode,
      },
    });
  } catch (e) {
    // Optionally log/send error, but do not block registration
    console.error("Failed to send verification email:", e);
  }

  return NextResponse.json({
    ok: true,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      company: user.company,
      linkedin: user.linkedin, // <-- add this
      isVerified: user.isVerified,
    },
    verify: { sent: true },
  });
}
