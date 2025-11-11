// GET /api/admin/reports/[sessionId]/snapshots
// Lists presigned URLs for interview snapshots in S3 under interviews/<sessionId>/snapshots/

import { NextRequest, NextResponse } from "next/server";
import { s3, s3PresignGet } from "@/lib/aws-s3";
import dbConnect from "@/lib/db-connect";
import Session from "@/model/session";
import { verifyToken } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId: pid } = await ctx.params;
    const sessionId = (pid || "").trim();
    if (!sessionId) return NextResponse.json({ ok: false, error: "Bad sessionId" }, { status: 400 });
    // AuthN + AuthZ: allow platform admin or the company owner of this session
    try {
      const adminCookie = req.cookies.get("admin_token")?.value || "";
      const userCookie = req.cookies.get("token")?.value || "";
      const payload = verifyToken(adminCookie || userCookie || "");
      if (!payload) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
      const role = String(payload.role || "");
      if (role !== "admin") {
        await dbConnect();
        const doc = await Session.findById(sessionId).lean();
        if (!doc) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
        if (!doc.ownerId || String(doc.ownerId) !== String(payload.userId || "")) {
          return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
        }
      }
    } catch {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
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
