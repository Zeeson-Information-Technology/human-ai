import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import { Job } from "@/model/job";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  await dbConnect();
  const code = (params.code || "").trim().toUpperCase();
  const job = await Job.findOne({ code, active: true }).lean();
  if (!job) {
    return NextResponse.json({ ok: false, error: "Job not found" }, { status: 404 });
  }
  return NextResponse.json({
    ok: true,
    job: {
      code: job.code,
      title: job.title,
      company: job.company || "",
      languages: job.languages || [],
      jdText: job.jdText || "",
      createdAt: job.createdAt?.toISOString?.() || "",
    },
  });
}
