// GET /api/admin/reports/[sessionId]
// Returns presigned URLs for summary.json and summary.pdf in S3 reports bucket.

import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { s3PresignGet } from "@/lib/aws-s3";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ sessionId: string }> }
) {
  try {
    if (!isAdmin(req)) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const { sessionId: pid } = await ctx.params;
    const sessionId = (pid || "").trim();
    if (!sessionId) return NextResponse.json({ ok: false, error: "Bad sessionId" }, { status: 400 });
    const bucket = process.env.ZURI_S3_REPORTS_BUCKET || "";
    if (!bucket) return NextResponse.json({ ok: false, error: "No reports bucket" }, { status: 500 });
    const baseKey = `reports/${sessionId}/summary`;
    const jsonUrl = await s3PresignGet(bucket, `${baseKey}.json`).catch(() => null);
    const pdfUrl = await s3PresignGet(bucket, `${baseKey}.pdf`).catch(() => null);
    return NextResponse.json({ ok: true, jsonUrl, pdfUrl });
  } catch (e) {
    console.error("reports presign error", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
