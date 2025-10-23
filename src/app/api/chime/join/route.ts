import { NextRequest, NextResponse } from "next/server";
import { ChimeSDKMeetings } from "@aws-sdk/client-chime-sdk-meetings";
import { fromEnv } from "@aws-sdk/credential-providers";
import dbConnect from "@/lib/db-connect";
import Session from "@/model/session";

function need(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

const chime = new ChimeSDKMeetings({
  region: need("CHIME_REGION"),
  credentials: fromEnv(),
});

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get("sessionId") || "";
    const token = url.searchParams.get("token") || "";

    if (!sessionId || !token) {
      return NextResponse.json(
        { ok: false, error: "Missing params" },
        { status: 400 }
      );
    }

    await dbConnect();
    const s: any = await Session.findById(sessionId);
    const authOk = [s?.token, s?.meta?.accessToken, s?.meta?.token]
      .filter(Boolean)
      .includes(token);
    if (!s || !authOk) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const meeting = await chime.createMeeting({
      ClientRequestToken: sessionId,
      MediaRegion: process.env.CHIME_REGION!,
      ExternalMeetingId: sessionId.slice(0, 64),
    });

    const attendee = await chime.createAttendee({
      MeetingId: meeting.Meeting!.MeetingId!,
      ExternalUserId: sessionId,
    });

    return NextResponse.json({
      ok: true,
      meetingData: { Meeting: meeting.Meeting, Attendee: attendee.Attendee },
    });
  } catch (err: any) {
    console.error("Chime join error:", err);
    const msg = /Missing env/.test(err?.message || "")
      ? err.message
      : err?.name === "CredentialsProviderError"
      ? "AWS credentials are not set correctly"
      : err?.message || "Failed to create meeting";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
