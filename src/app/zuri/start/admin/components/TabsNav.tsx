"use client";
import React from "react";

export type Tab = "job" | "interview" | "candidates" | "invite";

export default function TabsNav({
  tab,
  setTab,
  jobCreated,
  canGoInterview = true,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  jobCreated: { code?: string } | null;
  canGoInterview?: boolean;
}) {
  return (
    <div className="mb-6 flex flex-wrap gap-2" role="tablist">
      <button
        onClick={() => setTab("job")}
        className={`rounded-full px-3 py-1 border cursor-pointer ${
          tab === "job" ? "bg-black text-white" : "bg-white text-gray-900"
        }`}
        aria-selected={tab === "job"}
        aria-controls="tab-job"
        role="tab"
      >
        Job Info
      </button>

      <button
        onClick={() => (canGoInterview ? setTab("interview") : undefined)}
        title={canGoInterview ? undefined : "Complete Job Info to continue"}
        aria-disabled={!canGoInterview}
        className={`rounded-full px-3 py-1 border ${
          tab === "interview"
            ? "bg-black text-white"
            : "bg-white text-gray-900"
        } ${canGoInterview ? "cursor-pointer" : "opacity-60 cursor-not-allowed"}`}
        aria-selected={tab === "interview"}
        aria-controls="tab-interview"
        role="tab"
      >
        Interview Info
      </button>

      <button
        onClick={() => jobCreated && setTab("candidates")}
        className={`rounded-full px-3 py-1 border cursor-pointer ${
          tab === "candidates"
            ? "bg-black text-white"
            : "bg-white text-gray-900"
        } ${!jobCreated ? "opacity-50 cursor-not-allowed" : ""}`}
        aria-selected={tab === "candidates"}
        aria-controls="tab-candidates"
        role="tab"
      >
        Candidates
      </button>

      <button
        onClick={() => jobCreated && setTab("invite")}
        className={`rounded-full px-3 py-1 border cursor-pointer ${
          tab === "invite"
            ? "bg-black text-white"
            : "bg-white text-gray-900"
        } ${!jobCreated ? "opacity-50 cursor-not-allowed" : ""}`}
        aria-selected={tab === "invite"}
        aria-controls="tab-invite"
        role="tab"
      >
        Invite
      </button>
    </div>
  );
}
