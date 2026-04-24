// ================================
// FILE: src/app/api/admin/jobs/[code]/route.ts
// Admin: GET/PUT/DELETE job by short code
// ================================
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import { verifyToken } from "@/lib/auth";
import { isPlatformAdminRole, isScopedStaffRole } from "@/lib/admin-auth";
import { Job } from "@/model/opportunity";

function unauthorized() {
  return NextResponse.json(
    { ok: false, error: "Unauthorized" },
    { status: 401 }
  );
}

function normalizeCode(raw: string | undefined) {
  return (raw || "").trim().toUpperCase();
}

function getActor(req: NextRequest) {
  const token =
    req.cookies.get("admin_token")?.value || req.cookies.get("token")?.value || "";
  const payload = verifyToken(token);
  const role = String(payload?.role || "");
  if (!payload?.userId || (!isPlatformAdminRole(role) && !isScopedStaffRole(role))) {
    return null;
  }
  return { id: String(payload.userId), role };
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ code: string }> }
) {
  const actor = getActor(req);
  if (!actor) return unauthorized();
  await dbConnect();

  const { code: raw } = await ctx.params;
  const code = normalizeCode(raw);
  if (!code) {
    return NextResponse.json(
      { ok: false, error: "Missing code" },
      { status: 400 }
    );
  }

  const doc = await Job.findOne({ code }).lean();
  if (!doc)
    return NextResponse.json(
      { ok: false, error: "Not found" },
      { status: 404 }
    );

  if (
    !isPlatformAdminRole(actor.role) &&
    String((doc as any).assignedUserId || "") !== actor.id
  ) {
    return NextResponse.json(
      { ok: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  return NextResponse.json({ ok: true, job: doc }, { status: 200 });
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ code: string }> }
) {
  const actor = getActor(req);
  if (!actor || !isPlatformAdminRole(actor.role)) return unauthorized();

  try {
    await dbConnect();

    const { code: raw } = await ctx.params;
    const code = normalizeCode(raw);
    if (!code) {
      return NextResponse.json(
        { ok: false, error: "Missing code" },
        { status: 400 }
      );
    }

    const patch = await req.json();

    // never allow changing the code from this route
    delete patch.code;
    // normalize interviewType if it comes from UI (already aligned with model)
    if (patch.interviewType && typeof patch.interviewType === "string") {
      patch.interviewType = patch.interviewType;
    }
    // swap salary bounds if inverted
    if (
      typeof patch.monthlySalaryMin === "number" &&
      typeof patch.monthlySalaryMax === "number" &&
      patch.monthlySalaryMin > patch.monthlySalaryMax
    ) {
      [patch.monthlySalaryMin, patch.monthlySalaryMax] = [
        patch.monthlySalaryMax,
        patch.monthlySalaryMin,
      ];
    }

    const updated = await Job.findOneAndUpdate({ code }, patch, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, job: updated }, { status: 200 });
  } catch (e: any) {
    console.error("PUT /api/admin/jobs/[code] error", e);
    return NextResponse.json(
      { ok: false, error: e?.message || "Update failed" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ code: string }> }
) {
  const actor = getActor(req);
  if (!actor || !isPlatformAdminRole(actor.role)) return unauthorized();
  await dbConnect();

  const { code: raw } = await ctx.params;
  const code = normalizeCode(raw);
  if (!code) {
    return NextResponse.json(
      { ok: false, error: "Missing code" },
      { status: 400 }
    );
  }

  await Job.findOneAndDelete({ code });
  return NextResponse.json({ ok: true }, { status: 200 });
}

