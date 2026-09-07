"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

export default function OpportunityActions({ code, active, canArchive }: { code: string; active: boolean; canArchive: boolean }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const router = useRouter();

  useEffect(() => {
    function close(event: MouseEvent) {
      if (ref.current?.contains(event.target as Node) || menuRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    if (!open || !buttonRef.current) return;
    const updatePosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMenuPosition({ top: rect.bottom + 8, left: Math.max(12, rect.right - 208) });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  async function toggleArchive() {
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/jobs/${encodeURIComponent(code)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      if (!response.ok) throw new Error("Unable to update opportunity");
      setOpen(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return <div ref={ref} className="relative shrink-0">
    <button ref={buttonRef} type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="cursor-pointer rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-emerald-50">
      Actions <span className="ml-1 text-slate-500">&#9662;</span>
    </button>
    {open && typeof document !== "undefined" && createPortal(<div ref={menuRef} style={{ top: menuPosition.top, left: menuPosition.left }} className="fixed z-[9999] grid w-52 gap-1 rounded-2xl border border-slate-200 bg-white p-2 text-sm text-slate-900 shadow-2xl">
      <Link onClick={() => setOpen(false)} href={`/admin/opportunities/${code}`} className="rounded-xl px-3 py-2.5 transition hover:bg-slate-100">Open opportunity</Link>
      <Link onClick={() => setOpen(false)} href={`/admin/opportunities/${code}?tab=reviews`} className="rounded-xl px-3 py-2.5 transition hover:bg-slate-100">Participant reviews</Link>
      <Link onClick={() => setOpen(false)} href={`/admin/opportunities/${code}/workbench`} className="rounded-xl px-3 py-2.5 transition hover:bg-slate-100">Workbench</Link>
      {canArchive && <button type="button" disabled={busy} onClick={() => void toggleArchive()} className="w-full cursor-pointer rounded-xl px-3 py-2.5 text-left text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Updating..." : active ? "Archive opportunity" : "Reopen opportunity"}</button>}
    </div>, document.body)}
  </div>;
}
