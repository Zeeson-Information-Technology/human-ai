export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import { verifyToken } from "@/lib/auth";
import { isPlatformAdminRole } from "@/lib/admin-auth";
import Session from "@/model/session";

function normalizeCode(raw: string | null | undefined) {
  return (raw || "").trim().toUpperCase();
}

function toCsvValue(value: unknown) {
  let text = String(value ?? "");
  if (/^[=+\-@]/.test(text)) {
    text = `'${text}`;
  }
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ code: string }> }
) {
  const token =
    req.cookies.get("admin_token")?.value || req.cookies.get("token")?.value || "";
  const payload = verifyToken(token);
  if (!isPlatformAdminRole(String(payload?.role || ""))) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  await dbConnect();

  const { code: raw } = await ctx.params;
  const code = normalizeCode(raw);
  if (!code) {
    return NextResponse.json(
      { ok: false, error: "Missing code" },
      { status: 400 }
    );
  }

  const format = (req.nextUrl.searchParams.get("format") || "json")
    .trim()
    .toLowerCase();

  const docs = await Session.find(
    { jobCode: code, status: "finished" },
    {
      candidate: 1,
      jobCode: 1,
      jobTitle: 1,
      company: 1,
      status: 1,
      pipelineStage: 1,
      scorecard: 1,
      finishedAt: 1,
      createdAt: 1,
      updatedAt: 1,
    }
  )
    .sort({ finishedAt: -1, updatedAt: -1 })
    .lean();

  const rows = docs.map((doc: any) => ({
    id: String(doc._id),
    workspaceCode: doc.jobCode || "",
    workspaceTitle: doc.jobTitle || "",
    company: doc.company || "",
    candidateName: doc.candidate?.name || "",
    candidateEmail: doc.candidate?.email || "",
    candidatePhone: doc.candidate?.phone || "",
    pipelineStage: doc.pipelineStage || "",
    sessionStatus: doc.status || "",
    score: doc.scorecard?.overallScore ?? "",
    verdict: doc.scorecard?.verdict || "",
    summary: doc.scorecard?.summary || "",
    finishedAt: doc.finishedAt ? new Date(doc.finishedAt).toISOString() : "",
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : "",
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : "",
  }));

  if (format === "csv") {
    const headers = [
      "id",
      "workspaceCode",
      "workspaceTitle",
      "company",
      "candidateName",
      "candidateEmail",
      "candidatePhone",
      "pipelineStage",
      "sessionStatus",
      "score",
      "verdict",
      "summary",
      "finishedAt",
      "createdAt",
      "updatedAt",
    ];

    const csv = [
      headers.join(","),
      ...rows.map((row) => headers.map((header) => toCsvValue((row as any)[header])).join(",")),
    ].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${code.toLowerCase()}-reviewed-candidates.csv"`,
      },
    });
  }

  return NextResponse.json(
    {
      ok: true,
      workspaceCode: code,
      exportedAt: new Date().toISOString(),
      count: rows.length,
      reviewedCandidates: rows,
    },
    {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${code.toLowerCase()}-reviewed-candidates.json"`,
      },
    }
  );
}
