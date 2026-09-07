"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PremiumSelect from "@/components/forms/PremiumSelect";
import PremiumToast from "@/components/feedback/PremiumToast";
import { useTimedToast } from "@/components/feedback/useTimedToast";

type ColumnOption = {
  id: string;
  title: string;
};

export default function OperationsCardMove({
  opportunityCode,
  cardId,
  columnId,
  columns,
}: {
  opportunityCode: string;
  cardId: string;
  columnId: string;
  columns: ColumnOption[];
}) {
  const router = useRouter();
  const { toast, showToast } = useTimedToast();
  const [value, setValue] = useState(columnId);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setValue(columnId);
  }, [columnId]);

  async function moveCard(nextColumnId: string) {
    if (!nextColumnId || nextColumnId === columnId) {
      setValue(columnId);
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/admin/operations/cards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityCode,
          cardId,
          columnId: nextColumnId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || "Failed to move task.");
      }
      showToast("Task moved.", "success");
      router.refresh();
    } catch (error) {
      setValue(columnId);
      showToast(
        error instanceof Error ? error.message : "Failed to move task.",
        "error"
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {toast ? <PremiumToast message={toast.msg} type={toast.type} /> : null}
      <div className="mt-4">
        <div className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/38">
          Move to
        </div>
        <PremiumSelect
          value={value}
          disabled={busy}
          onChange={(e) => {
            const nextValue = e.target.value;
            setValue(nextValue);
            void moveCard(nextValue);
          }}
          appearance="dark"
          wrapperClassName="group relative inline-block w-full rounded-xl border border-white/10 bg-white/[0.04] shadow-sm transition hover:bg-white/[0.06]"
          className="px-3 py-2 pr-10 text-xs text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {columns.map((column) => (
            <option key={column.id} value={column.id}>
              {column.title}
            </option>
          ))}
        </PremiumSelect>
      </div>
    </>
  );
}
