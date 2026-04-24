// ================================
// FILE: src/app/api/admin/sessions/[id]/route.ts
// GET: admin session detail (tokenless), PATCH: verdict/summary/notes/stage/offer
// ================================
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/db-connect";
import { Job } from "@/model/opportunity";
import Session from "@/model/session";
import { isPlatformAdminRole, isScopedStaffRole } from "@/lib/admin-auth";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

// ----- GET -----
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const adminCookie = req.cookies.get("admin_token")?.value || "";
    const userCookie = req.cookies.get("token")?.value || "";
    const payload = verifyToken(adminCookie || userCookie || "");
    const role = String(payload?.role || "");
    if (!payload?.userId || (!isPlatformAdminRole(role) && !isScopedStaffRole(role))) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    await dbConnect();
    const { id: pid } = await ctx.params;
    const id = (pid || "").trim();
    if (!id || !Types.ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });
    }
    const session = await Session.findById(new Types.ObjectId(id), {
      token: 0, // never leak
    }).lean();
    if (!session)
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 }
      );

    if (!isPlatformAdminRole(role)) {
      const workspace = session.jobCode
        ? await Job.findOne(
            { code: session.jobCode },
            { assignedUserId: 1 }
          ).lean()
        : null;
      if (!workspace || String((workspace as any).assignedUserId || "") !== String(payload.userId)) {
        return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json({ ok: true, session }, { status: 200 });
  } catch (e) {
    console.error("GET /api/admin/sessions/[id] error", e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}

// ----- PATCH -----

// Reuse your existing fields…
const BasePatchSchema = z.object({
  verdict: z.enum(["strong-hire", "hire", "no-hire"]).optional(),
  summary: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

// New: stage + offer (normalized to Session.pipelineStage)
// Model stages: applied | interviewing | offer | contract | hired | rejected
const AllowedStages = [
  "applied",
  "interviewing",
  "offer",
  "contract",
  "hired",
  "rejected",
] as const;
// Accept common synonyms from the UI and map them to the model
const AcceptedStages = [
  ...AllowedStages,
  "screening", // -> interviewing
  "offered", // -> offer
] as const;
type AcceptedStage = (typeof AcceptedStages)[number];

function normalizeStage(s?: string | null): (typeof AllowedStages)[number] | null {
  if (!s) return null;
  const v = s.toLowerCase().trim() as AcceptedStage;
  if ((AllowedStages as readonly string[]).includes(v)) return v as any;
  if (v === "screening") return "interviewing";
  if (v === "offered") return "offer";
  return null;
}

const OfferSchema = z.object({
  title: z.string().trim().optional(),
  rate: z.number().finite().nonnegative().optional(),
  currency: z.enum(["USD", "CAD", "EUR", "GBP", "NGN"]).optional(),
  type: z.enum(["full-time", "part-time", "hourly", "contract"]).optional(),
  startDate: z.string().trim().optional(), // ISO date string (store/parse on client as needed)
  notes: z.string().trim().optional(),
  status: z
    .enum(["draft", "sent", "accepted", "declined", "withdrawn"])
    .optional(),
});

const PatchSchema = BasePatchSchema.extend({
  // accept either key; will normalize
  stageStatus: z.enum(AcceptedStages).optional(),
  pipelineStage: z.enum(AcceptedStages).optional(),
  offer: OfferSchema.optional(),
});

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const adminCookie = req.cookies.get("admin_token")?.value || "";
    const userCookie = req.cookies.get("token")?.value || "";
    const payload = verifyToken(adminCookie || userCookie || "");
    const role = String(payload?.role || "");
    if (!payload?.userId || (!isPlatformAdminRole(role) && !isScopedStaffRole(role))) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    await dbConnect();

    const { id: pid } = await ctx.params;
    const id = (pid || "").trim();
    if (!id || !Types.ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = PatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid body" },
        { status: 400 }
      );
    }

    const sets: Record<string, any> = {};

    // existing fields
    if (parsed.data.verdict) sets["scorecard.verdict"] = parsed.data.verdict;
    if (typeof parsed.data.summary === "string")
      sets["scorecard.summary"] = parsed.data.summary;
    if (typeof parsed.data.notes === "string")
      sets["notes"] = parsed.data.notes;

    // NEW: stage (normalize to model's pipelineStage)
    const stageIn = parsed.data.pipelineStage || parsed.data.stageStatus;
    const stage = normalizeStage(stageIn || null);
    if (stage) {
      sets["pipelineStage"] = stage;
      // when moving to terminal stages, mark as finished
      if (["offer", "hired", "rejected"].includes(stage)) {
        sets["status"] = "finished";
        if (!sets["finishedAt"]) sets["finishedAt"] = new Date();
      }
    }

    // NEW: offer
    if (parsed.data.offer) {
      const o = parsed.data.offer;
      const offer: Record<string, any> = {};
      if (o.title !== undefined) offer.title = o.title;
      if (o.rate !== undefined) offer.rate = o.rate;
      if (o.currency !== undefined) offer.currency = o.currency;
      if (o.type !== undefined) offer.type = o.type;
      if (o.startDate !== undefined) offer.startDate = o.startDate;
      if (o.notes !== undefined) offer.notes = o.notes;
      if (o.status !== undefined) offer.status = o.status;
      sets["offer"] = offer;
    }

    if (!Object.keys(sets).length) {
      return NextResponse.json(
        { ok: false, error: "No changes" },
        { status: 400 }
      );
    }

    const current = await Session.findById(new Types.ObjectId(id)).lean();
    if (!current)
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 }
      );

    if (!isPlatformAdminRole(role)) {
      const workspace = current.jobCode
        ? await Job.findOne(
            { code: current.jobCode },
            { assignedUserId: 1 }
          ).lean()
        : null;
      if (!workspace || String((workspace as any).assignedUserId || "") !== String(payload.userId)) {
        return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
      }
    }

    const updateOps: Record<string, any> = { $set: sets };
    if (stage && stage !== (current.pipelineStage || null)) {
      const stageEntry: Record<string, any> = {
        at: new Date(),
        from: current.pipelineStage || null,
        to: stage,
        role: role || undefined,
      };
      if (payload?.userId) stageEntry.by = new Types.ObjectId(payload.userId);
      updateOps.$push = { stageLog: stageEntry };
    }

    const updated = await Session.findByIdAndUpdate(new Types.ObjectId(id), updateOps, {
      new: true,
      lean: true,
      projection: { token: 0 },
    });
    if (!updated)
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 }
      );

    return NextResponse.json({ ok: true, session: updated }, { status: 200 });
  } catch (e) {
    console.error("PATCH /api/admin/sessions/[id] error", e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}

