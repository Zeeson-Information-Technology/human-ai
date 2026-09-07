// src/app/api/admin/sub-users/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import User from "@/model/user";
import { getSessionUser } from "@/lib/auth-utils";
import { z } from "zod";
import bcrypt from "bcryptjs";
import sendEmail from "@/lib/sendSmtpMail";
import crypto from "crypto";
import {
  canInviteSubUsers,
  companyRootIdOf,
  getEffectivePermissions,
  isAdminAreaRole,
  normalizeTeamRole,
} from "@/lib/admin-auth";
import { Types } from "mongoose";

const InviteSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().email(),
  role: z.enum(["staff", "admin"]),
});

const UpdateAccessSchema = z.object({
  userId: z.string().trim().min(1),
  action: z.enum(["revoke", "reinvite", "update_permissions"]),
  permissions: z
    .object({
      canCreateOpportunity: z.boolean().optional(),
      canManageInquiries: z.boolean().optional(),
    })
    .optional(),
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
  return NextResponse.json({
    ok: true,
    users: users.map((user: any) => ({
      ...user,
      role: normalizeTeamRole(user.role),
      permissions: getEffectivePermissions(user),
    })),
  });
}

export async function PATCH(req: Request) {
  await dbConnect();
  const me = await getSessionUser();
  if (!me || !isAdminAreaRole(me.role) || !canInviteSubUsers(me)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const parsed = UpdateAccessSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid input" },
      { status: 400 }
    );
  }

  const { userId, action } = parsed.data;
  if (
    String(userId) === String(me.id) &&
    (action === "revoke" || action === "update_permissions")
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          action === "revoke"
            ? "You cannot revoke your own access."
            : "You cannot change your own permissions here.",
      },
      { status: 400 }
    );
  }

  const rootId = companyRootIdOf(me);
  const user = await User.findOne({
    _id: new Types.ObjectId(userId),
    parentCompanyId: new Types.ObjectId(rootId),
  });
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "User not found" },
      { status: 404 }
    );
  }

  if (action === "update_permissions") {
    if (normalizeTeamRole(user.role) !== "staff") {
      return NextResponse.json(
        { ok: false, error: "Permissions can only be changed for staff users." },
        { status: 400 }
      );
    }

    user.set(
      "permissions.canCreateOpportunity",
      Boolean(parsed.data.permissions?.canCreateOpportunity)
    );
    user.set(
      "permissions.canManageInquiries",
      parsed.data.permissions?.canManageInquiries !== false
    );
    user.markModified("permissions");
    await user.save();
  } else if (action === "revoke") {
    user.accessRevokedAt = new Date();
    user.accessRevokedBy = String(me.id) as any;
    await user.save();

    try {
      const companyName = (user.company || "").trim();
      await sendEmail({
        to: user.email,
        subject: "Your Euman Intelligence access has been revoked",
        template: "subuser-revoked",
        replacements: {
          name: (user.name || user.email).split(" ")[0],
          company: companyName,
          companyLine: companyName ? ` for ${companyName}` : "",
          year: new Date().getFullYear(),
        },
      });
    } catch (e) {
      console.error("Revoke email error:", e);
    }
  } else {
    const tempPassword = crypto.randomBytes(16).toString("hex");
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const inviteToken = crypto.randomBytes(32).toString("hex");
    const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const companyName = (user.company || (me as any).company || "").trim();

    user.passwordHash = passwordHash;
    user.mustChangePassword = true;
    user.verifyCode = inviteToken;
    user.verifyCodeExpires = inviteExpires;
    user.accessRevokedAt = null;
    user.accessRevokedBy = null as any;
    user.isVerified = false;
    await user.save();

    try {
      await sendEmail({
        to: user.email,
        subject: "You've been invited to Euman Intelligence",
        template: "subuser-invite",
        replacements: {
          name: (user.name || user.email).split(" ")[0],
          fullName: user.name || user.email,
          company: companyName,
          companyLine: companyName ? ` for ${companyName}` : "",
          role: user.role === "staff" ? "staff member" : "admin",
          url: `${
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
          }/admin/onboarding?token=${inviteToken}&email=${encodeURIComponent(
            user.email
          )}`,
          year: new Date().getFullYear(),
        },
      });
    } catch (e) {
      console.error("Re-invite email error:", e);
    }
  }

  const users = await User.find({ parentCompanyId: rootId }).lean();
  return NextResponse.json({
    ok: true,
    users: users.map((item: any) => ({
      ...item,
      role: normalizeTeamRole(item.role),
      permissions: getEffectivePermissions(item),
    })),
  });
}

