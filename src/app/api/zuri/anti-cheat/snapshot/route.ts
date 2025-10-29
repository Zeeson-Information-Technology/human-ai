// POST /api/zuri/anti-cheat/snapshot
// Body: { sessionId, token, imageBase64 } where imageBase64 is data URL or bare base64 (JPEG/PNG)
// Stores in S3 under interviews/<sessionId>/snapshots/<ts>.jpg and optionally runs Rekognition for faces.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { s3 } from "@/lib/aws-s3";
import { rekognition } from "@/lib/aws-rekognition";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, token, imageBase64 } = (await req.json().catch(() => ({}))) as {
      sessionId?: string;
      token?: string;
      imageBase64?: string;
    };
    if (!sessionId || !token || !imageBase64) {
      return NextResponse.json({ ok: false, error: "Bad input" }, { status: 400 });
    }

    const bucket = process.env.ZURI_S3_MEDIA_BUCKET;
    if (!bucket) return NextResponse.json({ ok: false, error: "No media bucket" }, { status: 500 });

    const b64 = imageBase64.startsWith("data:") ? imageBase64.split(",", 2)[1] : imageBase64;
    const buf = Buffer.from(b64, "base64");
    const ts = Date.now();
    const key = `interviews/${sessionId}/snapshots/${ts}.jpg`;

    const s3c = await s3();
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    await s3c.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: buf, ContentType: "image/jpeg" }));

    // Optional Rekognition
    let faces: number | undefined;
    if (process.env.REKOGNITION_ENABLED === "1") {
      try {
        const rek = await rekognition();
        const { DetectFacesCommand } = await import("@aws-sdk/client-rekognition");
        const r = await rek.send(new DetectFacesCommand({ Image: { Bytes: buf }, Attributes: ["DEFAULT"] }));
        faces = (r.FaceDetails || []).length;
      } catch (e) {
        console.error("rekognition error", e);
      }
    }

    return NextResponse.json({ ok: true, key, faces });
  } catch (e) {
    console.error("anti-cheat/snapshot error", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
