"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import samples from "@/data/demo/textSamples.json";
import { Spinner } from "@/components/spinner";

type Sample = {
  id: string;
  task: string;
  source: string;
  target?: string;
  guideline: string;
  labels: string[];
};

type SaveResp = { ok?: boolean; id?: string; ids?: string[]; error?: string };

async function saveAnnotationBulk(payload: {
  taskId: string;
  task: string;
  item: {
    sourceText: string;
    targetText?: string;
    labels: string[];
  };
}) {
  const res = await fetch("/api/annotations/text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      taskId: payload.taskId,
      task: payload.task,
      items: [payload.item],
    }),
  });
  const json: SaveResp = await res.json().catch(() => ({} as SaveResp));
  if (!res.ok || !json.ok) {
    throw new Error(json?.error || "Failed to save annotation");
  }
  const id: string | undefined =
    json.id ?? (Array.isArray(json.ids) ? json.ids[0] : undefined);
  return { id: id || "" };
}

/** Premium success modal (unchanged except id handling) */
function SuccessModal({
  open,
  onClose,
  onNext,
  id,
}: {
  open: boolean;
  onClose: () => void;
  onNext: () => void;
  id: string | null;
}) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (open && closeRef.current) closeRef.current.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => setShowDetails(false), [open, id]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="save-title"
      aria-describedby="save-desc"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl ring-1 ring-black/5">
        <div
          className="h-1.5 w-full"
          aria-hidden
          style={{
            background:
              "linear-gradient(90deg, rgba(16,185,129,1) 0%, rgba(6,182,212,0.9) 50%, rgba(16,185,129,1) 100%)",
          }}
        />
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-2 top-2 rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.22 4.22a.75.75 0 0 1 1.06 0L10 8.94l4.72-4.72a.75.75 0 1 1 1.06 1.06L11.06 10l4.72 4.72a.75.75 0 1 1-1.06 1.06L10 11.06l-4.72 4.72a.75.75 0 0 1-1.06-1.06L8.94 10 4.22 5.28a.75.75 0 0 1 0-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <div className="p-6 text-center">
          <div className="relative mx-auto flex h-14 w-14 items-center justify-center">
            <div
              className="pointer-events-none absolute inset-0 rounded-full blur-xl opacity-70"
              aria-hidden
              style={{
                background:
                  "radial-gradient(60% 60% at 50% 50%, rgba(16,185,129,0.45) 0%, rgba(6,182,212,0.25) 50%, rgba(255,255,255,0) 80%)",
              }}
            />
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200 shadow-sm animate-[popIn_320ms_ease-out]">
              <svg
                className="h-7 w-7 text-emerald-600"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <h2
            id="save-title"
            className="mt-4 text-lg font-semibold text-gray-900"
          >
            Annotation saved
          </h2>
          <p id="save-desc" className="mt-1 text-sm text-gray-700">
            Your decision is now part of Africa’s Data Engine.
          </p>
          {id ? (
            <div className="mt-4">
              <button
                onClick={() => setShowDetails((s) => !s)}
                className="text-xs font-medium text-gray-700 underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-md px-1 py-0.5 cursor-pointer"
                aria-expanded={showDetails}
              >
                {showDetails ? "Hide details" : "Show details"}
              </button>
              {showDetails && (
                <div className="mt-2 rounded-lg border bg-gray-50 px-3 py-2">
                  <div className="flex items-center justify-between gap-3">
                    <code className="text-[11px] text-gray-800 break-all">
                      id: {id}
                    </code>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(id);
                        } catch {}
                      }}
                      className="rounded-md border border-gray-300 px-2 py-1 text-[11px] font-medium text-gray-800 hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
          <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
            <button
              ref={closeRef}
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onNext();
              }}
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 active:opacity-85 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
            >
              Next sample →
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes popIn {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          60% {
            transform: scale(1.06);
            opacity: 1;
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

function CompletionModal({
  open,
  onRestart,
  onContact,
  total,
}: {
  open: boolean;
  onRestart: () => void;
  onContact: () => void;
  total: number;
}) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (open && closeRef.current) closeRef.current.focus();
  }, [open]);
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="done-title"
      aria-describedby="done-desc"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl ring-1 ring-black/5">
        <div
          className="h-1.5 w-full"
          aria-hidden
          style={{
            background:
              "linear-gradient(90deg, rgba(6,182,212,1) 0%, rgba(16,185,129,0.9) 50%, rgba(6,182,212,1) 100%)",
          }}
        />
        <div className="p-6 text-center">
          <div className="relative mx-auto flex h-14 w-14 items-center justify-center">
            <div
              className="pointer-events-none absolute inset-0 rounded-full blur-xl opacity-70"
              aria-hidden
              style={{
                background:
                  "radial-gradient(60% 60% at 50% 50%, rgba(6,182,212,0.45) 0%, rgba(16,185,129,0.25) 50%, rgba(255,255,255,0) 80%)",
              }}
            />
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-50 ring-1 ring-cyan-200 shadow-sm">
              <svg
                className="h-7 w-7 text-cyan-600"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 6v6l4 2"
                  stroke="currentColor"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <h2
            id="done-title"
            className="mt-4 text-lg font-semibold text-gray-900"
          >
            All done — {total}/{total} saved
          </h2>
          <p id="done-desc" className="mt-1 text-sm text-gray-700">
            Thanks! This is how we turn reviewer judgment into measurable
            evidence.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button
              ref={closeRef}
              onClick={onRestart}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
            >
              Restart demo
            </button>
            <button
              onClick={onContact}
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
            >
              Book a demo
            </button>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Want document OCR or eval suites next? We can enable them after a
            quick call.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AnnotateTextDemo() {
  const data = samples as Sample[];

  // One-time shuffle
  const dataset = useMemo(() => {
    const arr = [...data];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [data]);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [draftLabel, setDraftLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [completeOpen, setCompleteOpen] = useState(false);

  const s = useMemo(() => dataset[idx], [dataset, idx]);
  const total = dataset.length;
  const isLast = idx === total - 1;

  const toggle = (l: string) =>
    setSelected((prev) =>
      prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]
    );

  const addCustom = () => {
    const t = draftLabel.trim();
    if (!t) return;
    // add to local chips for this sample only
    // AFTER
    if (!s.labels.includes(t)) {
      s.labels.push(t);
    }

    if (!selected.includes(t)) setSelected((p) => [...p, t]);
    setDraftLabel("");
  };

  const goPrev = useCallback(() => {
    setSelected([]);
    setIdx((i) => Math.max(0, i - 1));
  }, []);
  const goNext = useCallback(() => {
    setSelected([]);
    setIdx((i) => Math.min(total - 1, i + 1));
  }, [total]);
  const restart = useCallback(() => {
    setCompleteOpen(false);
    setIdx(0);
    setSelected([]);
  }, []);

  const onSave = useCallback(async () => {
    if (!selected.length) return;
    try {
      setBusy(true);
      const { id } = await saveAnnotationBulk({
        taskId: s.id,
        task: s.task,
        item: {
          sourceText: s.source,
          targetText: s.target,
          labels: selected,
        },
      });
      setSavedId(id || null);

      if (isLast) {
        setModalOpen(false);
        setCompleteOpen(true);
      } else {
        setModalOpen(true);
      }
    } catch (e) {
      alert(String(e));
    } finally {
      setBusy(false);
    }
  }, [s, selected, isLast]);

  // Keyboard: ← / → navigate, Enter to save when something selected
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (modalOpen || busy || completeOpen) return;
      if (e.key === "ArrowRight" && !isLast) goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Enter" && selected.length) onSave();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    busy,
    goNext,
    goPrev,
    onSave,
    selected.length,
    modalOpen,
    completeOpen,
    isLast,
  ]);

  const progressPct = ((idx + 1) / total) * 100;

  return (
    <>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl">
          <div className="flex items-baseline justify-between">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
              aria-label="Back to demo hub"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M12.78 15.53a.75.75 0 0 1-1.06 0L6.97 10.78a.75.75 0 0 1 0-1.06l4.75-4.75a.75.75 0 1 1 1.06 1.06L8.56 10l4.22 4.22a.75.75 0 0 1 0 1.06z" />
              </svg>
              Back
            </Link>
            <span className="text-sm text-gray-500">
              {idx + 1} / {total} • {Math.round(((idx + 1) / total) * 100)}%
            </span>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border shadow-sm">
            <div className="relative h-1 w-full bg-gray-100">
              <div
                className="absolute left-0 top-0 h-1 bg-emerald-500 transition-[width] duration-500"
                style={{ width: `${progressPct}%` }}
                aria-hidden
              />
            </div>

            <div className="p-6">
              <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-gray-700">
                {s.task}
              </div>
              <h1 className="mt-4 text-2xl font-bold">Text Annotation</h1>

              <p className="mt-4 text-lg font-semibold">{s.source}</p>
              {s.target ? (
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Target:</span> {s.target}
                </p>
              ) : null}

              <p className="mt-3 text-sm text-emerald-700">
                <span className="font-medium">Guideline:</span> {s.guideline}
              </p>

              {/* Multi-select chips */}
              <div className="mt-5 flex flex-wrap gap-2">
                {s.labels.map((l) => {
                  const active = selected.includes(l);
                  return (
                    <button
                      key={l}
                      onClick={() => toggle(l)}
                      className={`rounded-lg border px-3 py-1 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer ${
                        active
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                      aria-pressed={active}
                    >
                      {l}
                    </button>
                  );
                })}
              </div>

              {/* Optional custom label adder (local to this item) */}
              <div className="mt-3 flex items-center gap-2">
                <input
                  value={draftLabel}
                  onChange={(e) => setDraftLabel(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustom()}
                  placeholder="Add custom label…"
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <button
                  onClick={addCustom}
                  className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  Add
                </button>
              </div>

              {/* Controls */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={goPrev}
                    disabled={busy || idx === 0}
                    className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={goNext}
                    disabled={busy || isLast}
                    className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                  >
                    Next →
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    ⏎ Save • ←/→ Navigate
                  </span>
                  <button
                    onClick={onSave}
                    disabled={!selected.length || busy}
                    aria-busy={busy ? "true" : "false"}
                    className={[
                      "rounded-xl px-4 py-2 text-sm font-medium text-white",
                      "bg-black hover:opacity-90 active:opacity-85 disabled:opacity-50",
                      "focus:outline-none focus:ring-2 focus:ring-emerald-400",
                      "cursor-pointer transition shadow-sm hover:-translate-y-0.5",
                    ].join(" ")}
                  >
                    {busy ? <Spinner className="h-4 w-4" /> : null}
                    {busy
                      ? "Saving…"
                      : isLast
                      ? "Save & finish"
                      : "Save annotation"}
                  </button>
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-500">
                This pilot stores task, decision(s), and metadata so we can
                compute agreement metrics later.
              </p>
            </div>
          </div>
        </div>
      </div>

      <SuccessModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onNext={() => {
          setModalOpen(false);
          setSavedId(null);
          goNext();
        }}
        id={savedId}
      />

      <CompletionModal
        open={completeOpen}
        onRestart={restart}
        onContact={() => (window.location.href = "/contact")}
        total={total}
      />
    </>
  );
}
