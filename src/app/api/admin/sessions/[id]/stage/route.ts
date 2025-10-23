import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Session from "@/model/session";
import { getSessionUser } from "@/lib/auth-utils";

export async function PATCH(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const user = await getSessionUser();

  if (!user || (user.role !== "admin" && user.role !== "company")) {
    return NextResponse.json(
      { ok: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  const body = await _req.json().catch(() => ({}));
  const stage = body?.pipelineStage as
    | "applied"
    | "interviewing"
    | "offer"
    | "contract"
    | "hired"
    | "rejected";

  if (!stage) {
    return NextResponse.json(
      { ok: false, error: "Missing pipelineStage" },
      { status: 400 }
    );
  }

  const s = await Session.findByIdAndUpdate(
    params.id,
    { $set: { pipelineStage: stage } },
    { new: true }
  );

  if (!s) {
    return NextResponse.json(
      { ok: false, error: "Session not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, session: s });
}
