// src/app/demo/lang-collect/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import prompts from "@/data/demo/prompts.json";
import { Spinner } from "@/components/spinner";

type Prompt = { id: string; text: string };

// With this:
type SaveAudioPayload = {
  phraseId: string;
  phraseEn: string;
  language: string;
  accent?: string;
  translationText: string;
  audioUrl: string;
  audioPublicId: string;
  durationMs?: number;
  deviceInfo?: string;
  userId?: string;
  consent?: boolean;
};

// Cloudinary signed upload (reuse your /api/cloudinary/sign)
// NOTE: audio uses the *video* upload API on Cloudinary
async function uploadAudioToCloudinary(file: File) {
  const signRes = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder: "equatoria-lang" }),
  });
  if (!signRes.ok) throw new Error("Failed to get upload signature");
  const { ok, cloudName, apiKey, timestamp, folder, signature } =
    await signRes.json();
  if (!ok) throw new Error("Signature response invalid");

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);
  form.append("folder", folder);

  // audio -> video/upload
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;
  const upRes = await fetch(uploadUrl, { method: "POST", body: form });
  if (!upRes.ok) throw new Error("Cloudinary upload failed");
  const json = await upRes.json();
  return { url: json.secure_url as string, publicId: json.public_id as string };
}

async function saveAudioRecord(
  payload: SaveAudioPayload
): Promise<{ ok: true; id: string }> {
  const res = await fetch("/api/audio/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as { ok: true; id: string };
}

const LANGS = ["Yoruba", "Hausa", "Igbo", "Pidgin", "Ibibio"];

/** Success modal (intermediate) */
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
            Sample saved
          </h2>
          <p id="save-desc" className="mt-1 text-sm text-gray-700">
            Thank you for contributing your voice and translation.
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
                        } catch {
                          /* no-op */
                        }
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

