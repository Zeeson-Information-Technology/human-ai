import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import { InterviewSession } from "@/model/interview";
import { Types } from "mongoose";

// POST /api/zuri/sessions/:id/finish?t=TOKEN
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await ctx.params;
    const token = req.nextUrl.searchParams.get("t");

    if (!Types.ObjectId.isValid(id))
      return NextResponse.json(
        { ok: false, error: "Invalid id" },
        { status: 400 }
      );
    if (!token)
      return NextResponse.json(
        { ok: false, error: "Missing token" },
        { status: 401 }
      );

    const session = await InterviewSession.findOne({ _id: id, token });
    if (!session)
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 }
      );

    session.status = "finished";
    await session.save();

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("POST /api/zuri/sessions/:id/finish", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
