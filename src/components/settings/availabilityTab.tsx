// src/components/settings/AvailabilityTab.tsx
"use client";

import { useMemo, useState } from "react";

type Init = {
  timezone?: string | null;
  hoursPerWeek?: number | null;
  daysAvailable?: string[] | null; // ["Mon","Tue",...]
  startHour?: number | null; // 0-23
  endHour?: number | null; // 0-23
};

type Normalized = {
  timezone?: string;
  hoursPerWeek?: number;
  daysAvailable?: string[];
  startHour?: number;
  endHour?: number;
};

export default function AvailabilityTab({
  initial,
  onSave,
}: {
  initial: Init;
  onSave: (data: Partial<Normalized>) => Promise<void>;
}) {
  // Normalize nulls to undefined/empty values once
  const normalizedInitial: Normalized = useMemo(
    () => ({
      timezone: initial.timezone ?? undefined,
      hoursPerWeek: initial.hoursPerWeek ?? undefined,
      daysAvailable: initial.daysAvailable ?? undefined,
      startHour: initial.startHour ?? undefined,
      endHour: initial.endHour ?? undefined,
    }),
    [initial]
  );

  const [form, setForm] = useState<Normalized>({ ...normalizedInitial });
  const [saving, setSaving] = useState(false);

  function set<K extends keyof Normalized>(k: K, v: Normalized[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      // Already normalized — can pass straight through.
      await onSave(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <input
        placeholder="Timezone (e.g., America/Los_Angeles)"
        className="rounded-lg border p-2"
        value={form.timezone ?? ""}
        onChange={(e) => set("timezone", e.target.value || undefined)}
      />

      <input
        type="number"
        placeholder="Hours per week"
        className="rounded-lg border p-2"
        value={form.hoursPerWeek ?? ""}
        onChange={(e) =>
          set(
            "hoursPerWeek",
            e.target.value === "" ? undefined : Number(e.target.value)
          )
        }
      />

      <div className="flex flex-wrap gap-2">
        {DAYS.map((d) => {
          const on = (form.daysAvailable || []).includes(d);
          return (
            <button
              type="button"
              key={d}
              className={`rounded-full border px-3 py-1 text-sm ${
                on ? "bg-black text-white" : ""
              }`}
              onClick={() => {
                const setDays = new Set(form.daysAvailable || []);
                if (on) setDays.delete(d);
                else setDays.add(d);
                const next = Array.from(setDays);
                set("daysAvailable", next.length ? next : undefined);
              }}
            >
              {d}
            </button>
          );
        })}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <input
          type="number"
          placeholder="Workday start hour (0–23)"
          className="rounded-lg border p-2"
          value={form.startHour ?? ""}
          onChange={(e) =>
            set(
              "startHour",
              e.target.value === "" ? undefined : Number(e.target.value)
            )
          }
        />
        <input
          type="number"
          placeholder="Workday end hour (0–23)"
          className="rounded-lg border p-2"
          value={form.endHour ?? ""}
          onChange={(e) =>
            set(
              "endHour",
              e.target.value === "" ? undefined : Number(e.target.value)
            )
          }
        />
      </div>

      <button
        type="submit"
        className="w-fit rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
        disabled={saving}
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
