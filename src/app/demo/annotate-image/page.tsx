"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import samples from "@/data/demo/imageSamples.json";
import { Spinner } from "@/components/spinner";
import Image from "next/image";

/** Basic bounding box we draw and save */
type BBox = {
  x: number; // left
  y: number; // top
  width: number;
  height: number;
};

type ImageSample = {
  id: string;
  task: string;
  image: string;
  guideline: string;
  labels: string[];
};

type PendingAnno = {
  id: string; // client temp id
  box: BBox; // screen-space while drawing
  labels: string[]; // MULTI-LABEL
};

type SuggestResponse = {
  ok: boolean;
  labels?: string[];
  error?: string;
};

/** Ask server for signature, then upload direct to Cloudinary */
async function uploadToCloudinary(
  file: File
): Promise<{ url: string; publicId: string }> {
  const signRes = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder: "equatoria-demo" }),
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

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const upRes = await fetch(uploadUrl, { method: "POST", body: form });
  if (!upRes.ok) throw new Error("Cloudinary upload failed");

  const json = await upRes.json();
  return { url: json.secure_url as string, publicId: json.public_id as string };
}

/** Floating step pointer */
function CoachBar({ stage }: { stage: 1 | 2 | 3 | 4 }) {
  const steps = [
    { n: 1, t: "Draw a box" },
    { n: 2, t: "Select the box" },
    { n: 3, t: "Toggle labels" },
    { n: 4, t: "Save all" },
  ];
  return (
    <div className="sticky top-20 z-20 mt-3 rounded-xl border bg-white p-3 text-sm shadow-sm">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {steps.map((s, i) => {
          const active = s.n === stage;
          return (
            <div
              key={s.n}
              className={[
                "inline-flex items-center gap-2 rounded-full border px-3 py-1",
                active
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 text-gray-700",
              ].join(" ")}
              aria-current={active ? "step" : undefined}
            >
              <span
                className={[
                  "grid h-5 w-5 place-items-center rounded-full text-xs",
                  active
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-200 text-gray-700",
                ].join(" ")}
              >
                {s.n}
              </span>
              <span>{s.t}</span>
              {i < steps.length - 1 ? (
                <svg
                  className="ml-1 h-3 w-3 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M7 4l6 6-6 6" />
                </svg>
              ) : null}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-center text-xs text-gray-500">
        Draw <span className="font-medium">separate</span> boxes for each field.
        Select a box, then toggle all labels that apply. Finally, “Save all”.
      </p>
    </div>
  );
}

/** Premium success modal */
function SuccessModal({
  open,
  onClose,
  onNext,
  ids,
}: {
  open: boolean;
  onClose: () => void;
  onNext: () => void;
  ids: string[];
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
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200 shadow-sm">
              <svg
                className="h-7 w-7 text-emerald-600"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
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
          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            {ids.length > 1 ? "Annotations saved" : "Annotation saved"}
          </h2>
          <p className="mt-1 text-sm text-gray-700">
            {ids.length > 1
              ? `${ids.length} items were recorded.`
              : "Your annotation was recorded."}
          </p>

          {ids.length ? (
            <div className="mt-4 max-h-40 overflow-auto rounded-lg border bg-gray-50 px-3 py-2 text-left">
              <code className="break-all text-[11px] text-gray-800">
                {ids.map((id) => `id: ${id}`).join("\n")}
              </code>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button
              ref={closeRef}
              onClick={onClose}
              className="cursor-pointer rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onNext();
              }}
              className="cursor-pointer rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              Next sample →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** End-of-samples completion modal */
function CompletionModal({
  open,
  onClose,
  summary,
}: {
  open: boolean;
  onClose: () => void;
  summary: { totalSamples: number; totalSaved: number };
}) {
  if (!open) return null;
  const { totalSamples, totalSaved } = summary;
  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
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
        <div className="p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-900">All done! 🎉</h2>
          <p className="mt-2 text-sm text-gray-700">
            You completed <span className="font-medium">{totalSamples}</span>{" "}
            sample{totalSamples > 1 ? "s" : ""} and saved{" "}
            <span className="font-medium">{totalSaved}</span> annotation
            {totalSaved === 1 ? "" : "s"}.
          </p>
          <div className="mt-5 rounded-lg border bg-gray-50 p-3 text-left">
            <ul className="list-disc pl-5 text-sm text-gray-800">
              <li>
                Next: try your own documents via{" "}
                <span className="font-medium">Upload image</span>.
              </li>
              <li>
                Review saved data in your database or build an export screen.
              </li>
              <li>Hook this into your model training or review queue.</li>
            </ul>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={onClose}
              className="cursor-pointer rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              Close
            </button>
            <a
              href="/demo"
              className="cursor-pointer rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              Back to demo hub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Optional mini floating toolbar for the active box */
function BoxToolbar({
  box,
  onDelete,
  onSelect,
}: {
  box: { x: number; y: number; width: number; height: number } | null;
  onDelete: () => void;
  onSelect: () => void;
}) {
  if (!box) return null;
  const top = Math.max(0, box.y - 36);
  const left = Math.max(0, box.x);

  return (
    <div
      className="absolute z-20 inline-flex items-center gap-1 rounded-lg border bg-white/95 px-2 py-1 text-xs shadow-sm backdrop-blur"
      style={{ top, left }}
      role="toolbar"
      aria-label="Box actions"
    >
      <button
        onClick={onSelect}
        className="rounded-md border px-2 py-1 hover:bg-gray-50"
        title="Relabel / focus"
      >
        Relabel
      </button>
      <button
        onClick={onDelete}
        className="rounded-md border px-2 py-1 hover:bg-gray-50 text-red-600"
        title="Delete box"
      >
        Delete
      </button>
    </div>
  );
}

export default function AnnotateImagePage() {
  const data = samples as ImageSample[];
  const [idx, setIdx] = useState(0);
  const [custom, setCustom] = useState<ImageSample | null>(null);

  // Active sample (built-in or uploaded)
  const s = useMemo(() => custom ?? data[idx], [custom, data, idx]);

  // Persist user-added labels (global)
  const [userLabels, setUserLabels] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("eq_user_labels");
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("eq_user_labels", JSON.stringify(userLabels));
    } catch {}
  }, [userLabels]);

  // Drawing state
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);

  // Multi-box, multi-label
  const [annos, setAnnos] = useState<PendingAnno[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // UI state
  const [busy, setBusy] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  // Completion state
  const [showComplete, setShowComplete] = useState(false);
  const [lastSaveCount, setLastSaveCount] = useState(0);

  // NEW: OCR suggestion spinner
  const [suggesting, setSuggesting] = useState(false);

  const newId = () =>
    crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random()}`;

  // Canvas events (draw)
  const onCanvasMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = newId();
      setDragging(true);
      setStart({ x, y });
      setAnnos((prev) => [
        ...prev,
        { id, box: { x, y, width: 0, height: 0 }, labels: [] },
      ]);
      setActiveId(id);
    },
    []
  );

  const onCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!dragging || !start || !activeId) return;
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const nx = Math.min(x, start.x);
      const ny = Math.min(y, start.y);
      const w = Math.abs(x - start.x);
      const h = Math.abs(y - start.y);
      setAnnos((prev) =>
        prev.map((p) =>
          p.id === activeId
            ? { ...p, box: { x: nx, y: ny, width: w, height: h } }
            : p
        )
      );
    },
    [dragging, start, activeId]
  );

  const onCanvasMouseUp = useCallback(() => {
    setDragging(false);
    setStart(null);
    setActiveId(null);
  }, []);

  const selectAnno = (id: string) => setActiveId(id);
  const deleteAnno = (id: string) =>
    setAnnos((prev) => prev.filter((p) => p.id !== id));
  const clearAll = () => {
    setAnnos([]);
    setActiveId(null);
  };

  // Save: bulk POST (one request) with anns = [{bbox, labels}, ...]
  const saveAll = useCallback(async () => {
    if (!annos.length || !imgRef.current) return;

    const unlabeled = annos.filter((a) => a.labels.length === 0);
    if (unlabeled.length) {
      alert(
        `Please label every box before saving.\n\nBoxes needing labels: ${unlabeled
          .map((u) => `#${u.id.slice(0, 6)}`)
          .join(", ")}`
      );
      return;
    }

    setBusy(true);
    try {
      const img = imgRef.current;
      const naturalW = img.naturalWidth;
      const naturalH = img.naturalHeight;
      const renderedW = img.clientWidth;
      const renderedH = img.clientHeight;
      const scaleX = naturalW / renderedW;
      const scaleY = naturalH / renderedH;

      const bulk = {
        sampleId: s.id,
        image: s.image,
        anns: annos.map((a) => ({
          bbox: {
            x: Math.round(a.box.x * scaleX),
            y: Math.round(a.box.y * scaleY),
            width: Math.round(a.box.width * scaleX),
            height: Math.round(a.box.height * scaleY),
          },
          labels: a.labels,
        })),
      };

      const res = await fetch("/api/annotations/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bulk),
      });

      if (!res.ok) throw new Error(await res.text());
      const json = (await res.json()) as { ok: true; ids: string[] };
      setSavedIds(json.ids || []);
      setLastSaveCount(json.ids?.length || 0);
      setOpen(true);
      clearAll();
    } catch (err) {
      alert(String(err));
    } finally {
      setBusy(false);
    }
  }, [annos, s]);

  // NEW: Auto-suggest labels (OCR)
  const onSuggestLabels = useCallback(async () => {
    try {
      setSuggesting(true);

      // Only allow public, remotely hosted images (or any you uploaded to Cloudinary)
      if (!/^https?:\/\//i.test(s.image)) {
        alert(
          "Auto-suggest only works for public images (PNG/JPG/WebP/SVG hosted online). Please upload your image first."
        );
        return;
      }

      const res = await fetch("/api/labels/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: s.image }),
      });

      let json: unknown;
      try {
        json = await res.json();
      } catch {
        throw new Error("Could not parse response from suggest API.");
      }

      const body = json as SuggestResponse;
      if (!res.ok || !body.ok) {
        throw new Error(body?.error || "Suggest failed");
      }

      const labels = body.labels ?? [];
      setUserLabels((prev) => Array.from(new Set([...prev, ...labels])));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      alert(`Auto-suggest failed: ${msg}`);
    } finally {
      setSuggesting(false);
    }
  }, [s.image]);

  // Upload
  const inputRef = useRef<HTMLInputElement | null>(null);
  const onPickFile = () => inputRef.current?.click();
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/^image\/(png|jpe?g|webp|svg\+xml)$/.test(f.type)) {
      alert("Please upload a PNG/JPG/WebP/SVG image.");
      return;
    }
    try {
      setUploadBusy(true);
      const { url } = await uploadToCloudinary(f);

      // IMPORTANT: uploads start with NO preset labels
      const defaultLabels: string[] = [];
      setCustom({
        id: `uploaded_${Date.now()}`,
        task: "Document OCR — Uploaded",
        image: url,
        guideline:
          "Draw separate boxes for each field in your document. Select a box, then add/toggle labels that fit. Save all.",
        labels: defaultLabels,
      });
      setIdx(0);
      clearAll();
    } catch (err) {
      alert(String(err));
    } finally {
      setUploadBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  // Progress + stage for CoachBar
  const total = custom ? 1 : data.length;
  const position = custom ? 1 : idx + 1;
  const progressPct = (position / total) * 100;

  let stage: 1 | 2 | 3 | 4 = 1;
  if (annos.length === 0) stage = 1;
  else if (activeId) {
    const active = annos.find((a) => a.id === activeId);
    stage = active && active.labels.length ? 3 : 2;
  } else {
    stage = annos.every((a) => a.labels.length) ? 4 : 2;
  }

  // Label options (preset + user)
  const [draftLabel, setDraftLabel] = useState("");
  const labelOptions = useMemo(() => {
    const set = new Set<string>([...s.labels, ...userLabels]);
    return Array.from(set);
  }, [s.labels, userLabels]);

  // Add a new custom label
  const addDraftLabel = () => {
    const t = draftLabel.trim();
    if (!t) return;
    if (!userLabels.includes(t)) setUserLabels((u) => [...u, t]);
    setDraftLabel("");
  };

  // Remove a custom label from global list AND from any boxes that used it
  const removeCustomLabel = (label: string) => {
    setUserLabels((u) => u.filter((x) => x !== label));
    setAnnos((prev) =>
      prev.map((a) => ({ ...a, labels: a.labels.filter((l) => l !== label) }))
    );
  };

  // Toggle a label on the currently active box
  const toggleLabelOnActive = (label: string) => {
    if (!activeId) return;
    setAnnos((prev) =>
      prev.map((p) =>
        p.id === activeId
          ? {
              ...p,
              labels: p.labels.includes(label)
                ? p.labels.filter((x) => x !== label)
                : [...p.labels, label],
            }
          : p
      )
    );
  };

  const isAbsolute = /^https?:\/\//i.test(s.image);
  const canSuggest = !!(custom || isAbsolute);

  return (
    <>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl">
          {/* Top bar */}
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

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {position} / {total} • {Math.round(progressPct)}%
              </span>

              {/* Upload button */}
              <button
                onClick={onPickFile}
                disabled={uploadBusy}
                className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                aria-label="Upload a document image"
              >
                {uploadBusy ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeOpacity="0.2"
                        strokeWidth="3"
                      />
                      <path
                        d="M21 12a9 9 0 0 1-9 9"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                    </svg>
                    Uploading…
                  </>
                ) : (
                  <>
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M3 15a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3h-2v3H5v-3H3v3ZM10 3l4 4h-3v5H9V7H6l4-4Z" />
                    </svg>
                    Upload image
                  </>
                )}
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={onFileChange}
              />
            </div>
          </div>

          {/* Floating guide */}
          <CoachBar stage={stage} />

          {/* Card */}
          <div className="mt-4 overflow-hidden rounded-2xl border shadow-sm">
            {/* Progress bar */}
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
              <h1 className="mt-4 text-2xl font-bold">Image Annotation</h1>
              <p className="mt-3 text-sm text-emerald-700">
                <span className="font-medium">Guideline:</span> Draw{" "}
                <span className="font-medium">separate boxes</span> for each
                field you see. Select a box, add or toggle all labels that
                apply, then “Save all”.
              </p>

              {/* Canvas */}
              <div className="mt-5">
                <div
                  className="relative mx-auto w-full max-w-3xl select-none rounded-xl border bg-white"
                  onMouseDown={onCanvasMouseDown}
                  onMouseMove={onCanvasMouseMove}
                  onMouseUp={onCanvasMouseUp}
                  onMouseLeave={onCanvasMouseUp}
                  role="application"
                  aria-label="Image annotation canvas"
                >
                  {/* right glow */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-6 top-1/2 h-[150%] w-[40%] -translate-y-1/2 blur-2xl opacity-70"
                    style={{
                      background:
                        "radial-gradient(60% 50% at 0% 50%, rgba(226,254,255,0.75) 0%, rgba(226,254,255,0.25) 45%, rgba(226,254,255,0) 75%)",
                    }}
                  />
                  <Image
                    src={s.image}
                    alt="Demo document"
                    fill
                    sizes="(min-width: 768px) 768px, 100vw"
                    className="rounded-xl object-contain"
                    draggable={false}
                    ref={imgRef}
                  />

                  {/* Floating toolbar for active box */}
                  <BoxToolbar
                    box={
                      activeId
                        ? annos.find((a) => a.id === activeId)?.box ?? null
                        : null
                    }
                    onDelete={() => activeId && deleteAnno(activeId)}
                    onSelect={() => {
                      /* Optional: scroll side panel into view or flash; no-op now */
                    }}
                  />

                  {/* boxes */}
                  {annos.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectAnno(a.id);
                      }}
                      className={[
                        "absolute rounded-lg ring-2 transition",
                        a.id === activeId
                          ? "ring-emerald-600 bg-emerald-200/10"
                          : "ring-emerald-400/70 bg-emerald-100/5 hover:ring-emerald-500",
                      ].join(" ")}
                      style={{
                        left: a.box.x,
                        top: a.box.y,
                        width: a.box.width,
                        height: a.box.height,
                        cursor: "pointer",
                      }}
                      aria-label={`Bounding box ${a.id}`}
                      title={
                        (a.labels.length ? a.labels.join(", ") : "No label") +
                        " (click to select)"
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {/* Labels */}
                <div className="rounded-xl border p-4">
                  <div className="text-sm font-medium text-gray-900">
                    Labels
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Select a box, then toggle all applicable labels
                    (multi-select).
                  </p>

                  {/* Auto-suggest */}
                  <div className="mt-2 flex gap-2">
                    {/* <button
                      onClick={onSuggestLabels}
                      disabled={suggesting}
                      className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      title="Use OCR to suggest labels like Total, Date, Tax from the current image"
                    >
                      {suggesting ? "Suggesting…" : "Auto-suggest labels"}
                    </button> */}

                    <button
                      onClick={onSuggestLabels}
                      disabled={suggesting || !canSuggest}
                      className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      title={
                        canSuggest
                          ? "Use OCR to suggest labels from the current image"
                          : "Upload an image (public URL) to enable auto-suggest"
                      }
                    >
                      {suggesting ? "Suggesting…" : "Auto-suggest labels"}
                    </button>
                  </div>

                  {/* Toggle chips (preset + custom) */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {labelOptions.length === 0 ? (
                      <span className="text-xs text-gray-500">
                        No labels yet. Add your own below or click “Auto-suggest
                        labels”.
                      </span>
                    ) : (
                      labelOptions.map((l) => {
                        const fromPreset = s.labels.includes(l);
                        const active =
                          activeId &&
                          annos
                            .find((a) => a.id === activeId)
                            ?.labels.includes(l);
                        return (
                          <button
                            key={l}
                            onClick={() => toggleLabelOnActive(l)}
                            className={`cursor-pointer rounded-lg border px-3 py-1 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                              active
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : "border-gray-300 hover:bg-gray-50"
                            }`}
                            aria-pressed={!!active}
                            title={fromPreset ? "Preset label" : "Custom label"}
                          >
                            {l}
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Add / remove custom labels */}
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      value={draftLabel}
                      onChange={(e) => setDraftLabel(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addDraftLabel()}
                      placeholder="Add custom label…"
                      className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                    <button
                      onClick={addDraftLabel}
                      className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      Add
                    </button>
                  </div>

                  {/* List custom labels with remove buttons */}
                  {userLabels.length ? (
                    <div className="mt-3">
                      <div className="text-xs font-medium text-gray-600">
                        Your custom labels
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {userLabels.map((l) => (
                          <span
                            key={l}
                            className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-gray-50 px-2 py-1 text-xs text-gray-800"
                          >
                            {l}
                            <button
                              onClick={() => removeCustomLabel(l)}
                              className="ml-1 rounded-full p-0.5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                              title="Remove label"
                              aria-label={`Remove ${l}`}
                            >
                              <svg
                                className="h-3.5 w-3.5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.22 4.22a.75.75 0 0 1 1.06 0L10 8.94l4.72-4.72a.75.75 0 1 1 1.06 1.06L11.06 10l4.72 4.72a.75.75 0 1 1-1.06 1.06L10 11.06l-4.72 4.72a.75.75 0 0 1-1.06-1.06L8.94 10 4.22 5.28a.75.75 0 0 1 0-1.06z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                      <p className="mt-1 text-[11px] text-gray-500">
                        Removing a custom label also unselects it from any
                        boxes.
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* Box list */}
                <div className="rounded-xl border p-4">
                  <div className="text-sm font-medium text-gray-900">
                    Boxes ({annos.length})
                  </div>
                  {annos.length === 0 ? (
                    <p className="mt-2 text-sm text-gray-600">
                      Click-drag on the image to draw a box.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {annos.map((a) => (
                        <li
                          key={a.id}
                          className={[
                            "flex items-center justify-between rounded-lg border px-3 py-2 text-sm",
                            a.id === activeId ? "border-emerald-400" : "",
                          ].join(" ")}
                        >
                          <div className="truncate">
                            <span className="text-gray-500">
                              #{a.id.slice(0, 6)}
                            </span>{" "}
                            <span className="text-gray-700">
                              {a.labels.length ? a.labels.join(", ") : "—"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => selectAnno(a.id)}
                              className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                            >
                              Select
                            </button>
                            <button
                              onClick={() => deleteAnno(a.id)}
                              className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                            >
                              Delete
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      onClick={clearAll}
                      disabled={!annos.length}
                      className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      Clear all
                    </button>
                    <button
                      onClick={saveAll}
                      disabled={!annos.length || busy}
                      className={[
                        "rounded-xl px-4 py-2 text-sm font-medium text-white",
                        "bg-black hover:opacity-90 active:opacity-85 disabled:opacity-50",
                        "focus:outline-none focus:ring-2 focus:ring-emerald-400",
                        "cursor-pointer transition shadow-sm hover:-translate-y-0.5",
                      ].join(" ")}
                    >
                      {busy ? <Spinner className="h-4 w-4" /> : null}
                      {busy ? "Saving…" : "Save all"}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Tip: draw multiple boxes (e.g., totals, dates, merchants,
                    taxes). Click a box to select it, then toggle all labels
                    that apply.
                  </p>
                </div>
              </div>

              <p className="mt-4 text-xs text-gray-500">
                Uploads are signed server-side and sent directly to Cloudinary.
                Use “Auto-suggest labels” or add your own chips for each
                document.
              </p>
            </div>
          </div>

          {/* Bottom nav (only for built-in samples) */}
          {!custom ? (
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => {
                  setIdx((i) => (i - 1 + data.length) % data.length);
                  clearAll();
                }}
                className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                ← Prev
              </button>
              <button
                onClick={() => {
                  setIdx((i) => (i + 1) % data.length);
                  clearAll();
                }}
                className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                Next →
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Modals */}
      <SuccessModal
        open={open}
        onClose={() => setOpen(false)}
        onNext={() => {
          setOpen(false);
          const isBuiltIn = !custom;
          const isLastBuiltIn = isBuiltIn && idx === data.length - 1;

          setSavedIds([]);
          if (isLastBuiltIn) {
            setShowComplete(true); // show final screen instead of looping
            clearAll();
          } else if (isBuiltIn) {
            setIdx((i) => (i + 1) % data.length);
            clearAll();
          } else {
            setCustom(null);
          }
        }}
        ids={savedIds}
      />

      <CompletionModal
        open={showComplete}
        onClose={() => setShowComplete(false)}
        summary={{ totalSamples: data.length, totalSaved: lastSaveCount }}
      />
    </>
  );
}
