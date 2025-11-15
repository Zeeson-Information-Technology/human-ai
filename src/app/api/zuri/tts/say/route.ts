import { NextRequest } from "next/server";
import {
  SynthesizeSpeechCommand,
  type VoiceId,
  type SynthesizeSpeechCommandInput,
} from "@aws-sdk/client-polly";
import { synthesizeWithGoogleTTS, GoogleTTSError } from "@/lib/google-tts";
import { buildSSML } from "@/lib/tts-ssml";

// Reuse shared Polly client (env/default chain)
import { polly as getPolly } from "@/lib/aws-polly";

const REGION = process.env.AWS_REGION || "us-east-1";
const DEFAULT_VOICE: VoiceId =
  ((process.env.ZURI_TTS_VOICE as VoiceId) || "Joanna") as VoiceId;
const DEFAULT_POLLY_VOICE: VoiceId = "Joanna" as VoiceId;

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const text = url.searchParams.get("text") || "";
    const voiceParam = (url.searchParams.get("voice") || "").trim();
    const voice: VoiceId = (voiceParam as VoiceId) || DEFAULT_VOICE;
    const providerOverride = (url.searchParams.get("provider") || "").toLowerCase();
    const provider = (providerOverride || process.env.TTS_PROVIDER || "polly").toLowerCase();
    const debug = (url.searchParams.get("debug") || "").toLowerCase() === "1";
    const noFallback =
      (url.searchParams.get("fallback") || url.searchParams.get("nofallback") || "")
        .toLowerCase() === "0" ||
      (url.searchParams.get("nofallback") || "").toLowerCase() === "1";
    if (!text.trim()) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing text" }),
        {
          status: 400,
          headers: { "content-type": "application/json" },
        }
      );
    }

    // Try Google first when selected, with automatic Polly fallback
    if (provider === "google") {
      try {
        const voiceName = process.env.ZURI_TTS_VOICE || (voice as string);
        const ssml = buildSSML(text);
        const bytes = await synthesizeWithGoogleTTS(ssml, { voiceName, useSsml: true });
        if (process.env.NODE_ENV !== "production") {
          // Log success with minimal payload for debugging
          console.log("[TTS] google success", {
            voiceName,
            textPreview: text.slice(0, 80),
          });
        }
        return new Response(Buffer.from(bytes), {
          status: 200,
          headers: {
            "content-type": "audio/mpeg",
            "cache-control": "no-store",
            "x-tts-provider": "google",
            "x-tts-voice": String(voiceName),
          },
        });
      } catch (e: any) {
        // Emit rich diagnostics in debug/noFallback modes
        const msg = String(e?.message || "Google TTS failed");
        if (debug || noFallback) {
          // Log full error on server for debugging
          console.error("[TTS] Google error", {
            message: msg,
            status: (e as GoogleTTSError)?.status,
            body: (e as GoogleTTSError)?.body,
          });
          return new Response(
            JSON.stringify({
              ok: false,
              provider: "google",
              error: msg,
              status: (e as GoogleTTSError)?.status,
              details: (e as GoogleTTSError)?.body,
            }),
            {
              status: 500,
              headers: {
                "content-type": "application/json",
                "x-tts-provider": "google",
                "x-tts-error": msg,
              },
            }
          );
        }
        // Otherwise, fall back to Polly
      }
    }

    // Polly path (default or fallback)
    const client = await getPolly(REGION);
    // Map Google-style voice names to closest Polly VoiceId (always),
    // and pass through if a valid Polly voice is already requested.
    function mapToPollyVoice(v?: string): VoiceId {
      const raw = (v || "").trim();
      const name = raw.toLowerCase();
      // If caller already passed a common Polly id, keep it
      const common = [
        "joanna","amy","matthew","brian","emma","stephen","aria","kevin","aditi","nicole","geraint"
      ];
      if (common.includes(name)) return raw as VoiceId;
      // Map Google voice families to Polly approximations
      if (name.startsWith("en-gb")) return "Amy" as VoiceId; // British English
      if (name.startsWith("en-us")) return "Joanna" as VoiceId; // US English
      if (name.startsWith("en-au")) return "Nicole" as VoiceId; // Australian English
      if (name.startsWith("en-in")) return "Aditi" as VoiceId; // Indian English
      return DEFAULT_POLLY_VOICE;
    }
    const requestedVoice = (voiceParam as string) || (process.env.ZURI_TTS_VOICE as string) || (voice as string);
    const pollyVoice: VoiceId = mapToPollyVoice(requestedVoice);
    const ssml = buildSSML(text);
    const attempts: SynthesizeSpeechCommandInput[] = [
      { OutputFormat: "mp3", Text: ssml, VoiceId: pollyVoice, Engine: "neural", TextType: "ssml" },
      { OutputFormat: "mp3", Text: text, VoiceId: pollyVoice, TextType: "text" },
    ];
    let lastErr: any = null;
    for (const input of attempts) {
      try {
        const data = await client.send(new SynthesizeSpeechCommand(input));
        if (!data.AudioStream) continue;
        let bytes: Uint8Array | null = null;
        const stream: any = data.AudioStream as any;
        if (stream?.transformToByteArray) bytes = await stream.transformToByteArray();
        if (bytes && bytes.length > 0) {
          return new Response(Buffer.from(bytes), {
            status: 200,
            headers: {
              "content-type": "audio/mpeg",
              "cache-control": "no-store",
              "x-tts-provider": "polly",
              "x-tts-voice": String(pollyVoice),
            },
          });
        }
        return new Response(data.AudioStream as any, {
          status: 200,
          headers: {
            "content-type": "audio/mpeg",
            "cache-control": "no-store",
            "x-tts-provider": "polly",
            "x-tts-voice": String(pollyVoice),
          },
        });
      } catch (e: any) {
        lastErr = e;
        const msg = String(e?.message || "");
        if (/Engine|neural|LanguageCode|Unsupported|ValidationException/i.test(msg)) continue;
        break;
      }
    }
    if (lastErr && process.env.NODE_ENV !== "production") {
      console.error("[TTS] polly error", {
        message: String(lastErr?.message || ""),
      });
    }
    return new Response(JSON.stringify({ ok: false, error: lastErr?.message || "TTS failed" }), {
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
