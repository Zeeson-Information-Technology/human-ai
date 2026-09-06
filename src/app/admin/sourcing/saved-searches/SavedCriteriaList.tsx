"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BTN, cx } from "@/components/ui-helper/buttonStyles";

type SavedSearch = {
  id: string;
  name: string;
  query: string;
  keywords?: string[];
  industryCodes?: string[];
  categories?: string[];
  bidTypes?: string[];
  procurementStages?: string[];
  valueRanges?: string[];
  commercialTools?: string[];
  naicsCodes?: string[];
  sectors?: string[];
  statuses?: string[];
  noticeTypes?: string[];
  setAsides?: string[];
  geography?: string[];
  publishedWindow?: string;
  closingWindow?: string;
  portalKeys?: string[];
  createdAt?: string;
};

const labels: Record<string, string> = {
  "canada-buys": "CanadaBuys",
  "sam-gov": "SAM.gov",
  merx: "MERX",
  "bids-and-tenders": "Bids & Tenders",
  "find-a-tender": "Find a Tender",
  "ontario-tenders": "Ontario Tenders Portal",
};

function values(search: SavedSearch) {
  return [
    ...(search.keywords || []),
    ...(search.industryCodes || []),
    ...(search.categories || []),
    ...(search.bidTypes || []),
    ...(search.procurementStages || []),
    ...(search.valueRanges || []),
    ...(search.commercialTools || []),
    ...(search.naicsCodes || []),
    ...(search.sectors || []),
    ...(search.noticeTypes || []),
    ...(search.setAsides || []),
    ...(search.geography || []),
    search.publishedWindow && `Published ${search.publishedWindow}`,
    search.closingWindow && `Closing ${search.closingWindow}`,
  ].filter(Boolean) as string[];
}

export default function SavedCriteriaList() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [pendingCriteria, setPendingCriteria] = useState<Record<string, unknown> | null>(null);
  const [pendingName, setPendingName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const response = await fetch("/api/admin/sourcing/saved-searches", { cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) setError(data.error || "Could not load saved criteria.");
    else setSearches(data.searches || []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
    const raw = window.sessionStorage.getItem("euman:sourcing-pending-criteria");
    if (raw) {
      try {
        const criteria = JSON.parse(raw) as Record<string, unknown>;
        setPendingCriteria(criteria);
        const portal = Array.isArray(criteria.portalKeys) ? String(criteria.portalKeys[0] || "portal") : "portal";
        setPendingName(`${labels[portal] || portal} criteria`);
      } catch {
        window.sessionStorage.removeItem("euman:sourcing-pending-criteria");
      }
    }
  }, []);

  async function savePendingCriteria() {
    if (!pendingCriteria || !pendingName.trim()) return;
    setSaving(true);
    const response = await fetch("/api/admin/sourcing/saved-searches", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: pendingName.trim(), ...pendingCriteria }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) setError(data.error || "Could not save criteria.");
    else {
      window.sessionStorage.removeItem("euman:sourcing-pending-criteria");
      setPendingCriteria(null);
      await load();
    }
    setSaving(false);
  }

  async function remove(id: string) {
    if (deleting === id) {
      const response = await fetch("/api/admin/sourcing/saved-searches", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      if (response.ok) setSearches((current) => current.filter((search) => search.id !== id));
      setDeleting(null);
      return;
    }
    setDeleting(id);
  }

  if (loading) return <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 text-sm text-white/60">Loading saved criteria...</div>;
  if (error) return <div className="rounded-3xl border border-rose-300/20 bg-rose-300/10 p-6 text-sm text-rose-100">{error}</div>;
  if (!searches.length && !pendingCriteria) return <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.04] p-8 text-center text-sm text-white/55">No saved criteria yet. Run a successful search, then save its criteria here.</div>;

  return <div className="grid gap-4">{pendingCriteria ? <section className="rounded-3xl border border-emerald-300/25 bg-emerald-300/[0.07] p-5"><div className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200/75">Successful search ready to save</div><p className="mt-2 text-sm leading-6 text-white/60">Name this complete set of criteria to reuse it later.</p><div className="mt-4 flex flex-col gap-2 sm:flex-row"><input value={pendingName} onChange={(event) => setPendingName(event.target.value)} placeholder="Criteria name" className="min-w-0 flex-1 rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-white/35" /><button type="button" onClick={() => void savePendingCriteria()} disabled={saving || !pendingName.trim()} className={cx(BTN.primary, "cursor-pointer justify-center !rounded-xl !px-4 !py-2 text-sm")}>{saving ? "Saving..." : "Save criteria"}</button></div></section> : null}{searches.map((search) => <article key={search.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 transition hover:border-emerald-300/25"><div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0"><div className="flex flex-wrap gap-2">{(search.portalKeys || []).map((key) => <span key={key} className="rounded-full border border-sky-300/20 bg-sky-300/10 px-2.5 py-1 text-[11px] font-semibold text-sky-100">{labels[key] || key}</span>)}</div><h2 className="mt-3 break-words text-lg font-semibold text-white">{search.name}</h2><p className="mt-1 break-words text-sm text-white/60">{search.query || "Criteria-only search"}</p></div><div className="flex shrink-0 flex-wrap gap-2"><Link href={`/admin/sourcing?savedSearch=${encodeURIComponent(search.id)}`} className={cx(BTN.primary, "cursor-pointer !rounded-lg !px-3 !py-2 text-xs")}>Use criteria</Link><button type="button" onClick={() => void remove(search.id)} className={cx("cursor-pointer rounded-lg border px-3 py-2 text-xs font-medium transition", deleting === search.id ? "border-rose-300/40 bg-rose-400/15 text-rose-100" : "border-white/15 text-white/65 hover:border-rose-300/40 hover:text-rose-100")}>{deleting === search.id ? "Confirm delete" : "Delete"}</button></div></div><div className="mt-4 flex flex-wrap gap-2">{values(search).length ? values(search).map((value) => <span key={value} className="rounded-lg border border-white/10 bg-slate-950/45 px-2.5 py-1.5 text-xs text-white/65">{value}</span>) : <span className="text-xs text-white/45">No additional filters</span>}</div></article>)}</div>;
}
