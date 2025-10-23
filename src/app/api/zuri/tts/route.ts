// POST /api/zuri/tts  { text }
// Returns base64 audio mp3 for quick client playback in dev.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text } = (await req.json().catch(() => ({}))) as { text?: string };
    if (!text || text.trim().length < 2) {
      return NextResponse.json({ ok: false, error: "Text required" }, { status: 400 });
    }

    const voiceId = process.env.ZURI_TTS_VOICE || "Joanna";
    const { polly } = await import("@/lib/aws-polly");
    const client = await polly();
    const { SynthesizeSpeechCommand } = await import("@aws-sdk/client-polly");
    const cmd = new SynthesizeSpeechCommand({ OutputFormat: "mp3", Text: text, VoiceId: voiceId });
    let res;
    try {
      res = await client.send(cmd);
    } catch (e: any) {
      if (String(e?.code || '').includes('ERR_INVALID_CHAR')) {
        return NextResponse.json(
          {
            ok: false,
            error:
              'Invalid AWS credentials in env (authorization header). Remove quotes/newlines from AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY and restart.',
          },
          { status: 500 }
        );
      }
      throw e;
    }
    const buf = res.AudioStream ? Buffer.from(await res.AudioStream.transformToByteArray()) : Buffer.from([]);
    const b64 = buf.toString("base64");
    return NextResponse.json({ ok: true, audioBase64: b64, contentType: "audio/mpeg" });
  } catch (e) {
    console.error("tts error", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

