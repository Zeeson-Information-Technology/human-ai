"use client";
import React from "react";

export type Tab = "job";

export default function TabsNav({
  tab,
  setTab,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
}) {
  return (
    <div className="mb-6 ml-6 flex flex-wrap gap-2" role="tablist">
      <button
        onClick={() => setTab("job")}
        className={`rounded-full px-3 py-1 border cursor-pointer ${
          tab === "job" ? "bg-black text-white" : "bg-white text-gray-900"
        }`}
        aria-selected={tab === "job"}
        aria-controls="tab-job"
        role="tab"
      >
        Opportunity
      </button>
    </div>
  );
}
