"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PremiumSelect from "@/components/forms/PremiumSelect";
import PremiumToast from "@/components/feedback/PremiumToast";
import { useTimedToast } from "@/components/feedback/useTimedToast";

type OpportunityColumn = {
  id: string;
  title: string;
  order: number;
};

type OpportunityOption = {
  code: string;
  title: string;
  clientName: string;
  defaultColumnId: string;
  columns: OpportunityColumn[];
};

type Draft = {
  opportunityCode: string;
  columnId: string;
  title: string;
  description: string;
  assignees: string;
  dueDate: string;
  dueTime: string;
  priority: string;
};

const EMPTY_DRAFT: Draft = {
  opportunityCode: "",
  columnId: "",
  title: "",
  description: "",
  assignees: "",
  dueDate: "",
  dueTime: "",
  priority: "",
};

function parseAssignees(value: string) {
  return value
    .split(/[,;\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export default function OperationsTaskCreator({
  opportunities,
  initialOpportunityCode,
  initialColumnId,
  label = "Add task",
  variant = "primary",
}: {
  opportunities: OpportunityOption[];
  initialOpportunityCode?: string;
  initialColumnId?: string;
  label?: string;
  variant?: "primary" | "column";
}) {
  const router = useRouter();
  const { toast, showToast } = useTimedToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  function getInitialDraft(): Draft {
    const first = opportunities[0];
    const selectedOpportunity =
      opportunities.find((opportunity) => opportunity.code === initialOpportunityCode) || first;
    if (!selectedOpportunity) return EMPTY_DRAFT;
    const selectedColumn =
      selectedOpportunity.columns.find((column) => column.id === initialColumnId)?.id ||
      selectedOpportunity.defaultColumnId;

    return {
      ...EMPTY_DRAFT,
      opportunityCode: selectedOpportunity.code,
      columnId: selectedColumn,
    };
  }

  const [draft, setDraft] = useState<Draft>(getInitialDraft);

  const selectedOpportunity = useMemo(
    () => opportunities.find((opportunity) => opportunity.code === draft.opportunityCode),
    [draft.opportunityCode, opportunities]
  );
  const availableColumns = selectedOpportunity?.columns || [];

  function closeModal() {
    setOpen(false);
    setDraft(getInitialDraft());
  }

  async function createTask() {
    if (!draft.opportunityCode || !draft.columnId || !draft.title.trim()) return;

    setBusy(true);
    try {
      const res = await fetch("/api/admin/operations/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityCode: draft.opportunityCode,
          columnId: draft.columnId,
          title: draft.title.trim(),
          description: draft.description.trim(),
          assigneeEmails: parseAssignees(draft.assignees),
          dueDate: draft.dueDate,
          dueTime: draft.dueTime,
          priority: draft.priority,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || "Failed to create task.");
      }
      closeModal();
      showToast("Task created.", "success");
      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to create task.",
        "error"
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {toast ? <PremiumToast message={toast.msg} type={toast.type} /> : null}
      <button
        type="button"
        onClick={() => {
          setDraft(getInitialDraft());
          setOpen(true);
        }}
        className={
          variant === "column"
            ? "cursor-pointer rounded-lg border border-white/12 bg-white/6 p-2 text-white/80 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            : "cursor-pointer inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black shadow-[0_12px_30px_rgba(255,255,255,0.12)] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
        }
        disabled={opportunities.length === 0}
        aria-label={label}
        title={label}
      >
        <svg
          className={variant === "column" ? "h-4 w-4" : "h-4 w-4"}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M10 4.25a.75.75 0 0 1 .75.75v4.25H15a.75.75 0 0 1 0 1.5h-4.25V15a.75.75 0 0 1-1.5 0v-4.25H5a.75.75 0 0 1 0-1.5h4.25V5a.75.75 0 0 1 .75-.75Z" />
        </svg>
        {variant === "primary" ? <span>{label}</span> : null}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0d1117] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Create task</h2>
                <p className="mt-1 text-sm text-white/65">
                  Add a work item from the operations board and attach it to the right opportunity.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Opportunity
                </label>
                <PremiumSelect
                  value={draft.opportunityCode}
                  onChange={(e) => {
                    const nextOpportunity = opportunities.find(
                      (item) => item.code === e.target.value
                    );
                    setDraft((prev) => ({
                      ...prev,
                      opportunityCode: e.target.value,
                      columnId: nextOpportunity?.defaultColumnId || "",
                    }));
                  }}
                  appearance="dark"
                  wrapperClassName="group relative inline-block w-full rounded-2xl border border-white/10 bg-white/[0.04] shadow-sm transition hover:bg-white/[0.06]"
                  className="px-3 py-3 pr-10 text-sm text-white"
                >
                  {opportunities.map((opportunity) => (
                    <option key={opportunity.code} value={opportunity.code}>
                      {opportunity.clientName || "Client"} | {opportunity.code}
                    </option>
                  ))}
                </PremiumSelect>
                {selectedOpportunity ? (
                  <div className="mt-2 text-xs text-white/48">
                    {selectedOpportunity.title}
                  </div>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Column
                </label>
                <PremiumSelect
                  value={draft.columnId}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, columnId: e.target.value }))
                  }
                  appearance="dark"
                  wrapperClassName="group relative inline-block w-full rounded-2xl border border-white/10 bg-white/[0.04] shadow-sm transition hover:bg-white/[0.06]"
                  className="px-3 py-3 pr-10 text-sm text-white"
                >
                  {availableColumns.map((column) => (
                    <option key={column.id} value={column.id}>
                      {column.title}
                    </option>
                  ))}
                </PremiumSelect>
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-white">
                Task title
              </label>
              <input
                value={draft.title}
                onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Describe the task or next action"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/30"
              />
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-white">
                Description
              </label>
              <textarea
                value={draft.description}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={4}
                placeholder="Add context, deadline notes, or next steps"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/30"
              />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Assignees
                </label>
                <input
                  value={draft.assignees}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, assignees: e.target.value }))
                  }
                  placeholder="Add one or more emails"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Priority
                </label>
                <PremiumSelect
                  value={draft.priority}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, priority: e.target.value }))
                  }
                  appearance="dark"
                  wrapperClassName="group relative inline-block w-full rounded-2xl border border-white/10 bg-white/[0.04] shadow-sm transition hover:bg-white/[0.06]"
                  className="px-3 py-3 pr-10 text-sm text-white"
                >
                  <option value="">No priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </PremiumSelect>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Due date
                </label>
                <input
                  type="date"
                  value={draft.dueDate}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, dueDate: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Due time
                </label>
                <input
                  type="time"
                  value={draft.dueTime}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, dueTime: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  busy ||
                  !draft.opportunityCode ||
                  !draft.columnId ||
                  !draft.title.trim()
                }
                onClick={() => void createTask()}
                className="cursor-pointer rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Create task
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
