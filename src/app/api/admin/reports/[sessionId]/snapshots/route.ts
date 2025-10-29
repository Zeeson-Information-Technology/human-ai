// GET /api/admin/reports/[sessionId]/snapshots
// Lists presigned URLs for interview snapshots in S3 under interviews/<sessionId>/snapshots/

import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { s3, s3PresignGet } from "@/lib/aws-s3";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ sessionId: string }> }
) {
  try {
    if (!isAdmin(req)) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const { sessionId: pid } = await ctx.params;
    const sessionId = (pid || "").trim();
    if (!sessionId) return NextResponse.json({ ok: false, error: "Bad sessionId" }, { status: 400 });
    const bucket = process.env.ZURI_S3_MEDIA_BUCKET || "";
    if (!bucket) return NextResponse.json({ ok: false, error: "No media bucket" }, { status: 500 });
    const prefix = `interviews/${sessionId}/snapshots/`;
    const client = await s3();
    const { ListObjectsV2Command } = await import("@aws-sdk/client-s3");
    const out = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, MaxKeys: 40 }));
    const items = await Promise.all(
      (out.Contents || []).map(async (o: any) => ({ key: o.Key, url: await s3PresignGet(bucket, o.Key) }))
    );
    return NextResponse.json({ ok: true, items });
  } catch (e) {
    console.error("snapshots list error", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
