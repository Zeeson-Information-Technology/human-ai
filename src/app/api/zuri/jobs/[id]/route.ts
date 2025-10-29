// src/app/api/zuri/jobs/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import { Job } from "@/model/job";
import { Types } from "mongoose";
import { z } from "zod";

export const dynamic = "force-dynamic";

// GET /api/zuri/jobs/:id   (supports invite code OR ObjectId)
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id: pid } = await ctx.params;
    const raw = (pid || "").trim();
    if (!raw) {
      return NextResponse.json(
        { ok: false, error: "Missing code" },
        { status: 400 }
      );
    }

    const code = raw.toUpperCase();
    const byId = Types.ObjectId.isValid(raw)
      ? { _id: new Types.ObjectId(raw) }
      : null;

    const job = await Job.findOne({
      $or: [{ code }, ...(byId ? [byId] : [])],
    }).lean();
    if (!job) {
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, job }, { status: 200 });
  } catch (e) {
    console.error("GET /api/zuri/jobs/[id] error", e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/zuri/jobs/:id   (edit an existing JD)
const PatchSchema = z.object({
  title: z.string().min(1).optional(),
  company: z.string().optional(),
  roleName: z.string().optional(),
  languages: z.array(z.string()).min(1).optional(),
  jdText: z.string().min(1).optional(),
  focusAreas: z.array(z.string()).optional(),
  adminFocusNotes: z.string().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id: pid } = await ctx.params;
    const raw = (pid || "").trim();
    if (!raw) {
      return NextResponse.json(
        { ok: false, error: "Missing code" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = PatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const code = raw.toUpperCase();
    const byId = Types.ObjectId.isValid(raw)
      ? { _id: new Types.ObjectId(raw) }
      : null;

    const job = await Job.findOneAndUpdate(
      { $or: [{ code }, ...(byId ? [byId] : [])] },
      { $set: parsed.data },
      { new: true, lean: true }
    );

    if (!job) {
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true, job }, { status: 200 });
  } catch (e) {
    console.error("PATCH /api/zuri/jobs/[id] error", e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
