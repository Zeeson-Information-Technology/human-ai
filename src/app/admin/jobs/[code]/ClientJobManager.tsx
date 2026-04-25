"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PremiumToast from "@/components/feedback/PremiumToast";
import { useTimedToast } from "@/components/feedback/useTimedToast";
import PremiumSelect from "@/components/forms/PremiumSelect";
import FileDropUpload, { type UploadedFileItem } from "@/components/forms/FileDropUpload";
import Pagination from "@/components/navigation/Pagination";
import { BTN, cx } from "@/components/ui-helper/buttonStyles";
import {
  InviteSendingOverlay,
  InviteSentModal,
  type InviteSuccessMeta,
} from "@/components/modal/InviteFeedback";

function LoaderOverlay({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
      <div className="flex flex-col items-center gap-3">
        <svg className="h-8 w-8 animate-spin text-white/90" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-90"
            fill="currentColor"
            d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
          />
        </svg>
        <div className="text-sm text-white/90">Saving...</div>
      </div>
    </div>
  );
}

type Tab = "overview" | "workbench" | "requests" | "reviews";

type JobDTO = {
  id: string;
  code: string;
  title: string;
  company?: string;
  clientName?: string;
  clientContactName?: string;
  clientContactEmail?: string;
  buyerOrganization?: string;
  solicitationNumber?: string;
  opportunitySource?: string;
  submissionDeadline?: string;
  marketFocus?: string;
  roleName?: string;
  assignedUserId?: string;
  assignedUserEmail?: string;
  jdText: string;
  focusAreas: string[];
  adminFocusNotes?: string;
  documents?: Array<{
    name: string;
    url: string;
    publicId?: string;
    bytes?: number;
    resourceType?: string;
    uploadedAt?: string;
  }>;
  active: boolean;
  createdAt?: string;
  workbench?: WorkbenchState;
};

type TeamMember = {
  _id: string;
  email: string;
  role: string;
};

type WorkbenchColumn = {
  id: string;
  title: string;
  order: number;
};

type WorkbenchCard = {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  order: number;
  creatorEmail?: string;
  creatorName?: string;
  creatorAvatarUrl?: string;
  assigneeEmail?: string;
  assigneeEmails?: string[];
  dueDate?: string;
  dueTime?: string;
  priority?: WorkbenchPriority | "";
  createdAt?: string;
  links?: string[];
  documents?: UploadedFileItem[];
  subtasks?: Array<{
    id: string;
    title: string;
    done?: boolean;
  }>;
};

type WorkbenchState = {
  columns: WorkbenchColumn[];
  cards: WorkbenchCard[];
};

type WorkbenchPriority = "low" | "medium" | "high" | "urgent";

type NewWorkbenchCardDraft = {
  title: string;
  description: string;
  assignees: string;
  dueDate: string;
  dueTime: string;
  priority: WorkbenchPriority | "";
};

type Offer = {
  title?: string;
  rate?: number;
  currency?: "USD" | "CAD" | "EUR" | "GBP" | "NGN";
  status?: "draft" | "sent" | "accepted" | "declined" | "withdrawn";
};

type SessionItem = {
  id: string;
  status: "pending" | "running" | "finished" | "cancelled";
  pipelineStage?: "applied" | "interviewing" | "offer" | "contract" | "hired" | "rejected";
  stageStatus?: "applied" | "screening" | "interviewing" | "offered" | "hired" | "rejected";
  offer?: Offer;
  candidate: { name: string; email: string };
  finishedAt?: string | Date;
  score?: number;
  __draftOffer?: Offer;
};

const STAGES = [
  "applied",
  "screening",
  "interviewing",
  "offered",
  "hired",
  "rejected",
] as const;

const PAGE_SIZE = 8;

function defaultWorkbench(): WorkbenchState {
  return {
    columns: [
      { id: "opportunities", title: "Opportunities", order: 0 },
      { id: "todo", title: "To do", order: 1 },
      { id: "in-progress", title: "In progress", order: 2 },
      { id: "submitted", title: "Submitted", order: 3 },
      { id: "lost", title: "Lost", order: 4 },
      { id: "awarded", title: "Awarded", order: 5 },
    ],
    cards: [],
  };
}

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

