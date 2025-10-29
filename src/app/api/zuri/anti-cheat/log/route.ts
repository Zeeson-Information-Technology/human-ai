// POST /api/zuri/anti-cheat/log  { sessionId, token, events: [{ type, detail?, ts? }] }
// Appends lightweight anti-cheat events to the session document.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Session from "@/model/session";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json().catch(() => ({}));
    const { sessionId, token, events } = body || {};
    if (!sessionId || !token || !Array.isArray(events) || !events.length) {
      return NextResponse.json({ ok: false, error: "Bad input" }, { status: 400 });
    }

    const safe = events
      .slice(0, 50)
      .map((e: any) => ({ ts: e?.ts ? new Date(e.ts) : new Date(), type: String(e?.type || "unknown").slice(0, 64), detail: e?.detail ? String(e.detail).slice(0, 2000) : undefined }));

    const upd = await Session.updateOne({ _id: sessionId, token }, { $push: { antiCheatEvents: { $each: safe } } });
    if (upd.modifiedCount !== 1) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("anti-cheat/log error", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

