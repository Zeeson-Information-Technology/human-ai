// POST /api/zuri/chime/attendee { meetingId: string, externalUserId?: string }
// Creates a Chime attendee for a meeting.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { chimeMeetings } from "@/lib/aws-chime";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { meetingId?: string; externalUserId?: string };
    const MeetingId = (body.meetingId || "").trim();
    if (!MeetingId) return NextResponse.json({ ok: false, error: "meetingId required" }, { status: 400 });
    const ExternalUserId = body.externalUserId || `user-${Date.now()}`;
    const client = await chimeMeetings();
    const { CreateAttendeeCommand } = await import("@aws-sdk/client-chime-sdk-meetings");
    const res = await client.send(new CreateAttendeeCommand({ MeetingId, ExternalUserId }));
    return NextResponse.json({ ok: true, attendee: res.Attendee }, { status: 200 });
  } catch (e) {
    console.error("chime attendee error", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
