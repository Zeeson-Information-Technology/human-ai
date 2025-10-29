// ================================
// FILE: src/app/api/admin/jobs/route.ts
// List jobs + session counts (admin key required)
// ================================
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import { Job } from "@/model/job";
import Session from "@/model/session";
import { isAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Basic job info
    const jobs = await Job.find(
      {},
      { title: 1, company: 1, code: 1, languages: 1, active: 1, createdAt: 1 }
    )
      .sort({ createdAt: -1 })
      .lean();

    // Aggregate session counts by jobCode
    const counts = await Session.aggregate([
      { $match: { jobCode: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: "$jobCode",
          total: { $sum: 1 },
          finished: {
            $sum: {
              $cond: [{ $eq: ["$status", "finished"] }, 1, 0],
            },
          },
        },
      },
    ]);

    const countMap = new Map<string, { total: number; finished: number }>();
    counts.forEach((c: any) => {
      countMap.set(String(c._id), {
        total: c.total || 0,
        finished: c.finished || 0,
      });
    });

    const rows = jobs.map((j) => {
      const c = countMap.get(j.code) || { total: 0, finished: 0 };
      return {
        id: String(j._id),
        title: j.title,
        company: j.company || "",
        code: j.code,
        languages: j.languages || [],
        active: !!j.active,
        createdAt: j.createdAt?.toISOString?.() || null,
        sessions: c.total,
        finished: c.finished,
      };
    });

    return NextResponse.json({ ok: true, jobs: rows }, { status: 200 });
  } catch (e) {
    console.error("GET /api/admin/jobs error", e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
