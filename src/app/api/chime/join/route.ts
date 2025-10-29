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

function chime(region: string) {
  return new ChimeSDKMeetings({ region, credentials: fromEnv() });
}
const PRIMARY_REGION = need("CHIME_REGION");

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

    // Reuse existing meeting when possible (in stored region if present)
    let meetingId: string | null = (s as any)?.meta?.chimeMeetingId || null;
    let meetingRegion: string = (s as any)?.meta?.chimeRegion || PRIMARY_REGION;
    let meetingObj: any | null = null;
    if (meetingId) {
      try {
        const gm = await chime(meetingRegion).getMeeting({ MeetingId: meetingId });
        meetingObj = gm.Meeting || null;
      } catch {
        meetingId = null;
      }
    }

    if (!meetingId || !meetingObj) {
      const fallbackList = (process.env.CHIME_FALLBACK_REGIONS || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const regions = [PRIMARY_REGION, ...fallbackList];
      for (const region of regions) {
        try {
          const created = await chime(region).createMeeting({
            ClientRequestToken: sessionId,
            MediaRegion: region,
            ExternalMeetingId: sessionId.slice(0, 64),
          });
          meetingObj = created.Meeting!;
          meetingId = meetingObj.MeetingId!;
          meetingRegion = region;
          break;
        } catch (e: any) {
          const msg = String(e?.message || "");
          // Retry on capacity/unavailable/throttle and also on DNS resolution failures
          if (/capacity|unavailable|throttl/i.test(msg) || /ENOTFOUND/i.test(msg)) {
            continue; // try next region
          }
          throw e;
        }
      }
      if (!meetingId || !meetingObj) throw new Error("Chime meeting creation failed in all regions");
      // persist meeting id + region on session
      (s as any).meta = { ...((s as any).meta || {}), chimeMeetingId: meetingId, chimeRegion: meetingRegion };
      try { await s.save(); } catch {}
    }

    const attendee = await chime(meetingRegion).createAttendee({
      MeetingId: meetingId!,
      ExternalUserId: `${sessionId}-${Math.random().toString(36).slice(2,8)}`,
    });

    return NextResponse.json({
      ok: true,
      meetingData: { Meeting: meetingObj, Attendee: attendee.Attendee },
    });
  } catch (err: any) {
    console.error("Chime join error:", err);
    const raw = String(err?.message || "");
    const msg = /Missing env/.test(raw)
      ? err.message
      : err?.name === "CredentialsProviderError"
      ? "AWS credentials are not set correctly"
      : /ENOTFOUND/i.test(raw)
      ? `Network/DNS error contacting AWS Chime endpoint. Check internet, VPN/firewall, and region (${PRIMARY_REGION}).`
      : raw || "Failed to create meeting";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
