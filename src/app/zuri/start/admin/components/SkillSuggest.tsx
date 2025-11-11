"use client";
import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

type Groups = {
  core: string[];
  frameworks: string[];
  cloud: string[];
  data: string[];
  languages: string[];
  tools: string[];
};

export default function SkillSuggest({
  title,
  existing,
  onPick,
  enabled = false,
}: {
  title?: string;
  existing: string[];
  onPick: (s: string) => void;
  enabled?: boolean;
}) {
  const [groups, setGroups] = useState<Groups | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastTitle, setLastTitle] = useState<string>("");

  useEffect(() => {
    if (!enabled) return;
    const t = setTimeout(async () => {
      const tval = (title || "").trim();
      if (!tval || tval.length < 4) {
        setGroups(null);
        return;
      }
      if (tval === lastTitle) return; // avoid duplicate calls
      try {
        setLoading(true);
        const res = await apiFetch<{ ok: boolean; groups: Groups }>("/api/suggest/skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: tval }), // title-only to preserve tokens
          retries: 0,
        });
        if (res?.ok) {
          setGroups(res.groups);
          setLastTitle(tval);
        }
      } catch {
        // ignore; stay silent
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [enabled, title, lastTitle]);

  if (!enabled || !groups || loading) return null;

  const order: Array<keyof Groups> = ["core", "frameworks", "cloud", "data", "languages", "tools"];

  return (
    <div className="mt-3">
      <div className="text-xs font-semibold text-neutral-700">Suggested skills</div>
      <div className="mt-2 grid gap-2">
        {order.map((k) => {
          const items = groups[k] || [];
          if (!items.length) return null;
          return (
            <div key={k} className="flex flex-wrap items-center gap-2">
              <div className="w-28 text-[11px] uppercase tracking-wide text-neutral-500">{String(k)}</div>
              <div className="flex flex-wrap gap-2">
                {items.map((s) => {
                  const exists = existing.includes(s);
                  return (
                    <button
                      key={k + s}
                      type="button"
                      onClick={() => !exists && onPick(s)}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        exists ? "bg-neutral-100 text-neutral-500 cursor-default" : "bg-white text-neutral-900 hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer"
                      }`}
                      disabled={exists}
                      title={exists ? "Already added" : "Add skill"}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
