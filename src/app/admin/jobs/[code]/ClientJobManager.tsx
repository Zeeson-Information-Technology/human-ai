"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

// Reuse your streaming loader from the create page
function LoaderOverlay({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px] flex items-center justify-center">
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
            d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z"
          />
        </svg>
        <div className="text-white/90 text-sm">Saving…</div>
      </div>
    </div>
  );
}

type Tab = "overview" | "candidates" | "invite";
type InterviewType = "standard" | "resume-based" | "human-data" | "software";

type ScreenerRule = {
  question: string;
  // ← matches your updated model’s union
  kind: "number" | "currency" | "select" | "boolean" | "text";
  category?:
    | "experience"
    | "language"
    | "monthly-salary"
    | "notice-period"
    | "hourly-rate"
    | "custom";
  min?: number;
  max?: number;
  options?: string[];
  idealAnswer?: any;
  qualifying?: boolean;
  qualifyWhen?: "lt" | "lte" | "eq" | "gte" | "gt" | "neq" | "in" | "nin";
  qualifyValue?: any;
  currency?: "NGN" | "USD" | "CAD" | "EUR" | "GBP";
  unit?: string;
};

type JobDTO = {
  id: string;
  code: string;
  title: string;
  company?: string;
  roleName?: string;
  jdText: string;
  languages: string[];
  focusAreas: string[];
  adminFocusNotes?: string;
  screenerQuestions?: string[];
  screenerRules?: ScreenerRule[];
  location?: string;
  locationDetails?: string;
  employmentType?: string;
  seniority?: string;
  commImportance?: number;
  startDate?: string;
  skills?: string[];
  interviewType?: InterviewType;
  salaryCurrency?: "NGN" | "USD" | "CAD" | "EUR" | "GBP";
  monthlySalaryMin?: number;
  monthlySalaryMax?: number;
  hoursPerWeek?: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

// UI stages (accepts synonyms). Server normalizes to model stages.
const STAGES = [
  "applied",
  "screening", // -> interviewing
  "interviewing",
  "offered", // -> offer
  "hired",
  "rejected",
] as const;

type StageStatus =
  | "applied"
  | "screening"
  | "interviewing"
  | "offered"
  | "hired"
  | "rejected";

type Offer = {
  title?: string;
  rate?: number;
  currency?: "USD" | "CAD" | "EUR" | "GBP" | "NGN";
  type?: "full-time" | "part-time" | "hourly" | "contract";
  startDate?: string;
  notes?: string;
  status?: "draft" | "sent" | "accepted" | "declined" | "withdrawn";
};

type SessionItem = {
  id: string;
  _id?: string; // from API
  status: "pending" | "running" | "finished" | "cancelled";
  // Prefer server field; keep legacy for back-compat display
  pipelineStage?: "applied" | "interviewing" | "offer" | "contract" | "hired" | "rejected";
  stageStatus?: StageStatus;
  offer?: Offer;
  candidate: { name: string; email: string };
  finishedAt?: string | Date;
  score?: number;
  [k: string]: any;
};

export default function ClientJobManager({
  initialJob,
}: {
  initialJob: JobDTO;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [job, setJob] = useState<JobDTO>(initialJob);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Candidates state
  const [applied, setApplied] = useState<SessionItem[]>([]);
  const [vetted, setVetted] = useState<SessionItem[]>([]);

  const [loadingCandidates, setLoadingCandidates] = useState(false);

  // Invite state
  const [inviteEmails, setInviteEmails] = useState<string[]>([""]);
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<string | null>(null);
  // UI: copied state for candidate link
  const [linkCopied, setLinkCopied] = useState(false);

  // Derived
  const jdChars = (job.jdText || "").trim().length;
  const jobInfoValid =
    job.title.trim().length > 0 &&
    (job.roleName || "").trim().length > 0 &&
    jdChars >= 120;

  // Save updates
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
      const j = await res.json();
      if (!res.ok || !j.ok) throw new Error(j.error || "Update failed");
      setJob((prev) => ({ ...prev, ...j.job }));
      setMsg("Saved!");
    } catch (e: any) {
      setErr(e.message || "Error saving");
    } finally {
      setBusy(false);
    }
  }

  async function updateSession(id: string, data: any) {
    const res = await fetch(`/api/admin/sessions/${id}`, {
      method: "PATCH", // ⬅️ was PUT
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const j = await res.json();
    if (!res.ok || !j.ok)
      throw new Error(j.error || "Failed to update session");

    // Normalize id for the UI (API returns _id)
    const updated = { id: j.session._id || j.session.id, ...j.session };

    // Soft-refresh the lists using the normalized id
    setApplied((prev) => prev.map((s: any) => (s.id === id ? updated : s)));
    setVetted((prev) => prev.map((s: any) => (s.id === id ? updated : s)));
  }

  // Load candidates on demand
  useEffect(() => {
    async function load() {
      if (tab !== "candidates") return;
      setLoadingCandidates(true);
      try {
        const res = await fetch(`/api/admin/jobs/${job.code}/sessions`);
        const j = await res.json();
        if (res.ok && j.ok) {
          const normalize = (arr: any[]) =>
            arr.map((s) => ({ id: s._id || s.id, ...s }));

          const all = normalize(j.sessions);
          setApplied(all.filter((s: any) => s.status !== "finished"));
          setVetted(all.filter((s: any) => s.status === "finished"));
        } else {
          setErr(j.error || "Failed to load candidates");
        }
      } catch (e: any) {
        setErr(e.message || "Failed to load candidates");
      } finally {
        setLoadingCandidates(false);
      }
    }
    load();
  }, [tab, job.code]);

  // Handlers
  const toggleActive = async () => saveJob({ active: !job.active });

  const [inviteOk, setInviteOk] = useState<boolean | null>(null);

  async function sendInvites() {
    setInviteBusy(true);
    setInviteMsg(null);
    setInviteOk(null);
    try {
      const res = await fetch("/api/email/invite-multi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobCode: job.code,
          emails: inviteEmails.filter((e) => e.trim()),
        }),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) throw new Error(j.error || "Invite failed");
      setInviteMsg("Invites sent!");
      setInviteOk(true);
    } catch (e: any) {
      setInviteMsg(e.message || "Invite error");
      setInviteOk(false);
    } finally {
      setInviteBusy(false);
    }
  }

  // Little helper
  function set<K extends keyof JobDTO>(key: K, value: JobDTO[K]) {
    setJob((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="rounded-2xl border p-5">
      <LoaderOverlay show={busy} />

      {/* Top bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-gray-600">
          Code: <span className="font-mono">{job.code}</span> • Created:{" "}
          {job.createdAt ? new Date(job.createdAt).toLocaleString() : "—"}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleActive}
            className={`rounded-lg px-3 py-1 text-sm font-medium cursor-pointer ${
              job.active ? "bg-emerald-600 text-white" : "bg-black text-white"
            }`}
          >
            {job.active ? "Active" : "Activate"}
          </button>
          <button
            type="button"
            className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50 cursor-pointer"
            onClick={() => {
              try {
                const origin = typeof window !== "undefined" ? window.location.origin : "";
                const url = `${origin}/jobs/apply?code=${job.code}`;
                navigator.clipboard.writeText(url);
                setLinkCopied(true);
                window.setTimeout(() => setLinkCopied(false), 2000);
              } catch {}
            }}
            title="Copy public candidate apply link"
            aria-label="Copy public candidate apply link"
          >
            {linkCopied ? "Copied!" : "Copy candidate link"}
          </button>
          {linkCopied && (
            <span className="text-xs text-emerald-700" aria-live="polite">Link copied</span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-2">
        {(["overview", "candidates", "invite"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-3 py-1 border cursor-pointer ${
              tab === t ? "bg-black text-white" : "bg-white text-gray-900"
            }`}
          >
            {t === "overview"
              ? "Overview / Edit"
              : t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Messages */}
      {msg && <div className="mb-3 text-emerald-700 text-sm">{msg}</div>}
      {err && <div className="mb-3 text-red-600 text-sm">{err}</div>}

      {/* OVERVIEW / EDIT */}
      {tab === "overview" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveJob(job);
          }}
          className="grid gap-4"
        >
          {/* Basic */}
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">
                Job Title
              </label>
              <input
                value={job.title}
                onChange={(e) => set("title", e.target.value)}
                className="rounded-xl border p-3 w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Role Name
              </label>
              <input
                value={job.roleName || ""}
                onChange={(e) => set("roleName", e.target.value)}
                className="rounded-xl border p-3 w-full"
                required
              />
            </div>
          </div>

          <input
            value={job.company || ""}
            onChange={(e) => set("company", e.target.value)}
            placeholder="Company"
            className="rounded-xl border p-3 w-full"
          />

          {/* Interview type */}
          <div>
            <div className="mb-1 text-sm font-medium">Interview Type</div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  "standard",
                  "resume-based",
                  "human-data",
                  "software",
                ] as InterviewType[]
              ).map((k) => (
                <button
                  type="button"
                  key={k}
                  onClick={() => set("interviewType", k)}
                  className={`rounded-full border px-3 py-1 text-sm cursor-pointer ${
                    job.interviewType === k
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-gray-900 border-white/20 hover:bg-gray-100"
                  }`}
                >
                  {k === "human-data"
                    ? "Human Data"
                    : k === "resume-based"
                    ? "Resume-based"
                    : k === "software"
                    ? "Software Engineer"
                    : "Standard"}
                </button>
              ))}
            </div>
          </div>

          {/* JD */}
          <div>
            <div className="mb-1 text-sm font-medium">Job Description (JD)</div>
            <textarea
              value={job.jdText}
              onChange={(e) => set("jdText", e.target.value)}
              className="rounded-xl border p-3 h-[320px] w-full overflow-auto leading-6 font-mono text-[13px]"
            />
            <div className="mt-1 text-xs text-gray-500">
              JD length: {jdChars}/120 {jdChars >= 120 ? "✓" : "(min 120)"}
            </div>
          </div>

          {/* Languages (dropdown for best contrast) */}
          <div>
            <label className="block text-sm font-medium mb-1">Languages</label>
            <select
              value=""
              onChange={(e) => {
                const v = e.target.value;
                if (!v) return;
                set(
                  "languages",
                  Array.from(new Set([...(job.languages || []), v]))
                );
                e.currentTarget.selectedIndex = 0;
              }}
              className="rounded-xl border px-3 py-2 bg-white text-gray-900 [color-scheme:light]
                         dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600 dark:[color-scheme:dark]"
            >
              <option value="">+ Add language…</option>
              {[
                ["en", "English"],
                ["es", "Spanish"],
                ["fr", "French"],
                ["pt", "Portuguese"],
                ["de", "German"],
                ["yo", "Yorùbá"],
                ["ig", "Igbo"],
                ["ha", "Hausa"],
                ["pcm", "Nigerian Pidgin"],
              ].map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
            <div className="mt-2 flex flex-wrap gap-2">
              {(job.languages || []).map((code) => (
                <span
                  key={code}
                  className="inline-flex items-center gap-2 rounded-full border bg-white px-2.5 py-1 text-xs"
                >
                  {code}
                  <button
                    type="button"
                    onClick={() =>
                      set(
                        "languages",
                        (job.languages || []).filter((c) => c !== code)
                      )
                    }
                    className="text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Focus areas / notes */}
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">
                Add focus area
              </label>
              <div className="flex gap-2">
                <input
                  placeholder="e.g., De-escalation"
                  className="flex-1 rounded-lg border p-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const v = (e.currentTarget.value || "").trim();
                      if (!v) return;
                      set(
                        "focusAreas",
                        Array.from(new Set([...(job.focusAreas || []), v]))
                      );
                      e.currentTarget.value = "";
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const el = document.querySelector<HTMLInputElement>(
                      'input[placeholder="e.g., De-escalation"]'
                    );
                    const v = (el?.value || "").trim();
                    if (!v) return;
                    set(
                      "focusAreas",
                      Array.from(new Set([...(job.focusAreas || []), v]))
                    );
                    if (el) el.value = "";
                  }}
                  className="rounded-lg border px-3"
                >
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(job.focusAreas || []).map((f) => (
                  <span
                    key={f}
                    className="rounded-full border bg-white px-2.5 py-1 text-xs"
                  >
                    {f}
                    <button
                      type="button"
                      className="ml-2 text-red-600"
                      onClick={() =>
                        set(
                          "focusAreas",
                          (job.focusAreas || []).filter((x) => x !== f)
                        )
                      }
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Internal notes
              </label>
              <textarea
                value={job.adminFocusNotes || ""}
                onChange={(e) => set("adminFocusNotes", e.target.value)}
                className="rounded-xl border p-3 min-h-[84px] w-full"
              />
            </div>
          </div>

          {/* Save */}
          <div className="mt-3 flex items-center gap-2">
            <button
              type="submit"
              disabled={!jobInfoValid}
              className="rounded-xl bg-black px-4 py-2 font-medium text-white disabled:opacity-50"
            >
              Save changes
            </button>
            {!jobInfoValid && (
              <span className="text-xs text-red-600">
                Fill required fields and ensure JD ≥ 120 chars.
              </span>
            )}
          </div>
        </form>
      )}

      {/* CANDIDATES */}
      {tab === "candidates" && (
        <div className="grid gap-4">
          {loadingCandidates ? (
            <div className="text-gray-500">Loading candidates…</div>
          ) : (
            <>
              <div>
                <div className="font-semibold">Applied Candidates</div>
                <div className="grid gap-2 mt-2">
                  {applied.length === 0 && (
                    <div className="text-xs text-gray-500">
                      No applied candidates yet.
                    </div>
                  )}
                  {applied.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-lg border p-3 flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">{c.candidate.name}</div>
                          <div className="text-xs text-gray-600">
                            {c.candidate.email}
                          </div>
                          <div className="text-xs text-gray-500">
                            Status: {c.status}
                          </div>
                          <div className="mt-1 text-[11px]">
                            Stage:{" "}
                            <span className="inline-flex items-center rounded-full border px-2 py-0.5">
                              {c.pipelineStage || c.stageStatus || "applied"}
                            </span>
                          </div>
                        </div>

                        {/* stage picker */}
                        <div className="flex items-center gap-2">
                          <select
                            className="rounded-md border px-2 py-1 text-sm"
                            value={c.pipelineStage || c.stageStatus || "applied"}
                            onChange={async (e) => {
                              try {
                                await updateSession(c.id, {
                                  pipelineStage: e.target.value,
                                });
                                setMsg("Stage updated");
                              } catch (e: any) {
                                setErr(e.message || "Failed to update stage");
                              }
                            }}
                          >
                            {STAGES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* quick offer inline editor */}
                      <details className="mt-1">
                        <summary className="text-xs cursor-pointer">
                          Offer…
                        </summary>
                        <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_140px_100px]">
                          <input
                            className="rounded-md border px-2 py-1 text-sm"
                            placeholder="Title (e.g., Frontend Dev)"
                            defaultValue={c.offer?.title || ""}
                            onChange={(e) =>
                              (c.__draftOffer = {
                                ...(c.__draftOffer || {}),
                                title: e.target.value,
                              })
                            }
                          />
                          <input
                            className="rounded-md border px-2 py-1 text-sm"
                            placeholder="Rate"
                            type="number"
                            defaultValue={c.offer?.rate ?? ""}
                            onChange={(e) =>
                              (c.__draftOffer = {
                                ...(c.__draftOffer || {}),
                                rate: e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              })
                            }
                          />
                          <select
                            className="rounded-md border px-2 py-1 text-sm"
                            defaultValue={c.offer?.currency || "USD"}
                            onChange={(e) =>
                              (c.__draftOffer = {
                                ...(c.__draftOffer || {}),
                                currency: e.target.value,
                              })
                            }
                          >
                            {["USD", "CAD", "EUR", "GBP", "NGN"].map((ccy) => (
                              <option key={ccy}>{ccy}</option>
                            ))}
                          </select>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            className="rounded-md bg-black px-3 py-1 text-sm text-white"
                            onClick={async () => {
                          try {
                                await updateSession(c.id, {
                                  pipelineStage: "offered",
                                  offer: {
                                    ...(c.__draftOffer || {}),
                                    status: "sent",
                                  },
                                });
                                setMsg("Offer saved");
                              } catch (e: any) {
                                setErr(e.message || "Failed to save offer");
                              }
                            }}
                          >
                            Save & mark Offered
                          </button>
                          {c.offer?.status && (
                            <span className="text-xs text-gray-600">
                              Current: {c.offer.status}
                            </span>
                          )}
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-semibold">Vetted Candidates</div>
                <div className="grid gap-2 mt-2">
                  {vetted.length === 0 && (
                    <div className="text-xs text-gray-500">
                      No vetted candidates yet.
                    </div>
                  )}
                  {vetted.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-lg border p-2 bg-emerald-50"
                    >
                      <div className="font-medium">{c.candidate.name}</div>
                      <div className="text-xs text-gray-600">
                        {c.candidate.email}
                      </div>
                      <div className="text-xs text-gray-500">
                        Score: {c.score ?? "—"}
                      </div>
                      <div className="text-xs text-gray-500">
                        Finished:{" "}
                        {c.finishedAt
                          ? new Date(c.finishedAt).toLocaleString()
                          : "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-2">
                <Link
                  href={`/admin/interviews?q=${encodeURIComponent(job.code)}`}
                  className="text-sm underline"
                >
                  View in Interviews list →
                </Link>
              </div>
            </>
          )}
        </div>
      )}

      {/* INVITE */}
      {tab === "invite" && (
        <div>
          <p className="mb-2 text-gray-600">
            Share this job link or invite candidates by email.
          </p>
          <div className="mb-4">
            <div className="font-mono text-xs bg-gray-600 rounded p-2">
              Job link:{" "}
              <a
                href={`/jobs/apply?code=${job.code}`}
                target="_blank"
                rel="noopener"
              >
                {typeof window !== "undefined" ? window.location.origin : ""}
                /jobs/apply?code={job.code}
              </a>
            </div>
          </div>

          <div className="mb-4">
            <div className="font-semibold text-sm mb-2">Invite by email</div>
            {inviteEmails.map((email, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  value={email}
                  onChange={(e) => {
                    const arr = [...inviteEmails];
                    arr[idx] = e.target.value;
                    setInviteEmails(arr);
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
              className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-500 cursor-pointer"
            >
              + Add candidate
            </button>
            <button
              type="button"
              onClick={sendInvites}
              disabled={inviteBusy}
              className="mt-3 rounded-xl bg-black px-4 py-2 font-medium text-white 
              hover:opacity-90 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
            >
              {inviteBusy ? "Sending…" : "Send Invites"}
            </button>
            {inviteMsg && (
              <div className={`mt-2 ${inviteOk ? "text-emerald-700" : "text-red-600"}`}>
                {inviteMsg}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