/** Completion modal (final) */
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
          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            All done — {total}/{total} saved
          </h2>
          <p className="mt-1 text-sm text-gray-700">
            Thanks for lending your voice to Africa’s Data Engine.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button
              ref={closeRef}
              onClick={onRestart}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
            >
              Restart
            </button>
            <button
              onClick={onContact}
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
            >
              Book a demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LangCollectPage() {
  const data = prompts as Prompt[];

  // optional shuffle once
  const dataset = useMemo(() => {
    const arr = [...data];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [data]);

  const [idx, setIdx] = useState(0);
  const s = dataset[idx];
  const total = dataset.length;
  const isLast = idx === total - 1;

  // form state
  const [language, setLanguage] = useState<string>(LANGS[0]);
  const [accent, setAccent] = useState<string>("");
  const [translation, setTranslation] = useState<string>("");

  // recording state
  const [rec, setRec] = useState<MediaRecorder | null>(null);
  const chunks = useRef<BlobPart[]>([]);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startTs = useRef<number>(0);
  const timer = useRef<number | null>(null);

  const [busy, setBusy] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  // NEW: modals
  const [modalOpen, setModalOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);

  // start recording
  const start = useCallback(async () => {
    setSavedId(null);
    setBlob(null);
    setAudioUrl(null);
    chunks.current = [];

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mime = MediaRecorder.isTypeSupported("audio/webm")
      ? "audio/webm"
      : MediaRecorder.isTypeSupported("audio/mp4")
      ? "audio/mp4"
      : "";

    const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    mr.ondataavailable = (e) => e.data && chunks.current.push(e.data);
    mr.onstop = () => {
      const b = new Blob(chunks.current, { type: mime || "audio/webm" });
      setBlob(b);
      setAudioUrl(URL.createObjectURL(b));
      stream.getTracks().forEach((t) => t.stop());
    };
    mr.start();

    setRec(mr);
    setRecording(true);
    startTs.current = Date.now();
    setElapsed(0);
    timer.current = window.setInterval(() => {
      setElapsed(Date.now() - startTs.current);
    }, 200) as unknown as number;
  }, []);

  // stop recording
  const stop = useCallback(() => {
    if (!rec) return;
    rec.stop();
    setRec(null);
    setRecording(false);
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
    setElapsed(Date.now() - startTs.current);
  }, [rec]);

  const reRecord = () => {
    setBlob(null);
    setAudioUrl(null);
    setElapsed(0);
  };

  const onSave = useCallback(async () => {
    if (!translation.trim()) {
      alert("Please enter your translation.");
      return;
    }
    if (!blob) {
      alert("Please record audio for this sentence.");
      return;
    }
    try {
      setBusy(true);
      // Upload
      const file = new File([blob], "speech.webm", {
        type: blob.type || "audio/webm",
      });
      const { url, publicId } = await uploadAudioToCloudinary(file);

      // Persist
      const payload = {
        phraseId: s.id,
        phraseEn: s.text,
        language,
        accent: accent || undefined,
        translationText: translation.trim(),
        audioUrl: url,
        audioPublicId: publicId,
        durationMs: elapsed,
        deviceInfo: navigator.userAgent,
        consent: true,
      };
      const res = await saveAudioRecord(payload);
      setSavedId(res.id);

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
  }, [blob, elapsed, language, accent, translation, s, isLast]);

  // keyboard helper: Space toggles record; Ctrl+Enter saves (but not when typing)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (busy) return;

      const active = document.activeElement as HTMLElement | null;
      const typing =
        !!active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.tagName === "SELECT" ||
          active.isContentEditable);

      if (e.code === "Space") {
        if (typing) return;
        e.preventDefault();
        if (recording) {
          stop();
        } else {
          start();
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "enter") {
        onSave();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, recording, start, stop, onSave]);

  const mm = Math.floor(elapsed / 60000)
    .toString()
    .padStart(2, "0");
  const ss = Math.floor((elapsed % 60000) / 1000)
    .toString()
    .padStart(2, "0");

  return (
    <>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl">
          {/* Top bar */}
          <div className="flex items-baseline justify-between">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
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

          {/* Card */}
          <div className="mt-4 overflow-hidden rounded-2xl border shadow-sm">
            <div className="relative h-1 w-full bg-gray-100">
              <div
                className="absolute left-0 top-0 h-1 bg-emerald-500 transition-[width] duration-500"
                style={{ width: `${((idx + 1) / total) * 100}%` }}
              />
            </div>

            <div className="p-6">
              <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-gray-700">
                Euman AI Voice Lab — Speech &amp; Translation
              </div>

              <h1 className="mt-4 text-2xl font-bold">
                Record your translation
              </h1>

              {/* Prompt */}
              <div className="mt-4 rounded-xl border p-4 bg-gradient-to-r from-emerald-50 to-cyan-50">
                <div className="text-xs font-medium text-emerald-700">
                  English sentence
                </div>
                <p className="mt-1 text-xl font-semibold text-gray-900 leading-snug">
                  {s.text}
                </p>
              </div>

              {/* Language + accent */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="space-y-1 cursor-pointer">
                  <label className="text-xs text-gray-600">Language</label>

                  {/* Premium select wrapper with gradient border */}
                  <div className="mt-1 rounded-2xl p-[1.5px] bg-gradient-to-r from-emerald-400 via-emerald-300 to-cyan-400">
                    <div className="relative rounded-[14px] bg-white shadow-sm">
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full appearance-none rounded-[14px] bg-transparent px-4 py-2.5 text-sm
                           text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 cursor-pointer"
                      >
                        {LANGS.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>

                      {/* Chevron */}
                      <svg
                        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.24 4.39a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06z" />
                      </svg>
                    </div>
                  </div>

                  <p className="mt-1 text-[11px] text-gray-500">
                    Supports Yorùbá, Hausa, Igbo, Pidgin &amp; Ibibio.
                  </p>
                </div>

                <div>
                  <label className="text-xs text-gray-600">
                    Accent (optional)
                  </label>
                  <input
                    value={accent}
                    onChange={(e) => setAccent(e.target.value)}
                    placeholder="e.g., Lagos, Kano, Enugu…"
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>

              {/* Written translation */}
              <div className="mt-4">
                <label className="text-xs text-gray-600">
                  Write your translation
                </label>
                <textarea
                  value={translation}
                  onChange={(e) => setTranslation(e.target.value)}
                  placeholder="Type your translation in the selected language"
                  rows={3}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              {/* Recorder */}
              <div className="mt-5 rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-900">Audio</div>
                  <div className="text-xs text-gray-500">
                    {mm}:{ss}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {!recording ? (
                    <button
                      onClick={start}
                      className="group relative inline-flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-semibold text-white
                                 bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-600
                                 shadow-xl ring-1 ring-black/10 hover:shadow-2xl transition
                                 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                    >
                      {/* pulsing red dot */}
                      <span className="relative flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75 animate-ping" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500" />
                      </span>
                      Start recording
                    </button>
                  ) : (
                    <button
                      onClick={stop}
                      className="inline-flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-semibold text-white
                                 bg-gradient-to-r from-rose-600 to-red-600
                                 shadow ring-1 ring-red-300 hover:opacity-95 transition
                                 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      {/* stop icon */}
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <rect x="6" y="6" width="8" height="8" rx="1.5" />
                      </svg>
                      Stop
                    </button>
                  )}

                  <button
                    onClick={reRecord}
                    disabled={!blob}
                    className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    Re-record
                  </button>

                  {audioUrl ? (
                    <audio src={audioUrl} controls className="mt-2 w-full" />
                  ) : null}
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Tip: Press <kbd>Space</kbd> to start/stop. Press{" "}
                  <kbd>Ctrl/⌘</kbd> + <kbd>Enter</kbd> to save.
                </p>
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => idx > 0 && setIdx(idx - 1)}
                    className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() => !isLast && setIdx(idx + 1)}
                    className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50"
                    disabled={isLast}
                  >
                    Next →
                  </button>
                </div>

                <button
                  onClick={onSave}
                  disabled={busy || !blob || !translation.trim()}
                  aria-busy={busy ? "true" : "false"}
                  className={[
                    "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white",
                    "bg-black hover:opacity-90 active:opacity-85 disabled:opacity-50",
                    "focus:outline-none focus:ring-2 focus:ring-emerald-400",
                    "cursor-pointer transition shadow-sm hover:-translate-y-0.5",
                  ].join(" ")}
                >
                  {busy ? <Spinner className="h-4 w-4" /> : null}
                  {busy ? "Saving…" : isLast ? "Save & finish" : "Save sample"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success modal (intermediate) */}
      <SuccessModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onNext={() => {
          setModalOpen(false);
          setSavedId(null);
          // advance & reset fields
          setIdx((i) => i + 1);
          setTranslation("");
          setBlob(null);
          setAudioUrl(null);
          setElapsed(0);
        }}
        id={savedId}
      />

      {/* Completion modal (final) */}
      <CompletionModal
        open={completeOpen}
        onRestart={() => {
          setCompleteOpen(false);
          setIdx(0);
          setTranslation("");
          setBlob(null);
          setAudioUrl(null);
          setElapsed(0);
        }}
        onContact={() => (window.location.href = "/contact")}
        total={total}
      />
    </>
  );
}
