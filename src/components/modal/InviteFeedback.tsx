"use client";

type InviteSentModalProps = {
  open: boolean;
  count: number;
  emails: string[];
  onClose: () => void;
};

type InviteSendingOverlayProps = {
  show: boolean;
  label?: string;
};

export type InviteSuccessMeta = {
  count: number;
  emails: string[];
};

export function InviteSentModal({
  open,
  count,
  emails,
  onClose,
}: InviteSentModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 px-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-sent-modal-title"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white/95 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500" />
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-inner">
              <svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M9.55 17.6l-4.2-4.2 1.4-1.4 2.77 2.78 7.63-7.63 1.42 1.4z"
                />
              </svg>
            </div>
            <div>
              <p
                id="invite-sent-modal-title"
                className="text-lg font-semibold text-gray-900"
              >
                Invites sent!
              </p>
              <p className="text-sm text-gray-500">
                {count} {count === 1 ? "candidate" : "candidates"} notified
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50/80 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Recipients
            </p>
            <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto text-sm text-gray-700">
              {emails.map((email) => (
                <li
                  key={email}
                  className="rounded-xl bg-white px-3 py-1 shadow-sm"
                >
                  {email}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full 
              border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 
              hover:bg-gray-50 cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center 
              rounded-full bg-black px-4 py-2 text-sm font-semibold 
              text-white shadow-lg shadow-black/20 hover:opacity-90 cursor-pointer"
            >
              Send more
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InviteSendingOverlay({
  show,
  label = "Sending invites…",
}: InviteSendingOverlayProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/25 backdrop-blur-[1px]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-white/20" />
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
        </div>
        <div className="text-sm font-medium text-white/90">{label}</div>
      </div>
    </div>
  );
}
