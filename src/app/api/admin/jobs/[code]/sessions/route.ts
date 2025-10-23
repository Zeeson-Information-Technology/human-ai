// ================================
// FILE: src/app/api/admin/jobs/[code]/sessions/route.ts
// List sessions for a job code (admin only)
// Supports: ?status=finished|running|pending|cancelled
//           ?limit=50 (1..200)
//           ?cursor=<ISO date> (pagination by updatedAt)
// ================================
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Session from "@/model/session";
import { isAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json(
    { ok: false, error: "Unauthorized" },
    { status: 401 }
  );
}
function normalizeCode(raw: string | null | undefined) {
  return (raw || "").trim().toUpperCase();
}

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    if (!isAdmin(req)) return unauthorized();

    await dbConnect();

    const code = normalizeCode(params.code);
    if (!code) {
      return NextResponse.json(
        { ok: false, error: "Missing code" },
        { status: 400 }
      );
    }

    const url = new URL(req.url);
    const status = (url.searchParams.get("status") || "").trim();
    const limitParam = Number(url.searchParams.get("limit") || "100");
    const cursorParam = url.searchParams.get("cursor") || ""; // iso string from previous page

    const limit = Math.max(
      1,
      Math.min(200, isNaN(limitParam) ? 100 : limitParam)
    );
    const filter: any = { jobCode: code };
    if (status) filter.status = status;

    // cursor-based pagination by updatedAt (desc)
    if (cursorParam) {
      const cursorDate = new Date(cursorParam);
      if (!isNaN(cursorDate.getTime())) {
        filter.updatedAt = { $lt: cursorDate };
      }
    }

    const docs = await Session.find(filter, {
      token: 0, // redact token
    })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();

    const sessions = docs.map((s: any) => ({
      id: String(s._id),
      candidate: {
        name: s.candidate?.name || "",
        email: s.candidate?.email || "",
      },
      language: s.language,
      status: s.status,
      pipelineStage: s.pipelineStage || null,
      finishedAt: s.finishedAt ? s.finishedAt.toISOString() : null,
      score: s.scorecard?.overallScore ?? null,
      createdAt: s.createdAt?.toISOString?.() || null,
      updatedAt: s.updatedAt?.toISOString?.() || null,
    }));

    // next cursor = last document's updatedAt (if we got a full page)
    const nextCursor =
      sessions.length === limit
        ? sessions[sessions.length - 1]?.updatedAt || null
        : null;

    return NextResponse.json(
      { ok: true, sessions, nextCursor },
      { status: 200 }
    );
  } catch (e) {
    console.error("GET /api/admin/jobs/[code]/sessions error", e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
