// src/lib/google-tts.ts
// Google Cloud Text-to-Speech client with token caching and fast timeout
// Reads base64-encoded credentials from GOOGLE_APPLICATION_CREDENTIALS_JSON
import fs from "node:fs";
import type { JWT } from "google-auth-library";

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

// Cache credentials, auth client, and access tokens to avoid cold-start latency.
let cachedCreds: any | null = null;
let cachedClient: JWT | null = null;
let cachedToken: { value: string; expiresAt: number } | null = null;
const TOKEN_LEEWAY_MS = 2 * 60 * 1000; // refresh 2 min before expiry
const TOKEN_LIFETIME_MS = 50 * 60 * 1000; // default lifetime if none provided
const GOOGLE_TTS_TIMEOUT_MS = 12_000; // fail fast so we can fall back to Polly

async function getClient(): Promise<JWT> {
  if (cachedClient) return cachedClient;
  const creds = (cachedCreds ||= decodeServiceAccount());
  const { GoogleAuth } = await import("google-auth-library");
  const auth = new GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  cachedClient = (await auth.getClient()) as JWT;
  return cachedClient;
}

async function getCachedAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < cachedToken.expiresAt - TOKEN_LEEWAY_MS) {
    return cachedToken.value;
  }
  const client = await getClient();
  const tokenResp = await client.getAccessToken();
  if (!tokenResp || !tokenResp.token) {
    throw new Error("Failed to obtain Google access token");
  }
  const expiresAt =
    typeof (tokenResp as any).expiry_date === "number"
      ? (tokenResp as any).expiry_date
      : now + TOKEN_LIFETIME_MS;
  cachedToken = { value: tokenResp.token, expiresAt };
  return tokenResp.token;
}

function languageFromVoice(name?: string): string {
  const v = (name || "").trim();
  if (!v) return "en-US";
  // Example: en-US-Neural2-J -> languageCode "en-US" (first two hyphen parts)
  const parts = v.split("-");
  if (parts.length >= 2) return `${parts[0]}-${parts[1]}`;
  return "en-US";
}

export async function synthesizeWithGoogleTTS(
  text: string,
  opts: GoogleTTSOptions = {}
): Promise<Buffer> {
  if (!text || !text.trim()) throw new Error("Text required");

  const token = await getCachedAccessToken();

  const voiceName = opts.voiceName || process.env.ZURI_TTS_VOICE || "en-US-Neural2-J";
  const languageCode = languageFromVoice(voiceName);
  const speakingRate = typeof opts.speakingRate === "number" ? opts.speakingRate : 1.0;
  const pitch = typeof opts.pitch === "number" ? opts.pitch : 0.0;

  const body: any = {
    input: opts.useSsml ? { ssml: text } : { text },
    voice: { languageCode, name: voiceName },
    audioConfig: { audioEncoding: "MP3", speakingRate, pitch },
  };

  // Enforce a timeout so we can fall back quickly instead of hanging ~60s.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GOOGLE_TTS_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch("https://texttospeech.googleapis.com/v1/text:synthesize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
  const json = (await res.json().catch(() => ({}))) as any;
  if (!res.ok) {
    const err = json?.error?.message || `Google TTS error ${res.status}`;
    throw new GoogleTTSError(err, { status: res.status, body: json });
  }
  const audioB64 = json?.audioContent as string;
  if (!audioB64) throw new Error("No audioContent returned by Google TTS");
  return Buffer.from(audioB64, "base64");
}
