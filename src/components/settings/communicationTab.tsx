// src/components/settings/CommunicationTab.tsx
"use client";

import { useMemo, useState } from "react";
import type { AppUser } from "@/types/user";
import IntlPhoneInput from "@/components/forms/IntlPhoneInput";

export type CommunicationForm = {
  openToWork?: AppUser["openToWork"];
  email?: AppUser["email"];
  phone?: AppUser["phone"];
  whatsapp?: AppUser["whatsapp"];
  minMonthly?: AppUser["minMonthly"];
  minHourly?: AppUser["minHourly"];
  interests?: AppUser["interests"];
  allowEmail?: AppUser["allowEmail"];
  allowPhone?: AppUser["allowPhone"];
  allowWhatsApp?: AppUser["allowWhatsApp"];
};

type Props = {
  /** Initial values to render into the form */
  initial: CommunicationForm;
  /** Called with sanitized payload on submit */
  onSave: (data: CommunicationForm) => Promise<void>;
  /** Optional: show/hide salary fields for roles where it’s irrelevant */
  showComp?: boolean;
  /** Optional: disable email editing (e.g., if email is account identifier) */
  lockEmail?: boolean;
};

export default function CommunicationTab({
  initial,
  onSave,
  showComp = true,
  lockEmail = true,
}: Props) {
  // a stable initial to avoid re-mounts changing defaults
  const stableInitial = useMemo(() => ({ ...initial }), [initial]);

  const [form, setForm] = useState<CommunicationForm>(stableInitial);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  // use full E.164 formatted strings in value

  function update<K extends keyof CommunicationForm>(
    key: K,
    value: CommunicationForm[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Helpers for controlled number inputs (allow empty string in UI, but send numbers/undefined)
  const minMonthlyStr =
    typeof form.minMonthly === "number" ? String(form.minMonthly) : "";
  const minHourlyStr =
    typeof form.minHourly === "number" ? String(form.minHourly) : "";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    setOk(null);
    try {
      const payload: CommunicationForm = {
        openToWork: !!form.openToWork,
        email: form.email?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        whatsapp: form.whatsapp?.trim() || undefined,
        minMonthly:
          typeof form.minMonthly === "number" ? form.minMonthly : undefined,
        minHourly:
          typeof form.minHourly === "number" ? form.minHourly : undefined,
        interests: Array.isArray(form.interests) ? form.interests : [],
        allowEmail: !!form.allowEmail,
        allowPhone: !!form.allowPhone,
        allowWhatsApp: !!form.allowWhatsApp,
      };

      await onSave(payload);
      setOk("Saved.");
    } catch (e: any) {
      setErr(e?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      {/* Open to work */}
      <label htmlFor="openToWork" className="flex items-center gap-2 text-sm">
        <input
          id="openToWork"
          type="checkbox"
          checked={!!form.openToWork}
          onChange={(e) => update("openToWork", e.target.checked)}
        />
        Open to job opportunities
      </label>

      {/* Contact methods */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="grid gap-1">
          <label htmlFor="email" className="text-xs text-gray-600">
            Email
          </label>
          <input
            id="email"
            placeholder="your@email.com"
            className="rounded-lg border p-2"
            value={form.email || ""}
            onChange={(e) => update("email", e.target.value)}
            disabled={lockEmail}
            inputMode="email"
            autoComplete="email"
          />
        </div>
        <div className="grid gap-1">
          <label htmlFor="phone" className="text-xs text-gray-600">
            Phone
          </label>
          <IntlPhoneInput
            id="phone"
            value={form.phone || ""}
            onChange={(v) => update("phone", v)}
          />
        </div>
        <div className="grid gap-1">
          <label htmlFor="whatsapp" className="text-xs text-gray-600">
            WhatsApp
          </label>
          <IntlPhoneInput
            id="whatsapp"
            value={form.whatsapp || ""}
            onChange={(v) => update("whatsapp", v)}
          />
        </div>
      </div>

      {/* Compensation prefs */}
      {showComp && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <label htmlFor="minMonthly" className="text-xs text-gray-600">
              Minimum monthly pay
            </label>
            <input
              id="minMonthly"
              type="number"
              min={0}
              placeholder="e.g. 3000"
              className="rounded-lg border p-2"
              value={minMonthlyStr}
              onChange={(e) =>
                update(
                  "minMonthly",
                  e.target.value === "" ? undefined : Number(e.target.value)
                )
              }
            />
          </div>
          <div className="grid gap-1">
            <label htmlFor="minHourly" className="text-xs text-gray-600">
              Minimum hourly rate
            </label>
            <input
              id="minHourly"
              type="number"
              min={0}
              placeholder="e.g. 40"
              className="rounded-lg border p-2"
              value={minHourlyStr}
              onChange={(e) =>
                update(
                  "minHourly",
                  e.target.value === "" ? undefined : Number(e.target.value)
                )
              }
            />
          </div>
        </div>
      )}

      {/* Interests */}
      <div className="grid gap-1">
        <label htmlFor="interests" className="text-xs text-gray-600">
          Interests (comma-separated)
        </label>
        <input
          id="interests"
          placeholder="frontend, devops, fintech"
          className="rounded-lg border p-2"
          value={(form.interests || []).join(", ")}
          onChange={(e) =>
            update(
              "interests",
              e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            )
          }
        />
      </div>

      {/* Allowed channels */}
      <div className="grid gap-2 sm:grid-cols-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!form.allowEmail}
            onChange={(e) => update("allowEmail", e.target.checked)}
          />
          Email contact
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!form.allowPhone}
            onChange={(e) => update("allowPhone", e.target.checked)}
          />
          Phone contact
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!form.allowWhatsApp}
            onChange={(e) => update("allowWhatsApp", e.target.checked)}
          />
          WhatsApp contact
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="w-fit rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          disabled={saving}
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {ok && <span className="text-emerald-600 text-sm">{ok}</span>}
        {err && <span className="text-rose-600 text-sm">{err}</span>}
      </div>
    </form>
  );
}
/* eslint-disable @typescript-eslint/no-explicit-any */
