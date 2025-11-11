import { NextRequest } from "next/server";
import { SynthesizeSpeechCommand, type VoiceId } from "@aws-sdk/client-polly";

// Reuse shared Polly client (env/default chain)
import { polly as getPolly } from "@/lib/aws-polly";

const REGION = process.env.AWS_REGION || "us-east-1";
const DEFAULT_VOICE: VoiceId =
  ((process.env.ZURI_TTS_VOICE as VoiceId) || "Joanna") as VoiceId;

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const text = url.searchParams.get("text") || "";
    const voiceParam = (url.searchParams.get("voice") || "").trim();
    const voice: VoiceId = (voiceParam as VoiceId) || DEFAULT_VOICE;
    if (!text.trim()) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing text" }),
        {
          status: 400,
          headers: { "content-type": "application/json" },
        }
      );
    }

    // Build a resilient call strategy: try neural w/o LanguageCode, then fallback
    const client = await getPolly(REGION);
    const attempts: Array<Record<string, any>> = [
      // Most compatible: let Polly infer language from voice; request neural engine
      { OutputFormat: "mp3", Text: text, VoiceId: voice, Engine: "neural", TextType: "text" },
      // Fallback to standard engine
      { OutputFormat: "mp3", Text: text, VoiceId: voice, TextType: "text" },
    ];

    let lastErr: any = null;
    for (const input of attempts) {
      try {
        const data = await client.send(new SynthesizeSpeechCommand(input));
        if (!data.AudioStream) continue;

        // Normalize to bytes for consistent streaming
        let bytes: Uint8Array | null = null;
        const stream: any = data.AudioStream as any;
        if (stream?.transformToByteArray) {
          bytes = await stream.transformToByteArray();
        }
        if (bytes && bytes.length > 0) {
          return new Response(Buffer.from(bytes), {
            status: 200,
            headers: {
              "content-type": "audio/mpeg",
              "cache-control": "no-store",
            },
          });
        }
        // If we can't transform, return raw stream (Node runtime)
        return new Response(data.AudioStream as any, {
          status: 200,
          headers: {
            "content-type": "audio/mpeg",
            "cache-control": "no-store",
          },
        });
      } catch (e: any) {
        lastErr = e;
        // Retry next attempt on known engine/language validation errors
        const msg = String(e?.message || "");
        if (/Engine|neural|LanguageCode|Unsupported|ValidationException/i.test(msg)) {
          continue;
        }
        // For other errors, break and report
        break;
      }
    }

    const errMsg = lastErr?.message || "TTS failed";
    return new Response(JSON.stringify({ ok: false, error: errMsg }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    console.error("TTS error:", e);
    const raw = String(e?.message || "");
    const msg = /ENOTFOUND|getaddrinfo|dns/i.test(raw)
      ? `Network/DNS error contacting AWS Polly endpoint (region=${REGION}). Check internet/VPN and AWS credentials.`
      : /ERR_INVALID_CHAR/i.test(raw)
      ? "Invalid AWS credentials format. Remove quotes/newlines around AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY."
      : raw || "TTS failed";
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
