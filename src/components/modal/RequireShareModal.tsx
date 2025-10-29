import React from "react";

export function RequireShareModal({ onShare }: { onShare: () => void | Promise<void> }) {
  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-black/70">
      <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-5 text-slate-100">
        <div className="text-lg font-semibold mb-2">Please share your entire screen</div>
        <div className="text-sm text-slate-300 mb-4">
          To continue, share your entire screen. This helps us ensure accurate, proctored evaluation.
        </div>
        <div className="flex justify-end">
          <button onClick={() => void onShare()} className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-sm cursor-pointer">
            Share screen
          </button>
        </div>
      </div>
    </div>
  );
}

