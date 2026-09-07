import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Search } from "lucide-react";
import DashboardShell from "@/components/dashboardBar";
import { getAdminFromCookies } from "@/lib/admin-session";
import { getOperatorFromCookies } from "@/lib/get-operator";
import { getAdminNav } from "@/lib/admin-dashboard";
import { companyRootIdOf, isAdminAreaRole } from "@/lib/admin-auth";
import dbConnect from "@/lib/db-connect";
import SourceRun, { type SourceRunDoc } from "@/model/source-run";
import SourcingResults, { type SourcingResult } from "./SourcingResults";
import RunActions from "./RunActions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatDate(value?: Date | string) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not recorded" : date.toLocaleString();
}

const portalLabels: Record<string, string> = {
  "canada-buys": "CanadaBuys",
  "sam-gov": "SAM.gov",
  "find-a-tender": "Find a Tender",
  "ontario-tenders": "Ontario Tenders Portal",
  merx: "MERX",
  "bids-and-tenders": "Bids & Tenders",
};

function portalNames(keys?: string[]) {
  return keys?.map((key) => portalLabels[key] || key).join(", ") || "Portal";
}

function windowLabel(value: string | undefined, kind: "published" | "closing") {
  const labels: Record<string, string> = kind === "published"
    ? { "1d": "Published last day", "2d": "Published last 2 days", "3d": "Published last 3 days", "7d": "Published last week", "14d": "Published last 2 weeks", "30d": "Published last month", "90d": "Published last 3 months" }
    : { today: "Closing today", "2d": "Closing next 2 days", "3d": "Closing next 3 days", "7d": "Closing next week", "14d": "Closing next 2 weeks", "30d": "Closing next month", "90d": "Closing next 3 months" };
  return value ? labels[value] || value : "Any";
}

function dateCriteria(from: string | undefined, to: string | undefined, window: string | undefined, kind: "published" | "closing") {
  if (from || to) return `${from || "Any"} to ${to || "Any"}`;
  return windowLabel(window, kind);
}

