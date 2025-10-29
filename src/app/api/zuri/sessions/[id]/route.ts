export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/db-connect";
import Session from "@/model/session";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> } // 👈 Promise
) {
  try {
    await dbConnect();

    const { id } = await ctx.params; // 👈 await
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

    const session = await Session.findOne(
      { _id: new Types.ObjectId(id), token },
      {}
    ).lean();
    if (!session)
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 }
      );

    return NextResponse.json({ ok: true, session }, { status: 200 });
  } catch (e) {
    console.error("GET session error", e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
