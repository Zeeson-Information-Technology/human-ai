import React from "react";

export function ConnectingOverlay({ message = "Connecting to your interview..." }: { message?: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-slate-950/70 z-40">
      <div className="flex items-center gap-3 text-slate-200">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
        <span>{message}</span>
      </div>
    </div>
  );
}

