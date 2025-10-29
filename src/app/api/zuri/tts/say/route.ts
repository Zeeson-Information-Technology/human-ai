import { NextRequest } from "next/server";
import {
  PollyClient,
  SynthesizeSpeechCommand,
  type VoiceId,
  type LanguageCode,
} from "@aws-sdk/client-polly";
import { fromEnv } from "@aws-sdk/credential-providers";

function need(name: string, fallback?: string) {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

const REGION = need("AWS_REGION", "us-east-1");
const VOICE: VoiceId = (process.env.ZURI_TTS_VOICE as VoiceId) || "Amy";
const LANGUAGE: LanguageCode =
  (process.env.TRANSCRIBE_LANGUAGE_CODE as LanguageCode) || "en-GB";

const polly = new PollyClient({
  region: REGION,
  credentials: fromEnv(),
});

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const text = url.searchParams.get("text") || "";
    if (!text.trim()) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing text" }),
        {
          status: 400,
          headers: { "content-type": "application/json" },
        }
      );
    }

    const cmd = new SynthesizeSpeechCommand({
      OutputFormat: "mp3",
      Text: text,
      VoiceId: VOICE,
      Engine: "neural", // falls back if not available for the voice
      LanguageCode: LANGUAGE,
      TextType: "text",
    });

    const data = await polly.send(cmd);
    if (!data.AudioStream) {
      return new Response(JSON.stringify({ ok: false, error: "No audio" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    // data.AudioStream is a stream; return directly as MP3
    return new Response(data.AudioStream as any, {
      status: 200,
      headers: {
        "content-type": "audio/mpeg",
        "cache-control": "no-store",
      },
    });
  } catch (e: any) {
    console.error("TTS error:", e);
    const raw = String(e?.message || "");
    const msg = /ENOTFOUND/i.test(raw)
      ? `Network/DNS error contacting AWS Polly endpoint (region=${REGION}). Check internet/VPN and AWS credentials.`
      : raw || "TTS failed";
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
