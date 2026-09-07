import { NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/db-connect";
import SourceRun from "@/model/source-run";
import type { SourceRunDoc } from "@/model/source-run";
import { companyRootIdOf, isAdminAreaRole } from "@/lib/admin-auth";
import { getSessionUser } from "@/lib/auth-utils";

function csv(value: unknown) {
  const text = value == null ? "" : Array.isArray(value) ? value.join(", ") : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadName(value: string | null, fallback: string) {
  const cleaned = (value || fallback).trim().replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return cleaned || fallback;
}

function defaultDownloadName() {
  const now = new Date();
  return `opportunities-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function html(value: unknown) {
  const text = value == null ? "" : Array.isArray(value) ? value.join(", ") : String(value);
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function excelExport(run: Record<string, unknown>, results: Array<Record<string, unknown>>) {
  const metadata = [
    ["Search brief", run.query], ["Portal", run.portalKeys], ["Keywords", run.keywords], ["Industry codes", run.industryCodes], ["NAICS codes", run.naicsCodes],
    ["Sectors", run.sectors], ["Statuses", run.statuses], ["Notice types", run.noticeTypes], ["Procurement stages", run.procurementStages], ["Set-asides / suitability", run.setAsides], ["Contract value", run.valueRanges], ["Commercial tools", run.commercialTools], ["Geography", run.geography],
    ["Published from", run.publishedFrom], ["Published to", run.publishedTo], ["Closing from", run.closingFrom], ["Closing to", run.closingTo], ["Publication window", run.publishedWindow],
    ["Closing window", run.closingWindow], ["Run status", run.status], ["Review decision", run.decision], ["Review summary", run.decisionReason], ["Created", run.createdAt],
  ];
  const metadataRows = [];
  for (let index = 0; index < metadata.length; index += 5) {
    metadataRows.push(`<tr>${metadata.slice(index, index + 5).map(([label, value]) => `<th>${html(label)}</th><td>${html(value)}</td>`).join("")}</tr>`);
  }
  const resultRows = results.map((result) => `<tr>${[result.title, result.organization, result.referenceNumber, result.status, result.publishedDate, result.closingDate, result.fitScore, result.preliminaryDecision, result.description, result.url, result.attachmentUrl].map((value) => `<td>${html(value)}</td>`).join("")}</tr>`).join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;font-size:10pt}table{border-collapse:collapse;width:100%;margin-bottom:18px}th,td{border:1px solid #cbd5e1;padding:5px;text-align:left;vertical-align:top}th{background:#e2e8f0;font-weight:700;white-space:nowrap}</style></head><body><h2>Euman Intelligence sourcing review</h2><table>${metadataRows.join("")}</table><table><thead><tr>${["Title", "Organization", "Reference", "Status", "Published", "Closing", "Fit score", "Preliminary decision", "Summary", "Notice link", "Attachment link"].map((label) => `<th>${label}</th>`).join("")}</tr></thead><tbody>${resultRows}</tbody></table></body></html>`;
}

export async function GET(req: Request, { params }: { params: Promise<{ runId: string }> }) {
  await dbConnect();
  const me = await getSessionUser();
  if (!me || !isAdminAreaRole(me.role)) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const rootId = companyRootIdOf(me);
  const { runId } = await params;
  if (!rootId || !Types.ObjectId.isValid(runId)) return NextResponse.json({ ok: false, error: "Invalid sourcing review." }, { status: 400 });
  const run = await SourceRun.findOne({ _id: new Types.ObjectId(runId), ownerCompanyId: new Types.ObjectId(rootId) }).lean() as SourceRunDoc | null;
  if (!run) return NextResponse.json({ ok: false, error: "Sourcing review not found." }, { status: 404 });

  const results = (Array.isArray(run.results) ? run.results : []) as Array<Record<string, unknown>>;
  const searchParams = new URL(req.url).searchParams;
  const format = searchParams.get("format");
  const filename = downloadName(searchParams.get("name"), defaultDownloadName());
  if (format === "print") {
    return new NextResponse(excelExport(run as Record<string, unknown>, results), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="${filename}.html"`,
        "Cache-Control": "no-store",
      },
    });
  }
  const rows = [
    ["Euman Intelligence sourcing review", ""],
    ["Search brief", run.query],
    ["Portal", run.portalKeys],
    ["Keywords", run.keywords],
    ["Industry codes", run.industryCodes],
    ["NAICS codes", run.naicsCodes],
    ["Sectors", run.sectors],
    ["Statuses", run.statuses],
    ["Notice types", run.noticeTypes],
    ["Procurement stages", run.procurementStages],
    ["Set-asides / suitability", run.setAsides],
    ["Contract value", run.valueRanges],
    ["Commercial tools", run.commercialTools],
    ["Geography", run.geography],
    ["Published from", run.publishedFrom],
    ["Published to", run.publishedTo],
    ["Closing from", run.closingFrom],
    ["Closing to", run.closingTo],
    ["Publication window", run.publishedWindow],
    ["Closing window", run.closingWindow],
    ["Run status", run.status],
    ["Review decision", run.decision],
    ["Review summary", run.decisionReason],
    ["Created", run.createdAt],
    [],
    ["Title", "Organization", "Reference", "Status", "Published", "Closing", "Fit score", "Preliminary decision", "Summary", "Notice link", "Attachment link"],
    ...results.map((result) => [result.title, result.organization, result.referenceNumber, result.status, result.publishedDate, result.closingDate, result.fitScore, result.preliminaryDecision, result.description, result.url, result.attachmentUrl]),
  ];
  const body = rows.map((row) => row.map(csv).join(",")).join("\r\n");
  return new NextResponse(`\uFEFF${body}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
