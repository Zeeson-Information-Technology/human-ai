// GET /api/admin/reports/[sessionId]
// Returns presigned URLs for summary.json and summary.pdf in S3 reports bucket.

import { NextRequest, NextResponse } from "next/server";
import { s3PresignGet } from "@/lib/aws-s3";
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
