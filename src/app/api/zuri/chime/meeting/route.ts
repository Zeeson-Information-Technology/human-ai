// POST /api/zuri/chime/meeting  { externalMeetingId?: string }
// Creates a Chime SDK meeting.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { chimeMeetings } from "@/lib/aws-chime";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { externalMeetingId?: string };
    const ExternalMeetingId = body.externalMeetingId || `${Date.now()}`;
    const client = await chimeMeetings();
    const { CreateMeetingCommand } = await import("@aws-sdk/client-chime-sdk-meetings");
    const res = await client.send(
      new CreateMeetingCommand({
        ClientRequestToken: ExternalMeetingId,
        ExternalMeetingId,
        MediaRegion: process.env.CHIME_REGION || process.env.AWS_REGION || "us-east-1",
      })
    );
    return NextResponse.json({ ok: true, meeting: res.Meeting }, { status: 200 });
  } catch (e) {
    console.error("chime meeting error", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