const PRIORITY_OPTIONS: Array<{ value: WorkbenchPriority | ""; label: string }> = [
  { value: "", label: "No priority" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const EMPTY_CARD_DRAFT: NewWorkbenchCardDraft = {
  title: "",
  description: "",
  assignees: "",
  dueDate: "",
  dueTime: "",
  priority: "",
};

function parseAssigneeEmails(value: string) {
  return value
    .split(/[,;\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function getCardAssignees(card: WorkbenchCard) {
  const assignees = card.assigneeEmails?.length
    ? card.assigneeEmails
    : card.assigneeEmail
      ? [card.assigneeEmail]
      : [];
  return Array.from(new Set(assignees.filter(Boolean)));
}

function getInitials(value?: string) {
  const source = (value || "").trim();
  if (!source) return "EI";
  const namePart = source.includes("@") ? source.split("@")[0] : source;
  const words = namePart.split(/[.\s_-]+/).filter(Boolean);
  return (words.length > 1 ? `${words[0][0]}${words[1][0]}` : namePart.slice(0, 2)).toUpperCase();
}

function formatDue(dueDate?: string, dueTime?: string) {
  if (!dueDate && !dueTime) return "";
  return [dueDate, dueTime].filter(Boolean).join(" ");
}

function getSubtaskProgress(card: WorkbenchCard) {
  const subtasks = card.subtasks || [];
  return {
    done: subtasks.filter((subtask) => subtask.done).length,
    total: subtasks.length,
  };
}

function priorityClass(priority?: WorkbenchPriority | "") {
  switch (priority) {
    case "urgent":
      return "border-red-200 bg-red-50 text-red-700";
    case "high":
      return "border-orange-200 bg-orange-50 text-orange-700";
    case "medium":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "low":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    default:
      return "border-gray-200 bg-gray-50 text-gray-600";
  }
}

function priorityLabel(priority?: WorkbenchPriority | "") {
  return PRIORITY_OPTIONS.find((option) => option.value === priority)?.label || "No priority";
}

function WorkbenchIcon({
  name,
  className = "h-3.5 w-3.5",
}: {
  name: "user" | "calendar" | "flag" | "link" | "paperclip" | "check";
  className?: string;
}) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "calendar") {
    return (
      <svg {...common}>
        <path d="M8 2v4M16 2v4M3 10h18" />
        <rect x="3" y="5" width="18" height="16" rx="2" />
      </svg>
    );
  }
  if (name === "flag") {
    return (
      <svg {...common}>
        <path d="M5 22V4M5 4h12l-2 5 2 5H5" />
      </svg>
    );
  }
  if (name === "link") {
    return (
      <svg {...common}>
        <path d="M10 13a5 5 0 0 0 7.07 0l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15" />
        <path d="M14 11a5 5 0 0 0-7.07 0l-2 2A5 5 0 0 0 12 20.07l1.15-1.15" />
      </svg>
    );
  }
  if (name === "paperclip") {
    return (
      <svg {...common}>
        <path d="m21.44 11.05-8.49 8.49a6 6 0 0 1-8.49-8.49l8.49-8.49a4 4 0 1 1 5.66 5.66l-8.49 8.49a2 2 0 0 1-2.83-2.83l7.78-7.78" />
      </svg>
    );
  }
  if (name === "check") {
    return (
      <svg {...common}>
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function reorderCards(cards: WorkbenchCard[]) {
  const grouped = new Map<string, WorkbenchCard[]>();
  for (const card of cards) {
    const list = grouped.get(card.columnId) || [];
    list.push(card);
    grouped.set(card.columnId, list);
  }

  const nextCards: WorkbenchCard[] = [];
  for (const [, group] of grouped.entries()) {
    group
      .sort((a, b) => a.order - b.order)
      .forEach((card, index) => nextCards.push({ ...card, order: index }));
  }
  return nextCards;
}

export default function ClientJobManager({
  initialJob,
  initialTab = "overview",
  canEditWorkspace,
  canManageAssignments,
  workbenchOnly = false,
  currentUserEmail = "",
}: {
  initialJob: JobDTO;
  initialTab?: Tab;
  canEditWorkspace: boolean;
  canManageAssignments: boolean;
  workbenchOnly?: boolean;
  currentUserEmail?: string;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [job, setJob] = useState<JobDTO>(initialJob);
  const [savedOverview, setSavedOverview] = useState<JobDTO>(initialJob);
  const [isEditingOverview, setIsEditingOverview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const { toast, showToast } = useTimedToast();

  const [pendingResponses, setPendingResponses] = useState<SessionItem[]>([]);
  const [reviewedResponses, setReviewedResponses] = useState<SessionItem[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [responseView, setResponseView] = useState<"pending" | "reviewed">(
    "pending"
  );
  const [pendingPage, setPendingPage] = useState(1);
  const [reviewedPage, setReviewedPage] = useState(1);

  const [inviteEmails, setInviteEmails] = useState<string[]>([""]);
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<InviteSuccessMeta | null>(
    null
  );
  const [linkCopied, setLinkCopied] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [workbench, setWorkbench] = useState<WorkbenchState>(
    initialJob.workbench || defaultWorkbench()
  );
  const [savedWorkbench, setSavedWorkbench] = useState<WorkbenchState>(
    initialJob.workbench || defaultWorkbench()
  );
  const [workbenchBusy, setWorkbenchBusy] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingColumnTitle, setEditingColumnTitle] = useState("");
  const [newCard, setNewCard] = useState<Record<string, NewWorkbenchCardDraft>>({});
  const [openComposerColumnId, setOpenComposerColumnId] = useState<string | null>(null);
  const [activeWorkbenchCardId, setActiveWorkbenchCardId] = useState<string | null>(null);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [hoverColumnId, setHoverColumnId] = useState<string | null>(null);
  const [detailLinkInput, setDetailLinkInput] = useState("");
  const [detailSubtaskInput, setDetailSubtaskInput] = useState("");

  const briefChars = (job.jdText || "").trim().length;
  const workspaceValid =
    job.title.trim().length > 0 && briefChars >= 120;

  async function saveJob(partial: Partial<JobDTO>) {
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/jobs/${job.code}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Update failed");
      setJob((prev) => {
        const next = { ...prev, ...data.job };
        setSavedOverview(next);
        return next;
      });
      setMsg("Opportunity updated.");
      showToast("Opportunity updated.", "success");
      setIsEditingOverview(false);
    } catch (e: any) {
      setErr(e.message || "Error saving opportunity");
      showToast(e.message || "Error saving opportunity", "error");
    } finally {
      setBusy(false);
    }
  }

  async function updateSession(id: string, data: any) {
    const res = await fetch(`/api/admin/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const out = await res.json();
    if (!res.ok || !out.ok) {
      throw new Error(out.error || "Failed to update review");
    }
    const updated = { id: out.session._id || out.session.id, ...out.session };
    setPendingResponses((prev) =>
      prev.map((item) => (item.id === id ? updated : item))
    );
    setReviewedResponses((prev) =>
      prev.map((item) => (item.id === id ? updated : item))
    );
  }

  async function saveWorkbench(nextWorkbench: WorkbenchState, successMessage?: string) {
    setWorkbenchBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/jobs/${job.code}/workbench`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextWorkbench),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to update workbench");
      const persisted = data.workbench || nextWorkbench;
      setWorkbench(persisted);
      setSavedWorkbench(persisted);
      if (successMessage) {
        setMsg(successMessage);
        showToast(successMessage, "success");
      }
    } catch (e: any) {
      setErr(e.message || "Failed to update workbench");
      showToast(e.message || "Failed to update workbench", "error");
    } finally {
      setWorkbenchBusy(false);
    }
  }

  useEffect(() => {
    async function loadTeamMembers() {
      if (!canManageAssignments) return;
      try {
        const res = await fetch("/api/admin/sub-users", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data.ok) return;
        setTeamMembers((data.users || []).filter((item: TeamMember) => item.role === "staff"));
      } catch {}
    }
    loadTeamMembers();
  }, [canManageAssignments]);

  useEffect(() => {
    async function loadResponses() {
      if (tab !== "reviews") return;
      setLoadingResponses(true);
      try {
        const res = await fetch(`/api/admin/jobs/${job.code}/sessions`);
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setErr(data.error || "Failed to load responses");
          showToast(data.error || "Failed to load responses", "error");
          return;
        }

        const all = (data.sessions || []).map((s: any) => ({
          id: s._id || s.id,
          ...s,
        }));
        setPendingResponses(all.filter((s: any) => s.status !== "finished"));
        setReviewedResponses(all.filter((s: any) => s.status === "finished"));
      } catch (e: any) {
        setErr(e.message || "Failed to load responses");
        showToast(e.message || "Failed to load responses", "error");
      } finally {
        setLoadingResponses(false);
      }
    }
    loadResponses();
  }, [job.code, tab]);

  useEffect(() => {
    const max = Math.max(1, Math.ceil(pendingResponses.length / PAGE_SIZE));
    if (pendingPage > max) setPendingPage(max);
  }, [pendingPage, pendingResponses.length]);

  useEffect(() => {
    const max = Math.max(1, Math.ceil(reviewedResponses.length / PAGE_SIZE));
    if (reviewedPage > max) setReviewedPage(max);
  }, [reviewedPage, reviewedResponses.length]);

  const pendingPageCount = useMemo(
    () => Math.max(1, Math.ceil(pendingResponses.length / PAGE_SIZE)),
    [pendingResponses.length]
  );
  const reviewedPageCount = useMemo(
    () => Math.max(1, Math.ceil(reviewedResponses.length / PAGE_SIZE)),
    [reviewedResponses.length]
  );
  const pendingSlice = useMemo(() => {
    const start = (pendingPage - 1) * PAGE_SIZE;
    return pendingResponses.slice(start, start + PAGE_SIZE);
  }, [pendingPage, pendingResponses]);
  const reviewedSlice = useMemo(() => {
    const start = (reviewedPage - 1) * PAGE_SIZE;
    return reviewedResponses.slice(start, start + PAGE_SIZE);
  }, [reviewedPage, reviewedResponses]);

  async function sendRequests() {
    const emails = inviteEmails.map((email) => email.trim()).filter(Boolean);
    if (!emails.length) return;
    setInviteBusy(true);
    setInviteMsg(null);
    try {
      const res = await fetch("/api/email/invite-multi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobCode: job.code,
          emails,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Request failed");
      setInviteSuccess({ count: data.sent ?? emails.length, emails });
      showToast("Participant requests sent.", "success");
    } catch (e: any) {
      setInviteMsg(e.message || "Failed to send requests");
      showToast(e.message || "Failed to send requests", "error");
    } finally {
      setInviteBusy(false);
    }
  }

  function setField<K extends keyof JobDTO>(key: K, value: JobDTO[K]) {
    setJob((prev) => ({ ...prev, [key]: value }));
  }

  const canEditOverview = canEditWorkspace && isEditingOverview;

  const responseLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/jobs/apply?code=${job.code}`
      : `/jobs/apply?code=${job.code}`;
  const exportJsonHref = `/api/admin/jobs/${job.code}/export?format=json`;
  const exportCsvHref = `/api/admin/jobs/${job.code}/export?format=csv`;
  const orderedColumns = useMemo(
    () => [...(workbench.columns || [])].sort((a, b) => a.order - b.order),
    [workbench.columns]
  );
  const beginColumnEdit = (columnId: string, currentTitle: string) => {
    setEditingColumnId(columnId);
    setEditingColumnTitle(currentTitle);
  };
  const cancelColumnEdit = () => {
    setEditingColumnId(null);
    setEditingColumnTitle("");
  };
  const saveColumnTitle = async (columnId: string) => {
    const title = editingColumnTitle.trim();
    if (!title) return;
    const nextWorkbench = {
      ...workbench,
      columns: workbench.columns.map((column) =>
        column.id === columnId ? { ...column, title } : column
      ),
    };
    cancelColumnEdit();
    await saveWorkbench(nextWorkbench, "Workbench column updated.");
  };
  const cardsByColumn = useMemo(() => {
    const grouped = new Map<string, WorkbenchCard[]>();
    for (const card of workbench.cards || []) {
      const list = grouped.get(card.columnId) || [];
      list.push(card);
      grouped.set(card.columnId, list);
    }
    for (const [columnId, cards] of grouped.entries()) {
      grouped.set(
        columnId,
        [...cards].sort((a, b) => a.order - b.order)
      );
    }
    return grouped;
  }, [workbench.cards]);
  const activeWorkbenchCard = useMemo(
    () => workbench.cards.find((card) => card.id === activeWorkbenchCardId) || null,
    [activeWorkbenchCardId, workbench.cards]
  );
  const currentComposerColumn = useMemo(
    () => orderedColumns.find((column) => column.id === openComposerColumnId) || null,
    [openComposerColumnId, orderedColumns]
  );
  const composerDraft = openComposerColumnId
    ? newCard[openComposerColumnId] || EMPTY_CARD_DRAFT
    : EMPTY_CARD_DRAFT;

  function updateWorkbenchCard(
    cardId: string,
    updater: (card: WorkbenchCard) => WorkbenchCard
  ) {
    setWorkbench((prev) => ({
      ...prev,
      cards: prev.cards.map((item) => (item.id === cardId ? updater(item) : item)),
    }));
  }

  async function createWorkbenchTask(columnId: string) {
    const draft = newCard[columnId] || EMPTY_CARD_DRAFT;
    if (!draft.title.trim()) return;

    const assignees = parseAssigneeEmails(draft.assignees);
    const nextWorkbench = {
      ...workbench,
      cards: [
        ...workbench.cards,
        {
          id: makeId("card"),
          title: draft.title.trim(),
          description: draft.description.trim(),
          columnId,
          order: (cardsByColumn.get(columnId) || []).length,
          creatorEmail: currentUserEmail,
          creatorName: currentUserEmail,
          creatorAvatarUrl: "",
          assigneeEmail: assignees[0] || job.assignedUserEmail || "",
          assigneeEmails: assignees.length
            ? assignees
            : job.assignedUserEmail
              ? [job.assignedUserEmail]
              : [],
          dueDate: draft.dueDate,
          dueTime: draft.dueTime,
          priority: draft.priority,
          createdAt: new Date().toLocaleDateString(),
          links: [],
          documents: [],
          subtasks: [],
        },
      ],
    };

    setNewCard((prev) => ({
      ...prev,
      [columnId]: EMPTY_CARD_DRAFT,
    }));
    setOpenComposerColumnId(null);
    await saveWorkbench(nextWorkbench, "Task added.");
  }

  useEffect(() => {
    if (!activeWorkbenchCardId) {
      setDetailLinkInput("");
      setDetailSubtaskInput("");
    }
  }, [activeWorkbenchCardId]);

  return (
    <div className="rounded-2xl border p-5">
      {toast && <PremiumToast message={toast.msg} type={toast.type} />}
      <LoaderOverlay show={busy} />
      <InviteSendingOverlay show={inviteBusy} />

      {!workbenchOnly && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            Code: <span className="font-mono">{job.code}</span> | Created:{" "}
            {job.createdAt ? new Date(job.createdAt).toLocaleString() : "-"}
          </div>
          <div className="flex items-center gap-2">
            {canEditWorkspace && (
              <button
                type="button"
                onClick={() => saveJob({ active: !job.active })}
                title={
                  job.active
                    ? "Archive this opportunity and stop treating it as open"
                    : "Reopen this opportunity"
                }
                className={`cursor-pointer rounded-lg px-3 py-1 text-sm font-medium ${
                  job.active ? "bg-emerald-600 text-white" : "bg-black text-white"
                }`}
              >
                {job.active ? "Open opportunity" : "Reopen opportunity"}
              </button>
            )}
            <button
              type="button"
              className="cursor-pointer rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
              onClick={() => {
                try {
                  navigator.clipboard.writeText(responseLink);
                  setLinkCopied(true);
                  window.setTimeout(() => setLinkCopied(false), 1800);
                } catch {}
              }}
              title="Copy response link"
              aria-label="Copy response link"
            >
              {linkCopied ? "Copied!" : "Copy response link"}
            </button>
          </div>
        </div>
      )}

      {!workbenchOnly && (
        <div className="mb-4 flex gap-2">
          {(
            [
              ["overview", "Opportunity"],
              ["workbench", "Workbench"],
              ["requests", "Participant Requests"],
              ["reviews", "Participant Reviews"],
            ] as Array<[Tab, string]>
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`cursor-pointer rounded-full border px-3 py-1 ${
                tab === value ? "bg-black text-white" : "bg-white text-gray-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {tab === "overview" && (
        isEditingOverview ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveJob(job);
            }}
            className="grid gap-4"
          >
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Opportunity title
                </label>
                <input
                  value={job.title}
                  onChange={(e) => setField("title", e.target.value)}
                  className="w-full rounded-xl border p-3"
                  required
                  disabled={!canEditOverview}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Primary delivery track
                </label>
                <input
                  value={job.roleName || ""}
                  onChange={(e) => setField("roleName", e.target.value)}
                  className="w-full rounded-xl border p-3"
                  placeholder="Proposal response support"
                  disabled={!canEditOverview}
                />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Client</label>
                <input
                  value={job.clientName || job.company || ""}
                  onChange={(e) => {
                    setField("clientName", e.target.value);
                    setField("company", e.target.value);
                  }}
                  placeholder="Client name"
                  className="w-full rounded-xl border p-3"
                  disabled={!canEditOverview}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Client representative
                </label>
                <input
                  value={job.clientContactName || ""}
                  onChange={(e) => setField("clientContactName", e.target.value)}
                  placeholder="Primary contact"
                  className="w-full rounded-xl border p-3"
                  disabled={!canEditOverview}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Client contact email
                </label>
                <input
                  value={job.clientContactEmail || ""}
                  onChange={(e) => setField("clientContactEmail", e.target.value)}
                  placeholder="client@company.com"
                  type="email"
                  className="w-full rounded-xl border p-3"
                  disabled={!canEditOverview}
                />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Buyer / issuing authority
                </label>
                <input
                  value={job.buyerOrganization || ""}
                  onChange={(e) => setField("buyerOrganization", e.target.value)}
                  placeholder="Buyer organization"
                  className="w-full rounded-xl border p-3"
                  disabled={!canEditOverview}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Solicitation number
                </label>
                <input
                  value={job.solicitationNumber || ""}
                  onChange={(e) => setField("solicitationNumber", e.target.value)}
                  placeholder="Reference number"
                  className="w-full rounded-xl border p-3"
                  disabled={!canEditOverview}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Opportunity source
                </label>
                <input
                  value={job.opportunitySource || ""}
                  onChange={(e) => setField("opportunitySource", e.target.value)}
                  placeholder="sales-call, inquiry, referral"
                  className="w-full rounded-xl border p-3"
                  disabled={!canEditOverview}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Submission deadline
                </label>
                <input
                  value={job.submissionDeadline || ""}
                  onChange={(e) => setField("submissionDeadline", e.target.value)}
                  type="date"
                  className="w-full rounded-xl border p-3"
                  disabled={!canEditOverview}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Market focus
              </label>
              <input
                value={job.marketFocus || ""}
                onChange={(e) => setField("marketFocus", e.target.value)}
                placeholder="Market, region, or buyer focus"
                className="w-full rounded-xl border p-3"
                disabled={!canEditOverview}
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Primary assignee
                </label>
                {canManageAssignments && isEditingOverview ? (
                  <select
                    value={job.assignedUserId || ""}
                    onChange={(e) => {
                      const nextId = e.target.value;
                      const selected = teamMembers.find(
                        (member) => member._id === nextId
                      );
                      setJob((prev) => ({
                        ...prev,
                        assignedUserId: nextId,
                        assignedUserEmail: selected?.email || "",
                      }));
                    }}
                    className="w-full rounded-xl border p-3"
                  >
                    <option value="">Admin only / unassigned</option>
                    {teamMembers.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.email}
                      </option>
                    ))}
                  </select>
                ) : null}
              </div>
              <div className="rounded-xl border bg-gray-50 p-3 text-sm text-gray-700">
                <div className="font-medium text-gray-900">Access model</div>
                <div className="mt-1">
                  Admin sees every opportunity. Staff only sees opportunities assigned
                  to them.
                </div>
              </div>
            </div>

            <div>
              <div className="mb-1 text-sm font-medium">Opportunity brief</div>
              <textarea
                value={job.jdText}
                onChange={(e) => setField("jdText", e.target.value)}
                className="h-[320px] w-full rounded-xl border p-3 font-mono text-[13px] leading-6"
                disabled={!canEditOverview}
              />
              <div className="mt-1 text-xs text-gray-500">
                Brief length: {briefChars}/120 {briefChars >= 120 ? "OK" : "(min 120)"}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Support areas
              </label>
              <div className="rounded-xl border p-3">
                <input
                  placeholder="Add a support area and press Enter"
                  className="w-full rounded-lg border p-2"
                  onKeyDown={(e) => {
                    if (!canEditOverview) return;
                    if (e.key !== "Enter") return;
                    e.preventDefault();
                    const value = (e.currentTarget.value || "").trim();
                    if (!value) return;
                    setField(
                      "focusAreas",
                      Array.from(new Set([...(job.focusAreas || []), value]))
                    );
                    e.currentTarget.value = "";
                  }}
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {(job.focusAreas || []).map((area) => (
                    <span
                      key={area}
                      className="inline-flex items-center gap-2 rounded-full border bg-white px-2.5 py-1 text-xs text-gray-900"
                    >
                      {area}
                      <button
                        type="button"
                        className="font-semibold text-gray-900"
                        disabled={!canEditOverview}
                        onClick={() =>
                          setField(
                            "focusAreas",
                            (job.focusAreas || []).filter((item) => item !== area)
                          )
                        }
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Internal notes
                </label>
                <textarea
                  value={job.adminFocusNotes || ""}
                  onChange={(e) => setField("adminFocusNotes", e.target.value)}
                  className="min-h-[160px] w-full rounded-xl border p-3"
                  disabled={!canEditOverview}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Opportunity documents
                </label>
                <div className="rounded-xl border bg-gray-50 p-3">
                  {job.documents && job.documents.length > 0 ? (
                    <div className="grid gap-2">
                      {job.documents.map((document) => (
                        <a
                          key={`${document.url}-${document.name}`}
                          href={document.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 hover:bg-gray-50"
                        >
                          {document.name}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      No uploaded documents yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setJob(savedOverview);
                  setIsEditingOverview(false);
                }}
                className={cx(BTN.subtle, "cursor-pointer rounded-xl px-4 py-2 text-sm")}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy || !workspaceValid}
                className={cx(
                  BTN.primary,
                  "cursor-pointer rounded-xl px-4 py-2 text-sm",
                  (busy || !workspaceValid) && "cursor-not-allowed opacity-50"
                )}
              >
                Save opportunity
              </button>
              {!workspaceValid && (
                <span className="text-xs text-red-600">
                  Fill the required opportunity fields and keep the brief at 120+ characters.
                </span>
              )}
            </div>
          </form>
        ) : (
          <div className="grid gap-5">
            <div className="flex items-start justify-between gap-4 rounded-2xl border bg-gradient-to-br from-white to-gray-50 p-5">
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Opportunity overview
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-gray-900">
                  {job.title}
                </h2>
                <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-600">
                  {job.clientName || job.company ? (
                    <span className="rounded-full border bg-white px-3 py-1">
                      Client: {job.clientName || job.company}
                    </span>
                  ) : null}
                  {job.roleName ? (
                    <span className="rounded-full border bg-white px-3 py-1">
                      Track: {job.roleName}
                    </span>
                  ) : null}
                  <span className="rounded-full border bg-white px-3 py-1">
                    Assignee: {job.assignedUserEmail || "Admin only / unassigned"}
                  </span>
                </div>
              </div>
              {canEditWorkspace ? (
                <button
                  type="button"
                  onClick={() => setIsEditingOverview(true)}
                  className={cx(BTN.primary, "cursor-pointer rounded-xl px-4 py-2 text-sm")}
                >
                  Edit opportunity
                </button>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Buyer / issuing authority", job.buyerOrganization || "-"],
                ["Solicitation number", job.solicitationNumber || "-"],
                ["Opportunity source", job.opportunitySource || "-"],
                ["Submission deadline", job.submissionDeadline || "-"],
                ["Client representative", job.clientContactName || "-"],
                ["Client contact email", job.clientContactEmail || "-"],
                ["Market focus", job.marketFocus || "-"],
                ["Access model", "Admin sees every opportunity. Staff only sees opportunities assigned to them."],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border bg-white p-4 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                    {label}
                  </div>
                  <div className="mt-2 text-sm text-gray-900">{value}</div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                  Opportunity brief
                </div>
                <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-800">
                  {job.jdText || "No brief added yet."}
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  Brief length: {briefChars} characters
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-2xl border bg-white p-5 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                    Support areas
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.focusAreas && job.focusAreas.length > 0 ? (
                      job.focusAreas.map((area) => (
                        <span
                          key={area}
                          className="inline-flex items-center rounded-full border bg-gray-50 px-3 py-1 text-xs text-gray-900"
                        >
                          {area}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No support areas yet.</span>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border bg-white p-5 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                    Opportunity documents
                  </div>
                  <div className="mt-3 grid gap-2">
                    {job.documents && job.documents.length > 0 ? (
                      job.documents.map((document) => (
                        <a
                          key={`${document.url}-${document.name}`}
                          href={document.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-900 hover:bg-gray-100"
                        >
                          {document.name}
                        </a>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">
                        No uploaded documents yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                Internal notes
              </div>
              <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-800">
                {job.adminFocusNotes || "No internal notes yet."}
              </div>
            </div>

            {!canEditWorkspace ? (
              <div className="text-xs text-gray-500">
                Opportunity details are controlled by admin. You can still manage
                workbench tasks, participant requests, and reviews.
              </div>
            ) : null}
          </div>
        )
      )}

      {tab === "workbench" && !workbenchOnly && (
        <div className="grid gap-4">
          <div className="rounded-3xl border bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Opportunity workbench
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  Manage delivery tasks, deadlines, documents, links, and subtasks in a dedicated board view.
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                  <span className="rounded-full border bg-white px-3 py-1">
                    {orderedColumns.length} columns
                  </span>
                  <span className="rounded-full border bg-white px-3 py-1">
                    {workbench.cards.length} {workbench.cards.length === 1 ? "task" : "tasks"}
                  </span>
                </div>
              </div>
              <Link
                href={`/admin/jobs/${job.code}/workbench`}
                className={cx(BTN.primary, "inline-flex cursor-pointer items-center rounded-xl px-4 py-2 text-sm")}
              >
                Open full workbench
              </Link>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {orderedColumns.slice(0, 3).map((column) => {
              const cards = cardsByColumn.get(column.id) || [];
              return (
                <div key={column.id} className="rounded-2xl border bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-gray-900">{column.title}</div>
                    <div className="text-xs text-gray-500">{cards.length} tasks</div>
                  </div>
                  <div className="mt-3 grid gap-2">
                    {cards.length > 0 ? (
                      cards.slice(0, 2).map((card) => (
                        <div key={card.id} className="rounded-xl border bg-gray-50 px-3 py-2 text-sm text-gray-900">
                          {card.title}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">No tasks yet.</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "workbench" && workbenchOnly && (
        <div className="flex h-full min-h-[calc(100vh-12rem)] flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium">Opportunity workbench</div>
              <div className="text-sm text-gray-600">
                Create columns, add tasks, and drag tasks between columns as the work moves.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="New column title"
                className="rounded-lg border px-3 py-2 text-sm"
              />
              <button
                type="button"
                disabled={workbenchBusy}
                onClick={async () => {
                  if (!newColumnTitle.trim()) {
                    showToast("Enter a column title.", "info");
                    return;
                  }
                  const nextWorkbench = {
                    ...workbench,
                    columns: [
                      ...workbench.columns,
                      {
                        id: makeId("col"),
                        title: newColumnTitle.trim(),
                        order: workbench.columns.length,
                      },
                    ],
                  };
                  setNewColumnTitle("");
                  await saveWorkbench(nextWorkbench, "Workbench column added.");
                }}
                className={cx(
                  BTN.primary,
                  "cursor-pointer rounded-lg px-3 py-2 text-sm",
                  workbenchBusy && "cursor-not-allowed opacity-50"
                )}
              >
                Add column
              </button>
            </div>
          </div>

          <div className="scrollbar-beauty min-h-0 flex-1 overflow-x-auto overflow-y-hidden pb-3">
            <div className="flex min-w-max items-start gap-4">
            {orderedColumns.map((column) => {
              const cards = cardsByColumn.get(column.id) || [];
              return (
                <div
                  key={column.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (draggedCardId) setHoverColumnId(column.id);
                  }}
                  onDragLeave={() => {
                    if (hoverColumnId === column.id) setHoverColumnId(null);
                  }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    const cardId = e.dataTransfer.getData("text/plain") || draggedCardId;
                    if (!cardId) return;
                    const draggedCard = workbench.cards.find((item) => item.id === cardId);
                    if (!draggedCard || draggedCard.columnId === column.id) {
                      setDraggedCardId(null);
                      setHoverColumnId(null);
                      return;
                    }
                    const nextCards = reorderCards(
                      workbench.cards.map((item) =>
                        item.id === cardId
                          ? {
                              ...item,
                              columnId: column.id,
                              order: (cardsByColumn.get(column.id) || []).length,
                            }
                          : item
                      )
                    );
                    setDraggedCardId(null);
                    setHoverColumnId(null);
                    await saveWorkbench(
                      { ...workbench, cards: nextCards },
                      `Task moved to ${column.title}.`
                    );
                  }}
                  className={cx(
                    "flex h-[calc(100vh-18rem)] min-h-[480px] w-[320px] shrink-0 flex-col rounded-3xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-4 shadow-sm transition",
                    hoverColumnId === column.id && "border-emerald-400 bg-emerald-50/70 shadow-md"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      {editingColumnId === column.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            value={editingColumnTitle}
                            onChange={(e) => setEditingColumnTitle(e.target.value)}
                            className="min-w-0 rounded-lg border px-3 py-1.5 text-sm text-gray-900"
                            placeholder="Column title"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                void saveColumnTitle(column.id);
                              }
                              if (e.key === "Escape") {
                                e.preventDefault();
                                cancelColumnEdit();
                              }
                            }}
                          />
                          <button
                            type="button"
                            disabled={workbenchBusy || !editingColumnTitle.trim()}
                            onClick={() => void saveColumnTitle(column.id)}
                            className={cx(
                              BTN.primary,
                              "cursor-pointer rounded-lg px-2.5 py-1.5 text-xs",
                              (workbenchBusy || !editingColumnTitle.trim()) &&
                                "cursor-not-allowed opacity-50"
                            )}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelColumnEdit}
                            className="cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="group flex items-center gap-2">
                          <div className="font-medium text-gray-900">{column.title}</div>
                          <button
                            type="button"
                            onClick={() => beginColumnEdit(column.id, column.title)}
                            className="cursor-pointer rounded-md border border-gray-200 bg-white p-1 text-gray-600 opacity-0 transition hover:bg-gray-50 hover:text-gray-900 group-hover:opacity-100"
                            aria-label={`Edit ${column.title} column`}
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
                      )}
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-gray-500">{cards.length} work items</div>
                        <button
                          type="button"
                          disabled={workbenchBusy}
                          onClick={() => setOpenComposerColumnId(column.id)}
                          className="cursor-pointer rounded-lg border border-gray-200 bg-white p-2 text-gray-700 transition hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`Add task to ${column.title}`}
                          title={`Add task to ${column.title}`}
                        >
                          <svg
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M10 4.25a.75.75 0 0 1 .75.75v4.25H15a.75.75 0 0 1 0 1.5h-4.25V15a.75.75 0 0 1-1.5 0v-4.25H5a.75.75 0 0 1 0-1.5h4.25V5a.75.75 0 0 1 .75-.75Z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={workbenchBusy || orderedColumns.length <= 1}
                      onClick={async () => {
                        const remainingColumns = workbench.columns
                          .filter((item) => item.id !== column.id)
                          .map((item, index) => ({ ...item, order: index }));
                        const fallbackColumnId = remainingColumns[0]?.id || "todo";
                        const remainingCards = workbench.cards.map((card, index) =>
                          card.columnId === column.id
                            ? { ...card, columnId: fallbackColumnId, order: index }
                            : card
                        );
                        await saveWorkbench(
                          {
                            columns: remainingColumns,
                            cards: remainingCards,
                          },
                          "Workbench column removed."
                        );
                      }}
                      className="cursor-pointer rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                    {cards.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-gray-200 bg-white/80 px-4 py-6 text-center text-sm text-gray-500">
                        No tasks in this column yet.
                      </div>
                    ) : null}
                    {cards.map((card) => {
                      const assignees = getCardAssignees(card);
                      const due = formatDue(card.dueDate, card.dueTime);
                      const subtaskProgress = getSubtaskProgress(card);
                      const creatorLabel = card.creatorName || card.creatorEmail || currentUserEmail;

                      return (
                        <div
                          key={card.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/plain", card.id);
                            e.dataTransfer.effectAllowed = "move";
                            setDraggedCardId(card.id);
                          }}
                          onDragEnd={() => {
                            setDraggedCardId(null);
                            setHoverColumnId(null);
                          }}
                          onClick={() => setActiveWorkbenchCardId(card.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setActiveWorkbenchCardId(card.id);
                            }
                          }}
                          className={cx(
                            "cursor-pointer rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-gray-300 hover:shadow-md",
                            draggedCardId === card.id && "opacity-70 ring-2 ring-emerald-300"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900">{card.title}</div>
                              {card.description ? (
                                <div className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-gray-600">
                                  {card.description}
                                </div>
                              ) : null}
                            </div>
                            <div className="shrink-0">
                              {card.creatorAvatarUrl ? (
                                <img
                                  src={card.creatorAvatarUrl}
                                  alt=""
                                  className="h-9 w-9 rounded-full border border-gray-200 object-cover"
                                />
                              ) : (
                                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-800">
                                  {getInitials(creatorLabel)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-gray-600">
                            {card.priority ? (
                              <span
                                className={cx(
                                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium",
                                  priorityClass(card.priority)
                                )}
                              >
                                <WorkbenchIcon name="flag" />
                                {priorityLabel(card.priority)}
                              </span>
                            ) : null}
                            {assignees.length > 0 ? (
                              <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5">
                                <WorkbenchIcon name="user" />
                                <span className="truncate">
                                  {assignees.length === 1 ? assignees[0] : `${assignees.length} assignees`}
                                </span>
                              </span>
                            ) : null}
                            {due ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5">
                                <WorkbenchIcon name="calendar" />
                                {due}
                              </span>
                            ) : null}
                            {subtaskProgress.total > 0 ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5">
                                <WorkbenchIcon name="check" />
                                {subtaskProgress.done}/{subtaskProgress.total}
                              </span>
                            ) : null}
                            {(card.links || []).length > 0 ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5">
                                <WorkbenchIcon name="link" />
                                {(card.links || []).length}
                              </span>
                            ) : null}
                            {(card.documents || []).length > 0 ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5">
                                <WorkbenchIcon name="paperclip" />
                                {(card.documents || []).length}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })}
            </div>
          </div>
        </div>
      )}

      {tab === "workbench" && currentComposerColumn ? (
        <div className="fixed inset-0 z-[68] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Create task
                </div>
                <div className="mt-2 text-2xl font-semibold text-gray-900">
                  {currentComposerColumn.title}
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Add a new work item to this column.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpenComposerColumnId(null);
                  setNewCard((prev) => ({
                    ...prev,
                    [currentComposerColumn.id]: EMPTY_CARD_DRAFT,
                  }));
                }}
                className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Task title
                </label>
                <input
                  value={composerDraft.title}
                  onChange={(e) =>
                    setNewCard((prev) => ({
                      ...prev,
                      [currentComposerColumn.id]: {
                        ...composerDraft,
                        title: e.target.value,
                      },
                    }))
                  }
                  placeholder="Describe the task or next action"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Description
                </label>
                <textarea
                  value={composerDraft.description}
                  onChange={(e) =>
                    setNewCard((prev) => ({
                      ...prev,
                      [currentComposerColumn.id]: {
                        ...composerDraft,
                        description: e.target.value,
                      },
                    }))
                  }
                  placeholder="Add context, deadline notes, or next steps"
                  className="min-h-[112px] w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Assignees
                  </label>
                  <input
                    value={composerDraft.assignees}
                    onChange={(e) =>
                      setNewCard((prev) => ({
                        ...prev,
                        [currentComposerColumn.id]: {
                          ...composerDraft,
                          assignees: e.target.value,
                        },
                      }))
                    }
                    placeholder="Add one or more emails"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Priority
                  </label>
                  <select
                    value={composerDraft.priority}
                    onChange={(e) =>
                      setNewCard((prev) => ({
                        ...prev,
                        [currentComposerColumn.id]: {
                          ...composerDraft,
                          priority: e.target.value as WorkbenchPriority | "",
                        },
                      }))
                    }
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900"
                  >
                    {PRIORITY_OPTIONS.map((option) => (
                      <option key={option.value || "none"} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Due date
                  </label>
                  <input
                    type="date"
                    value={composerDraft.dueDate}
                    onChange={(e) =>
                      setNewCard((prev) => ({
                        ...prev,
                        [currentComposerColumn.id]: {
                          ...composerDraft,
                          dueDate: e.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Due time
                  </label>
                  <input
                    type="time"
                    value={composerDraft.dueTime}
                    onChange={(e) =>
                      setNewCard((prev) => ({
                        ...prev,
                        [currentComposerColumn.id]: {
                          ...composerDraft,
                          dueTime: e.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setOpenComposerColumnId(null);
                  setNewCard((prev) => ({
                    ...prev,
                    [currentComposerColumn.id]: EMPTY_CARD_DRAFT,
                  }));
                }}
                className={cx(BTN.subtle, "cursor-pointer rounded-xl px-4 py-2 text-sm")}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={workbenchBusy || !composerDraft.title.trim()}
                onClick={() => void createWorkbenchTask(currentComposerColumn.id)}
                className={cx(
                  BTN.primary,
                  "cursor-pointer rounded-xl px-4 py-2 text-sm",
                  (workbenchBusy || !composerDraft.title.trim()) &&
                    "cursor-not-allowed opacity-50"
                )}
              >
                Create task
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {tab === "workbench" && activeWorkbenchCard && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-x-hidden overflow-y-auto rounded-3xl bg-white p-4 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Task details
                </div>
                <div className="mt-2 text-2xl font-semibold text-gray-900">
                  {activeWorkbenchCard.title}
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                  <span className="rounded-full border bg-gray-50 px-2.5 py-1">
                    Column: {orderedColumns.find((column) => column.id === activeWorkbenchCard.columnId)?.title || "Unknown"}
                  </span>
                  {activeWorkbenchCard.createdAt ? (
                    <span className="rounded-full border bg-gray-50 px-2.5 py-1">
                      Created: {activeWorkbenchCard.createdAt}
                    </span>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setWorkbench(savedWorkbench);
                  setActiveWorkbenchCardId(null);
                }}
                className={cx(BTN.subtle, "cursor-pointer rounded-xl px-3 py-2 text-sm")}
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="grid gap-1 text-sm font-medium text-gray-700">
                Task title
                <input
                  value={activeWorkbenchCard.title}
                  onChange={(e) =>
                    updateWorkbenchCard(activeWorkbenchCard.id, (card) => ({
                      ...card,
                      title: e.target.value,
                    }))
                  }
                  className="rounded-xl border px-3 py-2 text-sm text-gray-900"
                />
              </label>
              <label className="grid gap-1 text-sm font-medium text-gray-700">
                Move to
                <select
                  value={activeWorkbenchCard.columnId}
                  onChange={(e) =>
                    updateWorkbenchCard(activeWorkbenchCard.id, (card) => ({
                      ...card,
                      columnId: e.target.value,
                    }))
                  }
                  className="rounded-xl border px-3 py-2 text-sm text-gray-900"
                >
                  {orderedColumns.map((column) => (
                    <option key={column.id} value={column.id}>
                      {column.title}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-1 text-sm font-medium text-gray-700">
                Created by
                <div className="flex items-center gap-3 rounded-xl border bg-gray-50 px-3 py-2 text-sm text-gray-900">
                  {activeWorkbenchCard.creatorAvatarUrl ? (
                    <img
                      src={activeWorkbenchCard.creatorAvatarUrl}
                      alt=""
                      className="h-9 w-9 rounded-full border border-gray-200 object-cover"
                    />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-800">
                      {getInitials(
                        activeWorkbenchCard.creatorName ||
                          activeWorkbenchCard.creatorEmail ||
                          currentUserEmail
                      )}
                    </span>
                  )}
                  <span className="min-w-0 truncate">
                    {activeWorkbenchCard.creatorName ||
                      activeWorkbenchCard.creatorEmail ||
                      currentUserEmail ||
                      "Euman Intelligence"}
                  </span>
                </div>
              </div>
              <label className="grid gap-1 text-sm font-medium text-gray-700">
                Assignees
                <input
                  value={getCardAssignees(activeWorkbenchCard).join(", ")}
                  onChange={(e) =>
                    updateWorkbenchCard(activeWorkbenchCard.id, (card) => ({
                      ...card,
                      assigneeEmail: parseAssigneeEmails(e.target.value)[0] || "",
                      assigneeEmails: parseAssigneeEmails(e.target.value),
                    }))
                  }
                  className="rounded-xl border px-3 py-2 text-sm text-gray-900"
                  placeholder="name@company.com, teammate@company.com"
                />
              </label>
              <label className="grid gap-1 text-sm font-medium text-gray-700">
                Due date
                <input
                  type="date"
                  value={activeWorkbenchCard.dueDate || ""}
                  onChange={(e) =>
                    updateWorkbenchCard(activeWorkbenchCard.id, (card) => ({
                      ...card,
                      dueDate: e.target.value,
                    }))
                  }
                  className="rounded-xl border px-3 py-2 text-sm text-gray-900"
                />
              </label>
              <label className="grid gap-1 text-sm font-medium text-gray-700">
                Due time
                <input
                  type="time"
                  value={activeWorkbenchCard.dueTime || ""}
                  onChange={(e) =>
                    updateWorkbenchCard(activeWorkbenchCard.id, (card) => ({
                      ...card,
                      dueTime: e.target.value,
                    }))
                  }
                  className="rounded-xl border px-3 py-2 text-sm text-gray-900"
                />
              </label>
              <label className="grid gap-1 text-sm font-medium text-gray-700">
                Priority
                <select
                  value={activeWorkbenchCard.priority || ""}
                  onChange={(e) =>
                    updateWorkbenchCard(activeWorkbenchCard.id, (card) => ({
                      ...card,
                      priority: e.target.value as WorkbenchPriority | "",
                    }))
                  }
                  className="rounded-xl border px-3 py-2 text-sm text-gray-900"
                >
                  {PRIORITY_OPTIONS.map((option) => (
                    <option key={option.value || "none"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-5 grid gap-1 text-sm font-medium text-gray-700">
              Description
              <textarea
                value={activeWorkbenchCard.description || ""}
                onChange={(e) =>
                  updateWorkbenchCard(activeWorkbenchCard.id, (card) => ({
                    ...card,
                    description: e.target.value,
                  }))
                }
                className="min-h-[140px] rounded-2xl border px-3 py-3 text-sm leading-6 text-gray-900"
                placeholder="Add context, delivery notes, blockers, or next steps."
              />
            </label>

            <div className="mt-5 grid gap-5 xl:grid-cols-3">
              <div className="min-w-0 rounded-2xl border bg-gray-50 p-4">
                <div className="text-sm font-semibold text-gray-900">Links</div>
                <div className="mt-3 grid gap-2">
                  {(activeWorkbenchCard.links || []).map((link, index) => (
                    <div
                      key={`${link}-${index}`}
                      className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2"
                    >
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-w-0 flex-1 truncate text-sm text-gray-900 underline"
                      >
                        {link}
                      </a>
                      <button
                        type="button"
                        onClick={() =>
                          updateWorkbenchCard(activeWorkbenchCard.id, (card) => ({
                            ...card,
                            links: (card.links || []).filter((_, itemIndex) => itemIndex !== index),
                          }))
                        }
                        className="cursor-pointer text-xs font-medium text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className="flex flex-col gap-2">
                    <input
                      value={detailLinkInput}
                      onChange={(e) => setDetailLinkInput(e.target.value)}
                      placeholder="Add a relevant link"
                      className="min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm text-gray-900"
                    />
                    <button
                      type="button"
                      disabled={!detailLinkInput.trim()}
                      onClick={() => {
                        updateWorkbenchCard(activeWorkbenchCard.id, (card) => ({
                          ...card,
                          links: [...(card.links || []), detailLinkInput.trim()],
                        }));
                        setDetailLinkInput("");
                      }}
                      className={cx(
                        BTN.primary,
                        "cursor-pointer self-start rounded-xl px-3 py-2 text-sm",
                        !detailLinkInput.trim() && "cursor-not-allowed opacity-50"
                      )}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="min-w-0 rounded-2xl border bg-gray-50 p-4">
                <div className="text-sm font-semibold text-gray-900">Documents</div>
                <div className="mt-3 grid gap-2">
                  {(activeWorkbenchCard.documents || []).map((document, index) => (
                    <div
                      key={`${document.url}-${index}`}
                      className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2"
                    >
                      <a
                        href={document.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-w-0 flex-1 truncate text-sm text-gray-900 underline"
                      >
                        {document.name}
                      </a>
                      <button
                        type="button"
                        onClick={() =>
                          updateWorkbenchCard(activeWorkbenchCard.id, (card) => ({
                            ...card,
                            documents: (card.documents || []).filter(
                              (_, itemIndex) => itemIndex !== index
                            ),
                          }))
                        }
                        className="cursor-pointer text-xs font-medium text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <FileDropUpload
                    files={activeWorkbenchCard.documents || []}
                    onChange={(files) =>
                      updateWorkbenchCard(activeWorkbenchCard.id, (card) => ({
                        ...card,
                        documents: files,
                      }))
                    }
                    folder="workbench-documents"
                    label="Drag task files here or upload"
                    helperText="Attach briefs, screenshots, notes, or supporting files to this task."
                  />
                </div>
              </div>

              <div className="min-w-0 rounded-2xl border bg-gray-50 p-4">
                <div className="text-sm font-semibold text-gray-900">Subtasks</div>
                <div className="mt-3 grid gap-2">
                  {(activeWorkbenchCard.subtasks || []).map((subtask, index) => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(subtask.done)}
                        onChange={(e) =>
                          updateWorkbenchCard(activeWorkbenchCard.id, (card) => ({
                            ...card,
                            subtasks: (card.subtasks || []).map((item) =>
                              item.id === subtask.id ? { ...item, done: e.target.checked } : item
                            ),
                          }))
                        }
                      />
                      <span
                        className={cx(
                          "flex-1 text-sm text-gray-900",
                          subtask.done && "line-through text-gray-500"
                        )}
                      >
                        {subtask.title}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateWorkbenchCard(activeWorkbenchCard.id, (card) => ({
                            ...card,
                            subtasks: (card.subtasks || []).filter((_, itemIndex) => itemIndex !== index),
                          }))
                        }
                        className="cursor-pointer text-xs font-medium text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className="flex flex-col gap-2">
                    <input
                      value={detailSubtaskInput}
                      onChange={(e) => setDetailSubtaskInput(e.target.value)}
                      placeholder="Add a subtask"
                      className="min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm text-gray-900"
                    />
                    <button
                      type="button"
                      disabled={!detailSubtaskInput.trim()}
                      onClick={() => {
                        updateWorkbenchCard(activeWorkbenchCard.id, (card) => ({
                          ...card,
                          subtasks: [
                            ...(card.subtasks || []),
                            {
                              id: makeId("subtask"),
                              title: detailSubtaskInput.trim(),
                              done: false,
                            },
                          ],
                        }));
                        setDetailSubtaskInput("");
                      }}
                      className={cx(
                        BTN.primary,
                        "cursor-pointer self-start rounded-xl px-3 py-2 text-sm",
                        !detailSubtaskInput.trim() && "cursor-not-allowed opacity-50"
                      )}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <div className="text-xs text-gray-500">
                Save changes to keep this task aligned with the board.
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setWorkbench(savedWorkbench);
                    setActiveWorkbenchCardId(null);
                  }}
                  className={cx(BTN.subtle, "cursor-pointer rounded-xl px-4 py-2 text-sm")}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={workbenchBusy}
                  onClick={async () => {
                    const nextWorkbench = {
                      ...workbench,
                      cards: reorderCards(workbench.cards),
                    };
                    await saveWorkbench(nextWorkbench, "Task details saved.");
                    setActiveWorkbenchCardId(null);
                  }}
                  className={cx(
                    BTN.primary,
                    "cursor-pointer rounded-xl px-4 py-2 text-sm",
                    workbenchBusy && "cursor-not-allowed opacity-50"
                  )}
                >
                  Save task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "requests" && (
        <div>
          <p className="mb-2 text-gray-600">
            Share this response link or send participant requests for this opportunity by email.
          </p>
          <div className="mb-4 rounded bg-gray-600 p-2 font-mono text-xs text-white">
            Response link:{" "}
            <a href={responseLink} target="_blank" rel="noopener">
              {responseLink}
            </a>
          </div>

          <div className="mb-4">
            <div className="mb-2 text-sm font-semibold">Send by email</div>
            {inviteEmails.map((email, idx) => (
              <div key={idx} className="mb-2 flex gap-2">
                <input
                  value={email}
                  onChange={(e) => {
                    const next = [...inviteEmails];
                    next[idx] = e.target.value;
                    setInviteEmails(next);
                  }}
                  placeholder="candidate@email.com"
                  className="flex-1 rounded-lg border p-2"
                  type="email"
                />
                <button
                  type="button"
                  onClick={() =>
                    setInviteEmails(inviteEmails.filter((_, i) => i !== idx))
                  }
                  className="rounded-lg border px-2 text-xs text-red-600"
                  disabled={inviteEmails.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setInviteEmails([...inviteEmails, ""])}
              className="cursor-pointer rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
            >
              + Add recipient
            </button>
            <button
              type="button"
              onClick={sendRequests}
              disabled={inviteBusy}
              className="mt-3 cursor-pointer rounded-xl bg-black px-4 py-2 font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {inviteBusy ? "Sending..." : "Send requests"}
            </button>
            {inviteMsg && <div className="mt-2 text-red-600">{inviteMsg}</div>}
          </div>
        </div>
      )}

      {tab === "reviews" && (
        <div className="grid gap-4">
          {loadingResponses ? (
            <div className="text-gray-500">Loading participant reviews...</div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm text-gray-600">
                  Export reviewed participants and participant review summaries.
                </div>
                {canEditWorkspace && (
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={exportJsonHref}
                      className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      Export JSON
                    </a>
                    <a
                      href={exportCsvHref}
                      className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      Export CSV
                    </a>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {(
                  [
                    ["pending", "Pending responses"],
                    ["reviewed", "Reviewed participants"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => {
                      setResponseView(value);
                      if (value === "pending") setPendingPage(1);
                      else setReviewedPage(1);
                    }}
                    className={`cursor-pointer rounded-full border px-3 py-1 text-sm ${
                      responseView === value
                        ? "border-black bg-black text-white"
                        : "bg-white text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {responseView === "pending" && (
                <div>
                  <div className="font-semibold">Pending responses</div>
                  <div className="mt-2 grid gap-2">
                    {pendingResponses.length === 0 && (
                      <div className="text-xs text-gray-500">
                        No pending responses yet.
                      </div>
                    )}
                    {pendingSlice.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col gap-2 rounded-lg border p-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">
                              {item.candidate.name}
                            </div>
                            <div className="text-xs text-gray-600">
                              {item.candidate.email}
                            </div>
                            <div className="text-xs text-gray-500">
                              Status: {item.status}
                            </div>
                            <div className="mt-1 text-[11px]">
                              Stage:{" "}
                              <span className="inline-flex items-center rounded-full border px-2 py-0.5">
                                {item.pipelineStage ||
                                  item.stageStatus ||
                                  "applied"}
                              </span>
                            </div>
                          </div>

                          <PremiumSelect
                            appearance="light"
                            wrapperClassName="group relative inline-block w-40 rounded-md"
                            className="py-2 text-sm"
                            value={
                              item.pipelineStage ||
                              item.stageStatus ||
                              "applied"
                            }
                            onChange={async (e) => {
                              try {
                                await updateSession(item.id, {
                                  pipelineStage: e.target.value,
                                });
                                setMsg("Review stage updated.");
                              } catch (error: any) {
                                setErr(
                                  error.message || "Failed to update review stage"
                                );
                              }
                            }}
                          >
                            {STAGES.map((stage) => (
                              <option key={stage} value={stage}>
                                {stage}
                              </option>
                            ))}
                          </PremiumSelect>
                        </div>

                        <details className="mt-1">
                          <summary className="cursor-pointer text-xs">
                            Offer details...
                          </summary>
                          <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_140px_100px]">
                            <input
                              className="rounded-md border px-2 py-1 text-sm"
                              placeholder="Offer title"
                              defaultValue={item.offer?.title || ""}
                              onChange={(e) =>
                                (item.__draftOffer = {
                                  ...(item.__draftOffer || {}),
                                  title: e.target.value,
                                })
                              }
                            />
                            <input
                              className="rounded-md border px-2 py-1 text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                              placeholder="Rate"
                              type="number"
                              defaultValue={item.offer?.rate ?? ""}
                              onChange={(e) =>
                                (item.__draftOffer = {
                                  ...(item.__draftOffer || {}),
                                  rate: e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                                })
                              }
                            />
                            <PremiumSelect
                              wrapperClassName="group relative inline-block w-full rounded-md"
                              className="py-2 text-sm"
                              appearance="light"
                              defaultValue={item.offer?.currency || "USD"}
                              onChange={(e) =>
                                (item.__draftOffer = {
                                  ...(item.__draftOffer || {}),
                                  currency: e.target.value as Offer["currency"],
                                })
                              }
                            >
                              {["USD", "CAD", "EUR", "GBP", "NGN"].map((ccy) => (
                                <option key={ccy}>{ccy}</option>
                              ))}
                            </PremiumSelect>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              type="button"
                              className="rounded-md bg-black px-3 py-1 text-sm text-white"
                              onClick={async () => {
                                try {
                                  await updateSession(item.id, {
                                    pipelineStage: "offered",
                                    offer: {
                                      ...(item.__draftOffer || {}),
                                      status: "sent",
                                    },
                                  });
                                  setMsg("Offer details saved.");
                                } catch (error: any) {
                                  setErr(
                                    error.message ||
                                      "Failed to save offer details"
                                  );
                                }
                              }}
                            >
                              Save and mark offered
                            </button>
                            {item.offer?.status && (
                              <span className="text-xs text-gray-600">
                                Current: {item.offer.status}
                              </span>
                            )}
                          </div>
                        </details>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-center">
                    <Pagination
                      page={pendingPage}
                      totalPages={pendingPageCount}
                      onChange={setPendingPage}
                    />
                  </div>
                </div>
              )}

              {responseView === "reviewed" && (
                <div>
                  <div className="font-semibold">Reviewed participants</div>
                  <div className="mt-2 grid gap-2">
                    {reviewedResponses.length === 0 && (
                      <div className="text-xs text-gray-500">
                        No reviewed participants yet.
                      </div>
                    )}
                    {reviewedSlice.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg border bg-emerald-50 p-3"
                      >
                        <div className="font-medium">{item.candidate.name}</div>
                        <div className="text-xs text-gray-600">
                          {item.candidate.email}
                        </div>
                        <div className="text-xs text-gray-500">
                          Score: {item.score ?? "-"}
                        </div>
                        <div className="text-xs text-gray-500">
                          Finished:{" "}
                          {item.finishedAt
                            ? new Date(item.finishedAt).toLocaleString()
                            : "-"}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-center">
                    <Pagination
                      page={reviewedPage}
                      totalPages={reviewedPageCount}
                      onChange={setReviewedPage}
                    />
                  </div>
                </div>
              )}

              <div className="mt-2">
                <Link
                  href={`/admin/interviews?q=${encodeURIComponent(job.code)}`}
                  className="text-sm underline"
                >
                  Open participant reviews for this opportunity
                </Link>
              </div>
            </>
          )}
        </div>
      )}

      <InviteSentModal
        open={Boolean(inviteSuccess)}
        count={inviteSuccess?.count || 0}
        emails={inviteSuccess?.emails || []}
        onClose={() => {
          setInviteSuccess(null);
          setInviteEmails([""]);
          setInviteMsg(null);
        }}
      />
    </div>
  );
}