export async function DELETE(req: Request) {
  await dbConnect();
  const me = await getSessionUser();
  if (!me || !isAdminAreaRole(me.role) || !canInviteSubUsers(me)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const url = new URL(req.url);
  const userId = (url.searchParams.get("userId") || "").trim();
  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "Invalid input" },
      { status: 400 }
    );
  }
  if (String(userId) === String(me.id)) {
    return NextResponse.json(
      { ok: false, error: "You cannot delete your own account." },
      { status: 400 }
    );
  }

  const rootId = companyRootIdOf(me);
  const user = await User.findOne({
    _id: new Types.ObjectId(userId),
    parentCompanyId: new Types.ObjectId(rootId),
  });
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "User not found" },
      { status: 404 }
    );
  }

  const email = user.email;
  const firstName = (user.name || user.email).split(" ")[0];
  const company = (user.company || "").trim();

  await User.deleteOne({ _id: user._id });

  try {
    await sendEmail({
      to: email,
      subject: "Your Euman Intelligence account has been removed",
      template: "subuser-deleted",
      replacements: {
        name: firstName,
        company,
        companyLine: company ? ` for ${company}` : "",
        year: new Date().getFullYear(),
      },
    });
  } catch (e) {
    console.error("Delete email error:", e);
  }

  const users = await User.find({ parentCompanyId: rootId }).lean();
  return NextResponse.json({
    ok: true,
    users: users.map((item: any) => ({
      ...item,
      role: normalizeTeamRole(item.role),
      permissions: getEffectivePermissions(item),
    })),
  });
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

  const { firstName, lastName, email, role } = parsed.data;
  const normalizedEmail = email.toLowerCase();
  const fullName = `${firstName} ${lastName}`.trim();

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
    const sameTeam =
      String((existing as any).parentCompanyId || "") === String(rootId);

    if (!sameTeam) {
      return NextResponse.json(
        { ok: false, error: "User already exists" },
        { status: 409 }
      );
    }

    const tempPassword = crypto.randomBytes(16).toString("hex");
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const inviteToken = crypto.randomBytes(32).toString("hex");
    const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const companyName = ((me as any).company || "").trim();

    await User.updateOne(
      { _id: (existing as any)._id },
      {
        $set: {
          passwordHash,
          role,
          name: fullName,
          company: companyName,
          mustChangePassword: true,
          verifyCode: inviteToken,
          verifyCodeExpires: inviteExpires,
          accessRevokedAt: null,
          accessRevokedBy: null,
          isVerified: false,
          permissions:
            role === "staff"
              ? {
                  canCreateOpportunity:
                    (existing as any).permissions?.canCreateOpportunity === true,
                  canManageInquiries:
                    (existing as any).permissions?.canManageInquiries !== false,
                }
              : undefined,
        },
      }
    );

    try {
      await sendEmail({
        to: normalizedEmail,
        subject: "You've been invited to Euman Intelligence",
        template: "subuser-invite",
        replacements: {
          name: firstName,
          fullName,
          company: companyName,
          companyLine: companyName ? ` for ${companyName}` : "",
          role: role === "staff" ? "staff member" : "admin",
          url: `${
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
          }/admin/onboarding?token=${inviteToken}&email=${encodeURIComponent(
            normalizedEmail
          )}`,
          year: new Date().getFullYear(),
        },
      });
    } catch (e) {
      console.error("Re-invite existing user email error:", e);
    }

    const users = await User.find({ parentCompanyId: rootId }).lean();
    return NextResponse.json({
      ok: true,
      users: users.map((user: any) => ({
        ...user,
        role: normalizeTeamRole(user.role),
        permissions: getEffectivePermissions(user),
      })),
      resent: true,
    });
  }

  const tempPassword = crypto.randomBytes(16).toString("hex");
  const passwordHash = await bcrypt.hash(tempPassword, 10);
  const inviteToken = crypto.randomBytes(32).toString("hex");
  const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await User.create({
    email: normalizedEmail,
    passwordHash,
    role,
    parentCompanyId: new Types.ObjectId(rootId), // explicit cast
    isVerified: false,
    mustChangePassword: true,
    verifyCode: inviteToken,
    verifyCodeExpires: inviteExpires,
    name: fullName,
    company: (me as any).company || "", // subusers belong to same company label
    permissions:
      role === "staff"
        ? {
            canCreateOpportunity: false,
            canManageInquiries: true,
          }
        : undefined,
  });

  try {
    const companyName = ((me as any).company || "").trim();
    await sendEmail({
      to: email,
      subject: "You've been invited to Euman Intelligence",
      template: "subuser-invite",
      replacements: {
        name: firstName,
        fullName,
        company: companyName,
        companyLine: companyName ? ` for ${companyName}` : "",
        role: role === "staff" ? "staff member" : "admin",
        url: `${
          process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
        }/admin/onboarding?token=${inviteToken}&email=${encodeURIComponent(
          normalizedEmail
        )}`,
        year: new Date().getFullYear(),
      },
    });
  } catch (e) {
    console.error("Invite email error:", e);
  }

  const users = await User.find({ parentCompanyId: rootId }).lean();
  return NextResponse.json({
    ok: true,
    users: users.map((user: any) => ({
      ...user,
      role: normalizeTeamRole(user.role),
      permissions: getEffectivePermissions(user),
    })),
  });
}
