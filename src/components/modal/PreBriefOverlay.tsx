import React from "react";

export function PreBriefOverlay({
  companyName,
  isSharing,
  shareSurface,
  onStartShare,
  onStartInterview,
}: {
  companyName?: string;
  isSharing: boolean;
  shareSurface: string | undefined;
  onStartShare: () => void | Promise<void>;
  onStartInterview: () => void | Promise<void>;
}) {
  const entireScreen = isSharing && shareSurface === "monitor";
  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-slate-950/80">
      <div className="absolute top-6 left-6 text-slate-200">
        <div className="h-10 w-10 rounded-full bg-indigo-500 grid place-content-center font-bold">
          {(companyName?.[0] || "Z").toUpperCase()}
        </div>
      </div>
      <div className="flex gap-8 items-start text-slate-100">
        <div className="shrink-0 h-28 w-28 rounded-full bg-indigo-500/30 border border-indigo-400 grid place-content-center text-3xl">
          *
        </div>
        <div className="max-w-lg">
          <div className="text-xl font-semibold mb-3">Before starting the interview</div>
          <ol className="list-decimal pl-5 space-y-2 text-slate-200 text-sm">
            <li>
              Your AI interview will be recorded and available in your profile. Make sure you are in a professional setting.
            </li>
            <li>
              This interview is proctored. Please stay on the same tab and do not use external tools.
            </li>
            <li>Feel free to ask clarifying questions throughout the interview.</li>
          </ol>
          {!entireScreen ? (
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => void onStartShare()}
                className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium cursor-pointer"
              >
                Share entire screen
              </button>
              <span className="text-xs text-slate-300">Please share your entire screen to start.</span>
            </div>
          ) : null}
          <button
            onClick={() => void onStartInterview()}
            disabled={!entireScreen}
            className={`mt-4 px-4 py-2 rounded text-sm font-medium ${
              !entireScreen
                ? "bg-white/40 text-black/60 cursor-not-allowed"
                : "bg-white text-black hover:opacity-90 cursor-pointer"
            }`}
            title={!entireScreen ? "Share entire screen to enable" : undefined}
          >
            Sounds good, start interview
          </button>
        </div>
      </div>
    </div>
  );
}

