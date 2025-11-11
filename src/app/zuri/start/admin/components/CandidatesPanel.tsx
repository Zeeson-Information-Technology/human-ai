"use client";
import React, { useState } from "react";

function CandidatesSection({
  applied,
  vetted,
  loading,
}: {
  applied: any[];
  vetted: any[];
  loading: boolean;
}) {
  const [view, setView] = useState<"applied" | "vetted">("applied");
  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setView("applied")}
          className={`rounded-full border px-3 py-1 text-sm cursor-pointer ${
            view === "applied"
              ? "bg-emerald-600 text-white border-emerald-600"
              : "bg-white text-gray-900"
          }`}
        >
          Applied
        </button>
        <button
          type="button"
          onClick={() => setView("vetted")}
          className={`rounded-full border px-3 py-1 text-sm cursor-pointer ${
            view === "vetted"
              ? "bg-black text-white border-black"
              : "bg-white text-gray-900"
          }`}
        >
          Vetted
        </button>
      </div>
      {loading ? (
        <div className="text-gray-500">Loading candidates…</div>
      ) : view === "applied" ? (
        <div className="grid gap-2">
          {applied.length === 0 && (
            <div className="text-xs text-gray-500">
              No applied candidates yet.
            </div>
          )}
          {applied.map((c: any) => (
            <div
              key={c.id}
              className="rounded-lg border p-2 flex flex-col gap-1"
            >
              <div className="font-medium">{c.candidate?.name}</div>
              <div className="text-xs text-gray-600">{c.candidate?.email}</div>
              <div className="text-xs text-gray-500">Status: {c.status}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-2">
          {vetted.length === 0 && (
            <div className="text-xs text-gray-500">
              No vetted candidates yet.
            </div>
          )}
          {vetted.map((c: any) => (
            <div
              key={c.id}
              className="rounded-lg border p-2 flex flex-col gap-1 bg-emerald-50"
            >
              <div className="font-medium">{c.candidate?.name}</div>
              <div className="text-xs text-gray-600">{c.candidate?.email}</div>
              <div className="text-xs text-gray-500">
                Score: {c.score ?? "-"}
              </div>
              <div className="text-xs text-gray-500">
                Finished:{" "}
                {c.finishedAt ? new Date(c.finishedAt).toLocaleString() : "-"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CandidatesPanel({
  jobCode,
  applied,
  vetted,
  loading,
}: {
  jobCode: string;
  applied: any[];
  vetted: any[];
  loading: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Candidates</h2>
        <div className="flex items-center gap-2">
          <a
            href={`/jobs/apply?code=${jobCode}`}
            target="_blank"
            rel="noopener"
            className="rounded-full border px-3 py-1 text-xs text-gray-600 
            bg-white hover:bg-gray-50 cursor-pointer"
          >
            Open Public Apply Link
          </a>
          <button
            type="button"
            className="rounded-full border px-3 py-1 text-xs bg-black text-white cursor-pointer"
            onClick={() => {
              try {
                const origin =
                  typeof window !== "undefined" ? window.location.origin : "";
                const url = `${origin}/jobs/apply?code=${jobCode}`;
                navigator.clipboard.writeText(url);
              } catch {}
            }}
          >
            Copy Link
          </button>
        </div>
      </div>

      <CandidatesSection applied={applied} vetted={vetted} loading={loading} />

      <div className="mt-8">
        <div className="font-semibold mb-1">
          Recommended (Euman AI Certified) Candidates
          <span className="ml-2 text-xs text-emerald-600 font-normal">
            (coming soon)
          </span>
        </div>
        <div className="rounded-lg border border-dashed p-4 text-xs text-gray-500 bg-gray-50">
          This section will show recommended candidates certified by Euman AI
          based on advanced vetting and skills matching.
        </div>
      </div>
    </div>
  );
}
