"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function InvitePanel({
  jobCode,
  inviteEmails,
  onChangeEmail,
  onRemoveEmail,
  onAddEmail,
  onSendInvites,
  inviteBusy,
  inviteMsg,
}: {
  jobCode: string;
  inviteEmails: string[];
  onChangeEmail: (idx: number, email: string) => void;
  onRemoveEmail: (idx: number) => void;
  onAddEmail: () => void;
  onSendInvites: () => void;
  inviteBusy: boolean;
  inviteMsg: string | null;
}) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const nonEmpty = inviteEmails.filter((e) => (e || "").trim().length > 0);
  const allValid = nonEmpty.length > 0 && nonEmpty.every((e) => emailRe.test(e.trim()));
  const canSend = !inviteBusy && allValid;
  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Invite Candidates</h2>
      <p className="mb-2 text-gray-600">
        Share this job link or invite candidates by email.
      </p>

      <div className="mb-4">
        <div className="font-mono text-xs bg-gray-500 rounded p-2 text-white">
          Job link:{" "}
          <a
            href={`/jobs/apply?code=${jobCode}`}
            target="_blank"
            rel="noopener"
          >
            {`${origin}/jobs/apply?code=${jobCode}`}
          </a>
        </div>
      </div>

      <div className="mb-4">
        <div className="font-semibold text-sm mb-2">Invite by email</div>
        {inviteEmails.map((email, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <input
              value={email}
              onChange={(e) => onChangeEmail(idx, e.target.value)}
              placeholder="candidate@email.com"
              className="flex-1 rounded-lg border p-2"
              type="email"
            />
            <button
              type="button"
              onClick={() => onRemoveEmail(idx)}
              className="rounded-lg border px-2 text-xs text-red-600 cursor-pointer"
              disabled={inviteEmails.length === 1}
            >
              Remove
            </button>
          </div>
        ))}

        <div className="mt-6 flex flex-wrap items-center gap-5">
          <button
            type="button"
            onClick={onAddEmail}
            className="inline-flex items-center justify-center rounded-full border border-neutral-300 px-5 h-11 min-w-[180px] text-sm bg-white text-neutral-900 shadow-sm hover:bg-gray-50 hover:text-black cursor-pointer dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            + Add candidate
          </button>
          <button
            type="button"
            onClick={onSendInvites}
            disabled={!canSend}
            title={!allValid ? "Enter at least one valid email" : undefined}
            className="inline-flex items-center justify-center rounded-2xl px-5 h-11 min-w-[180px] font-semibold text-white bg-emerald-700/90 shadow ring-1 ring-black/10 hover:shadow-2xl transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:cursor-not-allowed"
          >
            {inviteBusy ? "Sending..." : "Send Invites"}
          </button>
        </div>

        {inviteMsg && <div className="mt-2 text-emerald-700">{inviteMsg}</div>}
      </div>

      <div className="mt-4">
        <Link
          href="/admin/jobs"
          className="text-sm text-gray-600 hover:underline"
        >
          Back to Jobs
        </Link>
      </div>

      {inviteBusy && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-black/40 backdrop-blur-sm"
          role="status"
          aria-live="polite"
          aria-label="Sending invites"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="relative grid h-12 w-auto place-items-center">
              <Image src="/euman-logo.png" alt="Euman AI" width={160} height={36} priority className="h-9 w-auto animate-pulse" />
            </div>
            <div className="text-white/90 text-sm">Sending invites...</div>
          </div>
        </div>
      )}
    </div>
  );
}
