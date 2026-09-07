"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Download, FileText, Save, X } from "lucide-react";
import ViewportPortal from "@/components/ViewportPortal";
import { BTN, cx } from "@/components/ui-helper/buttonStyles";

type RunActionsProps = {
  runId: string;
  criteria: Record<string, unknown>;
  defaultName: string;
};

function datedName() {
  const now = new Date();
  return `opportunities-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export default function RunActions({ runId, criteria, defaultName }: RunActionsProps) {
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState<"save" | "export" | null>(null);
  const [name, setName] = useState(defaultName);
  const [format, setFormat] = useState<"csv" | "pdf">("csv");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function closeWhenOutside(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", closeWhenOutside);
    return () => document.removeEventListener("pointerdown", closeWhenOutside);
  }, [open]);

  function chooseExport(nextFormat: "csv" | "pdf") {
    setFormat(nextFormat);
    setName(datedName());
    setMessage("");
    setDialog("export");
    setOpen(false);
  }

  function chooseSave() {
    setName(defaultName);
    setMessage("");
    setDialog("save");
    setOpen(false);
  }

  function startExport() {
    const filename = encodeURIComponent(name.trim() || datedName());
    const query = format === "pdf" ? `format=print&name=${filename}` : `name=${filename}`;
    window.location.assign(`/api/admin/sourcing/runs/${runId}/export?${query}`);
  }

  async function saveCriteria() {
    if (!name.trim()) return;
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/admin/sourcing/saved-searches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), ...criteria }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) {
      setMessage(data.error || "Could not save criteria.");
    } else {
      setDialog(null);
      setMessage("Criteria saved.");
    }
    setBusy(false);
  }

  return (
    <>
      <div ref={menuRef} className="relative">
        <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className={cx(BTN.primary, "inline-flex min-w-28 cursor-pointer items-center justify-center gap-1.5 !rounded-lg !px-4 !py-2 text-xs")}>
          <span>Actions</span><ChevronDown className={cx("h-3.5 w-3.5 transition", open && "rotate-180")} />
        </button>
        {open ? <div className="absolute right-0 top-full z-30 mt-2 w-52 rounded-2xl border border-white/15 bg-slate-900 p-1.5 shadow-2xl shadow-black/40">
          <button type="button" onClick={() => chooseExport("csv")} className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs text-white/80 transition hover:bg-white/10 hover:text-white"><Download className="h-4 w-4 text-emerald-200" /> Download CSV</button>
          <button type="button" onClick={() => chooseExport("pdf")} className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs text-white/80 transition hover:bg-white/10 hover:text-white"><FileText className="h-4 w-4 text-cyan-200" /> Download PDF</button>
          <div className="my-1 border-t border-white/10" />
          <button type="button" onClick={chooseSave} className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs text-white/80 transition hover:bg-white/10 hover:text-white"><Save className="h-4 w-4 text-amber-200" /> Save criteria</button>
          <button type="button" onClick={chooseSave} className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs text-white/80 transition hover:bg-white/10 hover:text-white"><Save className="h-4 w-4 text-white/55" /> Save as...</button>
        </div> : null}
      </div>
      {message ? <span className="self-center text-xs text-emerald-200">{message}</span> : null}
      {dialog ? <ViewportPortal><div className="fixed inset-0 z-[120] flex h-dvh items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="run-action-title"><div className="my-auto w-full max-w-md rounded-2xl border border-white/15 bg-slate-950 p-5 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><h2 id="run-action-title" className="text-lg font-semibold text-white">{dialog === "save" ? "Save search criteria" : `Download ${format.toUpperCase()}`}</h2><p className="mt-2 text-sm leading-6 text-white/60">{dialog === "save" ? "Name these criteria to reuse them from Saved criteria." : "Choose a clear file name for this sourcing review."}</p></div><button type="button" onClick={() => setDialog(null)} aria-label="Close" className="cursor-pointer rounded-full p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button></div><label className="mt-4 block text-sm font-medium text-white/75" htmlFor="run-action-name">{dialog === "save" ? "Criteria name" : "File name"}<input id="run-action-name" value={name} onChange={(event) => setName(event.target.value)} autoFocus className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none transition focus:border-emerald-300/60" /></label>{message && dialog === "save" ? <p className="mt-2 text-xs text-rose-200">{message}</p> : null}<div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setDialog(null)} className="cursor-pointer rounded-lg border border-white/15 px-3 py-2 text-sm text-white/75 transition hover:bg-white/10">Cancel</button><button type="button" onClick={() => dialog === "save" ? void saveCriteria() : startExport()} disabled={busy || (dialog === "save" && !name.trim())} className={cx(BTN.primary, "cursor-pointer !rounded-lg !px-3 !py-2 text-sm")}>{busy ? "Saving..." : dialog === "save" ? "Save criteria" : "Download"}</button></div></div></div></ViewportPortal> : null}
    </>
  );
}
