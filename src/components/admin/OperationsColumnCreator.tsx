"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PremiumToast from "@/components/feedback/PremiumToast";
import { useTimedToast } from "@/components/feedback/useTimedToast";

export default function OperationsColumnCreator() {
  const router = useRouter();
  const { toast, showToast } = useTimedToast();
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  async function createColumn() {
    const nextTitle = title.trim();
    if (!nextTitle) {
      showToast("Enter a column title.", "info");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/admin/operations/columns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: nextTitle }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || "Failed to add column.");
      }
      setTitle("");
      showToast("Column added.", "success");
      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to add column.",
        "error"
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {toast ? <PremiumToast message={toast.msg} type={toast.type} /> : null}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.07] p-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New column title"
          className="min-w-[220px] flex-1 rounded-xl border border-white/10 bg-[#0b0f14] px-3 py-2 text-sm text-white placeholder:text-white/35"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void createColumn();
            }
          }}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => void createColumn()}
          className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black shadow-[0_12px_30px_rgba(255,255,255,0.12)] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10 4.25a.75.75 0 0 1 .75.75v4.25H15a.75.75 0 0 1 0 1.5h-4.25V15a.75.75 0 0 1-1.5 0v-4.25H5a.75.75 0 0 1 0-1.5h4.25V5a.75.75 0 0 1 .75-.75Z" />
          </svg>
          <span>Add column</span>
        </button>
      </div>
    </>
  );
}
