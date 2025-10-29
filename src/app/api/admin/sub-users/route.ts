// src/app/api/admin/sub-users/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import User from "@/model/user";
import { getSessionUser } from "@/lib/auth-utils";
import { z } from "zod";
import bcrypt from "bcryptjs";
import sendEmail from "@/lib/sendSmtpMail";
import {
  canInviteSubUsers,
  companyRootIdOf,
  isAdminAreaRole,
} from "@/lib/admin-auth";
import { Types } from "mongoose";

const InviteSchema = z.object({
  email: z.string().email(),
  // Keep this in sync with your Mongoose enum (reviewer removed):
  role: z.enum(["recruiter", "manager", "admin"]),
});

export async function GET() {
  await dbConnect();
  const me = await getSessionUser();
  if (!me || !isAdminAreaRole(me.role)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const rootId = companyRootIdOf(me);
  const users = await User.find({ parentCompanyId: rootId }).lean();
  return NextResponse.json({ ok: true, users });
}

export async function POST(req: Request) {
  await dbConnect();
  const me = await getSessionUser();
  if (!me || !isAdminAreaRole(me.role)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  if (!canInviteSubUsers(me)) {
    return NextResponse.json(
      { ok: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const parsed = InviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid input" },
      { status: 400 }
    );
  }

  const { email, role } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  // If inviting an admin sub-user, require inviter to be admin OR owner company
  if (
    role === "admin" &&
    !(
      me.role === "admin" ||
      (me.role === "company" && !(me as any).parentCompanyId)
    )
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "Only admins or company owners can invite admin users",
      },
      { status: 403 }
    );
  }

  const rootId = companyRootIdOf(me);
  const existing = await User.findOne({ email: normalizedEmail }).lean();
  if (existing) {
    return NextResponse.json(
      { ok: false, error: "User already exists" },
      { status: 409 }
    );
  }

  const tempPassword =
    Math.random().toString(36).slice(-10) + Math.floor(Math.random() * 1000);
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  await User.create({
    email: normalizedEmail,
    passwordHash,
    role,
    parentCompanyId: new Types.ObjectId(rootId), // explicit cast
    isVerified: false,
    mustChangePassword: true,
    name: normalizedEmail,
    company: (me as any).company || "", // subusers belong to same company label
  });

  try {
    await sendEmail({
      to: email,
      subject: "You've been invited to Eumanai",
      template: "subuser-invite",
      replacements: {
        name: email,
        company: (me as any).company || "",
        tempPassword,
        role,
        url: `${
          process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
        }/zuri/start/login`,
        year: new Date().getFullYear(),
      },
    });
  } catch (e) {
    console.error("Invite email error:", e);
  }

  const users = await User.find({ parentCompanyId: rootId }).lean();
  return NextResponse.json({ ok: true, users });
}
