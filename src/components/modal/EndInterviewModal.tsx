import React from "react";

export function EndInterviewModal({
  onCancel,
  onEndNow,
}: {
  onCancel: () => void | Promise<void>;
  onEndNow: () => void | Promise<void>;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60">
      <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-4 text-slate-100">
        <div className="text-lg font-semibold mb-2">End Interview?</div>
        <div className="text-sm text-slate-300 mb-4">
          Your recruiter may prefer you complete the full time. You can still end now.
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={() => void onCancel()} className="px-3 py-1 rounded bg-slate-800 border border-slate-700 text-sm">
            Cancel
          </button>
          <button onClick={() => void onEndNow()} className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-sm">
            End Now
          </button>
        </div>
      </div>
    </div>
  );
}

