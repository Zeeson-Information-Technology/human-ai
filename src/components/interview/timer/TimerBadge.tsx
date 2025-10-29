import React from "react";

export function TimerBadge({ remainingMs }: { remainingMs: number }) {
  const mm = Math.floor(remainingMs / 1000 / 60)
    .toString()
    .padStart(2, "0");
  const ss = Math.floor((remainingMs / 1000) % 60)
    .toString()
    .padStart(2, "0");
  return (
    <div
      className="rounded-xl bg-slate-800/85 border 
      border-slate-700 
    text-slate-100 px-4 py-2 text-lg 
    font-mono tracking-widest"
    >
      {mm}:{ss}
    </div>
  );
}
