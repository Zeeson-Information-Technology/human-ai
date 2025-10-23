import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import { Job } from "@/model/job";

export const dynamic = "force-dynamic";

export async function GET() {
  await dbConnect();
  const docs = await Job.find({ active: true }).sort({ createdAt: -1 }).lean();
  const jobs = docs.map((d: any) => ({
    code: d.code,
    title: d.title,
    company: d.company || "",
    languages: d.languages || [],
    jdText: d.jdText || "",
    createdAt: d.createdAt?.toISOString?.() || "",
  }));
  return NextResponse.json({ jobs });
}
