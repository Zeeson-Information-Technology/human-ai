"use client";

import { useMemo, useRef, useState } from "react";
import { Spinner } from "@/components/spinner";
import { BTN, cx } from "@/components/ui-helper/buttonStyles";

export type UploadedFileItem = {
  name: string;
  url: string;
  publicId?: string;
  bytes?: number;
  resourceType?: string;
  uploadedAt?: string;
};

export default function FileDropUpload({
  files,
  onChange,
  onExtract,
  extractBusy = false,
  folder = "opportunity-documents",
  accept = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.rtf,.zip,.png,.jpg,.jpeg",
  label = "Drag files here or upload",
  helperText = "Upload RFPs, briefs, statements of work, or supporting documents.",
}: {
  files: UploadedFileItem[];
  onChange: (next: UploadedFileItem[]) => void;
  onExtract?: () => void;
  extractBusy?: boolean;
  folder?: string;
  accept?: string;
  label?: string;
  helperText?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSizeLabel = useMemo(() => {
    const total = files.reduce((sum, file) => sum + (file.bytes || 0), 0);
    if (!total) return "";
    const mb = total / (1024 * 1024);
    return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB uploaded`;
  }, [files]);

  async function uploadFiles(list: FileList | File[]) {
    const picked = Array.from(list || []);
    if (!picked.length) return;

    setBusy(true);
    setError(null);
    try {
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      });
      const sig = await signRes.json().catch(() => ({}));
      if (!signRes.ok || !sig?.ok) {
        throw new Error(sig?.error || "Failed to prepare upload.");
      }

      const uploaded: UploadedFileItem[] = [];
      for (const file of picked) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("api_key", sig.apiKey);
        fd.append("timestamp", String(sig.timestamp));
        fd.append("signature", sig.signature);
        fd.append("folder", sig.folder);

        const uploadUrl = `https://api.cloudinary.com/v1_1/${sig.cloudName}/raw/upload`;
        const upRes = await fetch(uploadUrl, { method: "POST", body: fd });
        const json = await upRes.json().catch(() => ({}));
        if (!upRes.ok) {
          throw new Error(json?.error?.message || `Upload failed for ${file.name}`);
        }

        uploaded.push({
          name: file.name,
          url: json.secure_url as string,
          publicId: json.public_id as string,
          bytes: typeof json.bytes === "number" ? json.bytes : file.size,
          resourceType: json.resource_type as string,
          uploadedAt: new Date().toISOString(),
        });
      }

      onChange([...files, ...uploaded]);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err: any) {
      setError(err?.message || "Upload failed.");
    } finally {
      setBusy(false);
      setDragging(false);
    }
  }

  function removeFile(url: string) {
    onChange(files.filter((file) => file.url !== url));
  }

  return (
    <div className="grid gap-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (busy) return;
          void uploadFiles(e.dataTransfer.files);
        }}
        className={cx(
          "rounded-3xl border border-dashed p-6 transition",
          dragging
            ? "border-emerald-500 bg-emerald-50"
            : "border-gray-300 bg-white"
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-medium text-gray-900">{label}</div>
            <div className="mt-1 text-xs text-gray-500">{helperText}</div>
            {totalSizeLabel ? (
              <div className="mt-1 text-xs text-gray-500">{totalSizeLabel}</div>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {onExtract ? (
              <button
                type="button"
                onClick={onExtract}
                disabled={extractBusy || busy || files.length === 0}
                className={cx(
                  BTN.primary,
                  "bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-700 px-4 py-2 text-sm",
                  (extractBusy || busy || files.length === 0) &&
                    "cursor-not-allowed opacity-60"
                )}
              >
                {extractBusy ? "Extracting..." : "Extract from files"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className={cx(BTN.subtle, "px-4 py-2 text-sm")}
            >
              {busy ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Uploading...
                </span>
              ) : (
                "Upload files"
              )}
            </button>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => {
            if (!e.target.files?.length || busy) return;
            void uploadFiles(e.target.files);
          }}
        />
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      {files.length > 0 ? (
        <div className="grid gap-2">
          {files.map((file) => (
            <div
              key={file.url}
              className="flex items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-gray-900">
                  {file.name}
                </div>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-xs text-emerald-700 hover:underline"
                >
                  View uploaded file
                </a>
              </div>
              <button
                type="button"
                onClick={() => removeFile(file.url)}
                className="cursor-pointer rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100"
              >
                Remove
              </button>
            </div>
          ))}
          {onExtract ? (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onExtract}
                disabled={extractBusy || busy || files.length === 0}
                className={cx(
                  BTN.primary,
                  "bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-700 px-4 py-2 text-sm",
                  (extractBusy || busy || files.length === 0) &&
                    "cursor-not-allowed opacity-60"
                )}
              >
                {extractBusy ? "Extracting..." : "Extract from uploaded files"}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
