// POST /api/zuri/transcribe/presign
// Body: { languageCode?: string, sampleRate?: number, mediaEncoding?: 'pcm'|'ogg-opus', sessionId?: string }
// Returns a presigned Transcribe Streaming WebSocket URL or a friendly error if signing is not configured.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const region = process.env.AWS_REGION || "us-east-1";
    const body = (await req.json().catch(() => ({}))) as {
      languageCode?: string;
      sampleRate?: number;
      mediaEncoding?: string;
      sessionId?: string;
    };
    const languageCode = body.languageCode || process.env.TRANSCRIBE_LANGUAGE_CODE || "en-US";
    const sampleRate = body.sampleRate || 44100;
    const mediaEncoding = (body.mediaEncoding || "pcm").toLowerCase();
    const sessionId = body.sessionId || `${Date.now()}`;

    // Attempt to sign using SignatureV4; if libs are missing, return an unsigned template for fallback.
    try {
      const { SignatureV4 } = await import("@aws-sdk/signature-v4");
      const { Sha256 } = await import("@aws-crypto/sha256-js");
      const credsProvider = (await import("@aws-sdk/credential-providers")) as any;
      const credentials = await (credsProvider.defaultProvider?.() || credsProvider.defaultProvider)();
      const signer = new SignatureV4({ service: "transcribe", region, credentials, sha256: Sha256 as any });

      const base = `wss://transcribestreaming.${region}.amazonaws.com:8443/stream-transcription-websocket`;
      const url = new URL(base);
      url.searchParams.set("language-code", languageCode);
      url.searchParams.set("media-encoding", mediaEncoding);
      url.searchParams.set("sample-rate", String(sampleRate));
      url.searchParams.set("session-id", sessionId);

      const signed = await signer.sign({
        method: "GET",
        protocol: url.protocol,
        headers: {},
        hostname: url.hostname,
        path: url.pathname,
        query: Object.fromEntries(url.searchParams.entries()),
      } as any);

      const signedUrl = `${url.origin}${signed.path}`;
      return NextResponse.json({ ok: true, url: signedUrl, region });
    } catch (e: any) {
      // Fallback: return unsigned template to help local testing; browser SDK may handle signing if creds are present.
      const unsigned = `wss://transcribestreaming.${region}.amazonaws.com:8443/stream-transcription-websocket?language-code=${encodeURIComponent(
        languageCode
      )}&media-encoding=${encodeURIComponent(mediaEncoding)}&sample-rate=${sampleRate}&session-id=${encodeURIComponent(
        sessionId
      )}`;
      return NextResponse.json({ ok: false, url: unsigned, reason: "signing_unavailable", region }, { status: 501 });
    }
  } catch (e) {
    console.error("transcribe presign error", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

