"use client";
import { SectionCard, PrimaryButton } from "@/components/interview/atoms";
import { useState } from "react";

export default function DetailsStep({
  dark = false,
  name,
  email,
  phone,
  inviteLockedEmail,
  onName,
  onEmail,
  onPhone,
  onResume,
  error,
  onSubmit,
}: {
  dark?: boolean;
  name: string;
  email: string;
  phone: string;
  inviteLockedEmail: boolean;
  onName: (v: string) => void;
  onEmail: (v: string) => void;
  onPhone: (v: string) => void;
  onResume: (f: File | null) => void;
  error?: string;
  onSubmit: () => void | Promise<any>;
}) {
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    if (busy) return;
    setBusy(true);
    try {
      const res = onSubmit();
      if (res instanceof Promise) {
        await res;
      }
    } finally {
      // The parent likely navigates to the next step; this is a safety.
      setBusy(false);
    }
  }
  return (
    <>
      <h1 className="text-3xl font-semibold mt-8 mb-4">
        Please review your details
      </h1>
      <SectionCard dark={dark}>
        <div className="grid gap-4">
          <div>
            <label className="text-sm text-slate-400">Name</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
              value={name}
              onChange={(e) => onName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-slate-400">Email</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 disabled:opacity-60"
              value={email}
              onChange={(e) => onEmail(e.target.value)}
              disabled={inviteLockedEmail}
            />
            {inviteLockedEmail && (
              <div className="text-xs text-slate-500 mt-1">
                Email locked by your invite link.
              </div>
            )}
          </div>
          <div>
            <label className="text-sm text-slate-400">Phone</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
              placeholder="+234 ..."
              value={phone}
              onChange={(e) => onPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 cursor-pointer">
              Resume (optional if already uploaded)
            </label>
            <input
              className="mt-1 w-full text-slate-200 cursor-pointer"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => onResume(e.target.files?.[0] || null)}
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 border border-red-900/60 bg-red-950/40 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="mt-2 cursor-pointer">
            <PrimaryButton dark={dark} onClick={handleSubmit} disabled={busy}>
              Screen-share & continue
            </PrimaryButton>
          </div>
        </div>
      </SectionCard>

      {busy && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center">
          <div className="flex flex-col items-center gap-3">
            <svg className="h-8 w-8 animate-spin text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z" />
            </svg>
            <div className="text-white/90 text-sm">Preparing your interview…</div>
          </div>
        </div>
      )}
    </>
  );
}
