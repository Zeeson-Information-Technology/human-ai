"use client";

import { useState } from "react";
import { ArrowUpRight, CheckCircle2, ChevronLeft, ChevronRight, Clock3, ExternalLink } from "lucide-react";

export type SourcingResult = {
  title?: string;
  url?: string;
  organization?: string;
  referenceNumber?: string;
  closingDate?: string;
  description?: string;
  fitScore?: number;
  preliminaryDecision?: string;
  source?: string;
};

const PAGE_SIZE = 10;

const portalNames: Record<string, string> = {
  "canada-buys": "CanadaBuys",
  "sam-gov": "SAM.gov",
  merx: "MERX",
  "bids-and-tenders": "Bids & Tenders",
  "find-a-tender": "Find a Tender",
  "ontario-tenders": "Ontario Tenders Portal",
};

export default function SourcingResults({ results, runId }: { results: SourcingResult[]; runId: string }) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const visibleResults = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  function changePage(nextPage: number) {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <div className="mt-5 grid gap-4">
        {results.length ? visibleResults.map((result, index) => {
          const portal = portalNames[result.source || ""] || result.source || "Portal notice";
          return <a key={`${runId}-${(page - 1) * PAGE_SIZE + index}`} href={result.url || "#"} target="_blank" rel="noreferrer" className="group min-w-0 rounded-2xl border border-white/10 bg-slate-950/60 p-4 transition hover:border-emerald-300/35 hover:bg-emerald-300/[0.06] sm:p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="mb-2 inline-flex max-w-full rounded-full border border-sky-300/20 bg-sky-300/10 px-2.5 py-1 text-[11px] font-semibold text-sky-100">{portal}</div><h3 className="break-words font-medium text-white">{result.title || "Untitled opportunity"}</h3><p className="mt-2 break-words text-sm text-white/55">{result.organization || portal}{result.referenceNumber ? ` - ${result.referenceNumber}` : ""}</p></div><ArrowUpRight className="h-5 w-5 shrink-0 text-emerald-200 opacity-70 group-hover:opacity-100" /></div><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/55"><span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> Fit {result.fitScore ?? 0}%</span>{result.closingDate ? <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5 text-cyan-200" /> Closes {result.closingDate}</span> : null}<span className="capitalize">{result.preliminaryDecision?.replace("_", " ") || "Needs review"}</span></div>{result.description ? <p className="mt-4 line-clamp-4 break-words text-sm leading-6 text-white/65">{result.description}</p> : null}<div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-200">Open {portal} notice <ExternalLink className="h-4 w-4" /></div></a>;
        }) : <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/55">No opportunity records are available for this review.</div>}
      </div>
      {results.length > PAGE_SIZE ? <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4"><p className="text-sm text-white/55">Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, results.length)} of {results.length}</p><div className="flex items-center gap-2"><button type="button" onClick={() => changePage(Math.max(1, page - 1))} disabled={page === 1} className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-white/15 px-3 py-2 text-sm text-white/75 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Previous</button><span className="px-2 text-sm text-white/60">Page {page} of {pageCount}</span><button type="button" onClick={() => changePage(Math.min(pageCount, page + 1))} disabled={page === pageCount} className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-white/15 px-3 py-2 text-sm text-white/75 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40">Next <ChevronRight className="h-4 w-4" /></button></div></div> : null}
    </>
  );
}
