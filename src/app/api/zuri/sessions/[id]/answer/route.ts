export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/db-connect";
import Session from "@/model/session";
import { z } from "zod";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  qId: z.string().min(8), // the step qId returned by append-step
  audioUrl: z.string().url(),
  audioPublicId: z.string().min(3),
  durationMs: z.number().int().nonnegative().optional(),
  transcriptText: z.string().optional(), // browser STT text
  startedAt: z.string().optional(),
  endedAt: z.string().optional(),
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

    const qId = new Types.ObjectId(parsed.data.qId);

    const upd = await Session.updateOne(
      { _id: new Types.ObjectId(id), token, "steps.qId": qId },
      {
        $set: {
          "steps.$.audioUrl": parsed.data.audioUrl,
          "steps.$.audioPublicId": parsed.data.audioPublicId,
          "steps.$.durationMs": parsed.data.durationMs ?? null,
          "steps.$.answerText": parsed.data.transcriptText ?? "",
          "steps.$.transcript": parsed.data.transcriptText ?? "",
          "steps.$.startedAt": parsed.data.startedAt
            ? new Date(parsed.data.startedAt)
            : undefined,
          "steps.$.endedAt": parsed.data.endedAt
            ? new Date(parsed.data.endedAt)
            : undefined,
        },
      }
    );

    if (upd.matchedCount !== 1) {
      return NextResponse.json(
        { ok: false, error: "Step not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error("answer error", e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
