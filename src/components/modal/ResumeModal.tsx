import React from "react";

export function ResumeModal({ onContinue }: { onContinue: () => void | Promise<void> }) {
  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-slate-950/80">
      <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-5 text-slate-100">
        <div className="text-lg font-semibold mb-2">Resume interview?</div>
        <div className="text-sm text-slate-300 mb-4">It looks like you reloaded. Continue where you left off.</div>
        <div className="flex justify-end gap-2">
          <button onClick={() => void onContinue()} className="px-3 py-1 rounded bg-slate-800 border border-slate-700 text-sm cursor-pointer">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

