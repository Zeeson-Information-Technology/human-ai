"use client";
import { SectionCard, PrimaryButton } from "@/components/interview/atoms";

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
  onSubmit: () => void;
}) {
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
            <PrimaryButton dark={dark} onClick={onSubmit}>
              Screen-share & continue
            </PrimaryButton>
          </div>
        </div>
      </SectionCard>
    </>
  );
}