export default async function SourcingReviewPage({ params }: { params: Promise<{ runId: string }> }) {
  const admin = await getAdminFromCookies();
  if (!admin) redirect("/admin/login");
  const me = await getOperatorFromCookies();
  if (!me || !isAdminAreaRole(me.role)) redirect("/admin/login");

  await dbConnect();
  const rootId = companyRootIdOf(me);
  const { runId } = await params;
  const run = (rootId
    ? await SourceRun.findOne({ _id: runId, ownerCompanyId: rootId }).lean()
    : null) as SourceRunDoc | null;
  if (!run) notFound();

  const results = (Array.isArray(run.results) ? run.results : []) as SourcingResult[];

  return (
    <DashboardShell user={{ name: (me as { name?: string }).name ?? me.email ?? "Admin", email: me.email, role: me.role }} title="Sourcing review" nav={getAdminNav(me.role)}>
      <main className="mx-auto min-w-0 max-w-6xl text-white">
        <div className="mb-6 flex min-w-0 flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Link href="/admin/sourcing" className="text-sm text-white/65 transition hover:text-white">&larr; Back to opportunity sourcing</Link>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200/75"><Search className="h-4 w-4" /> Sourcing review</div>
            <h1 className="mt-3 max-w-4xl break-words text-2xl font-semibold tracking-tight sm:text-3xl">{run.query || `${portalNames(run.portalKeys)} criteria search`}</h1>
          </div>
          <div className="flex flex-wrap items-start justify-end gap-2"><RunActions runId={String(run._id)} defaultName={`${portalNames(run.portalKeys)} criteria`} criteria={{ query: run.query, keywords: run.keywords || [], buyerKeywords: run.buyerKeywords || [], industryCodes: run.industryCodes || [], categories: run.categories || [], bidTypes: run.bidTypes || [], procurementStages: run.procurementStages || [], valueRanges: run.valueRanges || [], commercialTools: run.commercialTools || [], naicsCodes: run.naicsCodes || [], sectors: run.sectors || [], statuses: run.statuses || [], noticeTypes: run.noticeTypes || [], setAsides: run.setAsides || [], geography: run.geography || [], publishedFrom: run.publishedFrom, publishedTo: run.publishedTo, closingFrom: run.closingFrom, closingTo: run.closingTo, publishedWindow: run.publishedWindow, closingWindow: run.closingWindow, portalConnectionIds: (run.portalConnectionIds || []).map(String), portalKeys: run.portalKeys || [] }} /></div>
        </div>

        <section className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.06] p-4 sm:p-7">
          <div className="grid gap-3 sm:grid-cols-3">
            {[["Status", run.status], ["Decision", String(run.decision).replaceAll("_", " ")], ["Matches", String(run.resultCount || 0) ]].map(([label, value]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><div className="text-xs uppercase tracking-[0.14em] text-white/45">{label}</div><div className="mt-2 capitalize font-medium text-white">{value}</div></div>)}
          </div>
          {run.status === "failed" && run.decisionReason ? <p className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4 text-sm leading-6 text-rose-100">{run.decisionReason}</p> : null}
          <div className="mt-5">
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
              <h2 className="font-semibold text-white">Search setup</h2>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-5"><div><dt className="text-white/45">Portal</dt><dd className="mt-1 text-white">{portalNames(run.portalKeys)}</dd></div><div><dt className="text-white/45">Keywords</dt><dd className="mt-1 break-words text-white/80">{run.keywords?.join(", ") || "None"}</dd></div><div><dt className="text-white/45">Codes</dt><dd className="mt-1 break-words text-white/80">{[...(run.naicsCodes || []), ...(run.industryCodes || [])].join(", ") || "None"}</dd></div><div><dt className="text-white/45">Sectors</dt><dd className="mt-1 text-white/80">{run.sectors?.join(", ") || "All sectors"}</dd></div><div><dt className="text-white/45">Notice types</dt><dd className="mt-1 break-words text-white/80">{run.noticeTypes?.join(", ") || "All notice types"}</dd></div><div><dt className="text-white/45">Procurement stages</dt><dd className="mt-1 break-words text-white/80">{run.procurementStages?.join(", ") || "All stages"}</dd></div><div><dt className="text-white/45">Suitability</dt><dd className="mt-1 break-words text-white/80">{run.setAsides?.join(", ") || "All suitability options"}</dd></div><div><dt className="text-white/45">Contract value</dt><dd className="mt-1 break-words text-white/80">{run.valueRanges?.join(", ") || "All values"}</dd></div><div><dt className="text-white/45">Commercial tool</dt><dd className="mt-1 break-words text-white/80">{run.commercialTools?.join(", ") || "All tools"}</dd></div><div><dt className="text-white/45">Geography</dt><dd className="mt-1 break-words text-white/80">{run.geography?.join(", ") || "All geographies"}</dd></div><div><dt className="text-white/45">Published</dt><dd className="mt-1 text-white/80">{dateCriteria(run.publishedFrom, run.publishedTo, run.publishedWindow, "published")}</dd></div><div><dt className="text-white/45">Closing</dt><dd className="mt-1 text-white/80">{dateCriteria(run.closingFrom, run.closingTo, run.closingWindow, "closing")}</dd></div><div><dt className="text-white/45">Created</dt><dd className="mt-1 text-white/80">{formatDate(run.createdAt)}</dd></div></dl>
            </div>
          </div>
        </section>

        <section className="mt-6 min-w-0 rounded-3xl border border-white/10 bg-white/[0.06] p-4 sm:p-7"><div className="flex min-w-0 flex-wrap items-end justify-between gap-3"><div className="min-w-0"><div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Opportunity matches</div><h2 className="mt-2 break-words text-xl font-semibold sm:text-2xl">{results.length} opportunities found</h2></div></div><SourcingResults results={results} runId={String(run._id)} /></section>
      </main>
    </DashboardShell>
  );
}
