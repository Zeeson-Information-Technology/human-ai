"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function InvitePanel({
  responseLink,
  inviteEmails,
  onChangeEmail,
  onRemoveEmail,
  onAddEmail,
  onSendInvites,
  inviteBusy,
  inviteMsg,
  participantType,
  onParticipantTypeChange,
  intakeMethod,
  onIntakeMethodChange,
}: {
  responseLink: string;
  inviteEmails: string[];
  onChangeEmail: (idx: number, email: string) => void;
  onRemoveEmail: (idx: number) => void;
  onAddEmail: () => void;
  onSendInvites: () => void;
  inviteBusy: boolean;
  inviteMsg: string | null;
  participantType: "candidate" | "sme" | "reviewer" | "partner";
  onParticipantTypeChange: (value: "candidate" | "sme" | "reviewer" | "partner") => void;
  intakeMethod: "ai-interview" | "human-interview" | "documents-only" | "manual-review";
  onIntakeMethodChange: (value: "ai-interview" | "human-interview" | "documents-only" | "manual-review") => void;
}) {
  const [copied, setCopied] = useState(false);
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const nonEmpty = inviteEmails.filter((e) => (e || "").trim().length > 0);
  const allValid = nonEmpty.length > 0 && nonEmpty.every((e) => emailRe.test(e.trim()));
  const canSend = !inviteBusy && allValid;
  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Add Participants</h2>
      <p className="mb-4 text-gray-600">Choose how this participant should contribute to the opportunity.</p>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium text-gray-900">
          Participant type
          <select
            value={participantType}
            onChange={(event) => onParticipantTypeChange(event.target.value as typeof participantType)}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
          >
            <option value="candidate">Candidate</option>
            <option value="sme">SME</option>
            <option value="reviewer">Reviewer</option>
            <option value="partner">Delivery partner</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium text-gray-900">
          Intake method
          <select
            value={intakeMethod}
            onChange={(event) => onIntakeMethodChange(event.target.value as typeof intakeMethod)}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
          >
            <option value="ai-interview">AI interview</option>
            <option value="human-interview">Human interview</option>
            <option value="documents-only">Documents only</option>
            <option value="manual-review">Manual review</option>
          </select>
        </label>
      </div>

      <div className="mb-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Response link</div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <a href={responseLink} target="_blank" rel="noopener" className="min-w-0 flex-1 break-all font-mono text-xs text-emerald-700 underline">
              {responseLink}
            </a>
            <button
              type="button"
              className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(responseLink);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1600);
                } catch {
                  setCopied(false);
                }
              }}
            >
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="font-semibold text-sm mb-2">Send by email</div>
        {inviteEmails.map((email, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <input
              value={email}
              onChange={(e) => onChangeEmail(idx, e.target.value)}
              placeholder="participant@email.com"
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
            + Add recipient
          </button>
          <button
            type="button"
            onClick={onSendInvites}
            disabled={!canSend}
            title={!allValid ? "Enter at least one valid email" : undefined}
            className="inline-flex items-center justify-center rounded-2xl px-5 h-11 min-w-[180px] font-semibold text-white bg-emerald-700/90 shadow ring-1 ring-black/10 hover:shadow-2xl transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:cursor-not-allowed"
          >
            {inviteBusy ? "Sending..." : "Send invitations"}
          </button>
        </div>

        {inviteMsg && <div className="mt-2 text-red-600">{inviteMsg}</div>}
      </div>

      <div className="mt-4">
        <Link
          href="/admin/opportunities"
          className="text-sm text-gray-600 hover:underline"
        >
          Back to Opportunities
        </Link>
      </div>
    </div>
  );
}
