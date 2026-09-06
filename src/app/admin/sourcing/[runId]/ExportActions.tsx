"use client";

import { Download, Printer } from "lucide-react";
import { useState } from "react";
import ViewportPortal from "@/components/ViewportPortal";

export default function ExportActions({ runId }: { runId: string }) {
  const [name, setName] = useState(() => {
    const now = new Date();
    return `opportunities-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  });
  const [format, setFormat] = useState<"csv" | "print" | null>(null);

  function startExport() {
    if (!format) return;
    const now = new Date();
    const fallback = `opportunities-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const filename = encodeURIComponent(name.trim() || fallback);
    const url = `/api/admin/sourcing/runs/${runId}/export?${format === "print" ? "format=print&" : ""}name=${filename}`;
    if (format === "print") window.open(url, "_blank", "noopener,noreferrer");
    else window.location.assign(url);
    setFormat(null);
  }

  return (
    <>
      <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
        <button type="button" onClick={() => setFormat("print")} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"><Printer className="h-4 w-4" /> Print / PDF</button>
        <button type="button" onClick={() => setFormat("csv")} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"><Download className="h-4 w-4" /> CSV</button>
      </div>
      {format ? <ViewportPortal><div className="fixed inset-0 z-[120] flex h-dvh items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="export-name-title"><div className="my-auto w-full max-w-md rounded-2xl border border-white/15 bg-slate-950 p-5 shadow-2xl"><h2 id="export-name-title" className="text-lg font-semibold text-white">Name your {format === "csv" ? "CSV" : "PDF"}</h2><p className="mt-2 text-sm leading-6 text-white/60">Choose a clear file name before downloading this sourcing review.</p><label className="mt-4 block text-sm font-medium text-white/75" htmlFor="export-file-name">File name<input id="export-file-name" value={name} onChange={(event) => setName(event.target.value)} autoFocus className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none transition focus:border-emerald-300/60" /></label><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setFormat(null)} className="cursor-pointer rounded-lg border border-white/15 px-3 py-2 text-sm text-white/75 transition hover:bg-white/10">Cancel</button><button type="button" onClick={startExport} className="cursor-pointer rounded-lg bg-emerald-400 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">Continue</button></div></div></div></ViewportPortal> : null}
    </>
  );
}
