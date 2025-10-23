export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/db-connect";
import Session from "@/model/session";
import { z } from "zod";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  qText: z.string().min(5),
  followupHint: z.string().optional(),
  source: z.enum(["ai", "admin"]).default("ai"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const id = (params.id || "").trim();
    const token = (req.nextUrl.searchParams.get("t") || "").trim();
    if (!id || !Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { ok: false, error: "Bad session id" },
        { status: 400 }
      );
    }
    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Missing token" },
        { status: 400 }
      );
    }

    const raw = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid body" },
        { status: 400 }
      );
    }

    // Check existence & status first
    const found = await Session.findOne(
      { _id: new Types.ObjectId(id), token },
      { status: 1 }
    ).lean();

    if (!found) {
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 }
      );
    }
    if (found.status === "finished") {
      return NextResponse.json(
        { ok: false, error: "Session finished" },
        { status: 409 }
      );
    }

    const qId = new Types.ObjectId();
    const step = {
      qId,
      qText: parsed.data.qText,
      followupHint: parsed.data.followupHint || undefined,
      source: parsed.data.source,
      // NOTE: your StepSchema doesn't define createdAt—so we don't set it
    };

    const upd = await Session.updateOne(
      { _id: new Types.ObjectId(id), token },
      {
        $push: { steps: step as any },
        $set: { status: "running", startedAt: new Date() },
      }
    );

    if (upd.modifiedCount !== 1) {
      return NextResponse.json(
        { ok: false, error: "Could not append step" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { ok: true, step: { ...step, qId: String(qId) } },
      { status: 200 }
    );
  } catch (e) {
    console.error("append-step error", e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
