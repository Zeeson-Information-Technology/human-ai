// src/lib/google-tts.ts
// Minimal Google Cloud Text-to-Speech client using service account JSON
// Reads base64-encoded credentials from GOOGLE_APPLICATION_CREDENTIALS_JSON
import fs from "node:fs";

export type GoogleTTSOptions = {
  voiceName?: string; // e.g., "en-US-Neural2-J"
  speakingRate?: number; // 0.25..4.0, default 1.0
  pitch?: number; // -20.0..20.0, default 0.0
  useSsml?: boolean; // if true, `text` will be interpreted as SSML
};

export class GoogleTTSError extends Error {
  status?: number;
  body?: any;
  constructor(message: string, opts?: { status?: number; body?: any }) {
    super(message);
    this.name = "GoogleTTSError";
    this.status = opts?.status;
    this.body = opts?.body;
  }
}

function decodeServiceAccount(): any {
  const b64 = (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || "").trim();
  const pathVar = (process.env.GOOGLE_APPLICATION_CREDENTIALS || "").trim();

  // Preferred: base64-encoded JSON
  if (b64) {
    try {
      const text = Buffer.from(b64, "base64").toString("utf8");
      return JSON.parse(text);
    } catch {
      // Maybe raw JSON was pasted instead of base64
      try {
        return JSON.parse(b64);
      } catch {
        // Continue to path fallback
      }
    }
  }

  // Fallback: file path via GOOGLE_APPLICATION_CREDENTIALS
  if (pathVar) {
    try {
      const raw = fs.readFileSync(pathVar, "utf8");
      return JSON.parse(raw);
    } catch (e) {
      throw new Error(
        `Failed to read credentials from GOOGLE_APPLICATION_CREDENTIALS path: ${pathVar}`
      );
    }
  }

  throw new Error(
    "Missing GOOGLE_APPLICATION_CREDENTIALS_JSON (base64) or GOOGLE_APPLICATION_CREDENTIALS (path)"
  );
}

function languageFromVoice(name?: string): string {
  const v = (name || "").trim();
  if (!v) return "en-US";
  // Example: en-US-Neural2-J → languageCode "en-US" (first two hyphen parts)
  const parts = v.split("-");
  if (parts.length >= 2) return `${parts[0]}-${parts[1]}`;
  return "en-US";
}

export async function synthesizeWithGoogleTTS(
  text: string,
  opts: GoogleTTSOptions = {}
): Promise<Uint8Array> {
  if (!text || !text.trim()) throw new Error("Text required");

  const creds = decodeServiceAccount();
  const { GoogleAuth } = await import("google-auth-library");
  const auth = new GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  if (!token || !token.token) throw new Error("Failed to obtain Google access token");

  const voiceName = opts.voiceName || process.env.ZURI_TTS_VOICE || "en-US-Neural2-J";
  const languageCode = languageFromVoice(voiceName);
  const speakingRate = typeof opts.speakingRate === "number" ? opts.speakingRate : 1.0;
  const pitch = typeof opts.pitch === "number" ? opts.pitch : 0.0;

  const body: any = {
    input: opts.useSsml ? { ssml: text } : { text },
    voice: { languageCode, name: voiceName },
    audioConfig: { audioEncoding: "MP3", speakingRate, pitch },
  };

  const res = await fetch("https://texttospeech.googleapis.com/v1/text:synthesize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.token}`,
    },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as any;
  if (!res.ok) {
    const err = json?.error?.message || `Google TTS error ${res.status}`;
    throw new GoogleTTSError(err, { status: res.status, body: json });
  }
  const audioB64 = json?.audioContent as string;
  if (!audioB64) throw new Error("No audioContent returned by Google TTS");
  return Buffer.from(audioB64, "base64");
}
