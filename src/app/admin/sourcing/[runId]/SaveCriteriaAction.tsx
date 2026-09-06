"use client";

import { useState } from "react";
import { BTN, cx } from "@/components/ui-helper/buttonStyles";

type Criteria = Record<string, unknown>;

export default function SaveCriteriaAction({ criteria, defaultName }: { criteria: Criteria; defaultName: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultName);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    if (!name.trim()) return;
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/admin/sourcing/saved-searches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), ...criteria }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) setMessage(data.error || "Could not save criteria.");
    else {
      setMessage("Criteria saved.");
      setOpen(false);
    }
    setBusy(false);
  }

  return <div className="flex flex-wrap items-center justify-end gap-2"><button type="button" onClick={() => setOpen((value) => !value)} className={cx(BTN.outline, "cursor-pointer !rounded-lg !px-3 !py-2 text-xs")}>{open ? "Cancel" : "Save criteria"}</button>{open ? <div className="flex w-full max-w-sm gap-2 sm:w-auto"><input value={name} onChange={(event) => setName(event.target.value)} aria-label="Saved criteria name" placeholder="Criteria name" className="min-w-0 flex-1 rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-xs text-white placeholder:text-white/35" /><button type="button" onClick={() => void save()} disabled={busy || !name.trim()} className={cx(BTN.primary, "cursor-pointer !rounded-lg !px-3 !py-2 text-xs")}>{busy ? "Saving..." : "Save"}</button></div> : null}{message ? <span className="w-full text-right text-xs text-emerald-200">{message}</span> : null}</div>;
}
