"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OperationsColumnTitleEditor({
  columnId,
  title,
}: {
  columnId: string;
  title: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);
  const [busy, setBusy] = useState(false);

  async function save() {
    const nextTitle = value.trim();
    if (!nextTitle || nextTitle === title) {
      setEditing(false);
      setValue(title);
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/admin/operations/columns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnId, title: nextTitle }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || "Failed to update column.");
      }
      setEditing(false);
      router.refresh();
    } catch {
      setValue(title);
      setEditing(false);
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="min-w-0 rounded-lg border border-white/10 bg-[#0b0f14] px-3 py-1.5 text-sm text-white"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void save();
            }
            if (e.key === "Escape") {
              e.preventDefault();
              setEditing(false);
              setValue(title);
            }
          }}
        />
        <button
          type="button"
          disabled={busy || !value.trim()}
          onClick={() => void save()}
          className="cursor-pointer rounded-lg border border-emerald-300/25 bg-emerald-300/15 px-2.5 py-1.5 text-[11px] font-medium text-emerald-100 transition hover:bg-emerald-300/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save
        </button>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2">
      <div className="font-semibold text-white">{title}</div>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="cursor-pointer rounded-md border border-white/10 bg-white/5 p-1 text-white/60 opacity-0 transition hover:bg-white/10 hover:text-white group-hover:opacity-100"
        aria-label={`Edit ${title} column`}
        title="Edit column title"
      >
        <svg
          className="h-3.5 w-3.5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M14.69 2.86a1.5 1.5 0 0 1 2.12 2.12l-8.1 8.1-3.05.93.93-3.05 8.1-8.1ZM5.9 11.77l-.42 1.39 1.39-.42 7.74-7.74-.97-.97-7.74 7.74Z" />
          <path d="M4 15.25A1.25 1.25 0 0 0 5.25 16.5h9.5a.75.75 0 0 1 0 1.5h-9.5A2.75 2.75 0 0 1 2.5 15.25v-9.5a.75.75 0 0 1 1.5 0v9.5Z" />
        </svg>
      </button>
    </div>
  );
}
