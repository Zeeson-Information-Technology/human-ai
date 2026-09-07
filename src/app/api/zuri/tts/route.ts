// POST /api/zuri/tts  { text }
// Returns base64 audio mp3 for quick client playback in dev.
// Now using Google Text-to-Speech instead of AWS Polly.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { synthesizeWithGoogleTTS } from "@/lib/google-tts";

export async function POST(req: NextRequest) {
  try {
    const { text } = (await req.json().catch(() => ({}))) as { text?: string };
    if (!text || text.trim().length < 2) {
      return NextResponse.json({ ok: false, error: "Text required" }, { status: 400 });
    }

    // Use Google TTS
    const audioBuffer = await synthesizeWithGoogleTTS(text, {
      voiceName: process.env.GOOGLE_TTS_VOICE || "en-US-Neural2-J",
      speakingRate: 1.0,
      pitch: 0.0,
      useSsml: false,
    });

    const b64 = audioBuffer.toString("base64");
    return NextResponse.json({ ok: true, audioBase64: b64, contentType: "audio/mpeg" });
  } catch (e) {
    console.error("tts error", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

