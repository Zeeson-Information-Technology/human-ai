"use client";
import React from "react";
import PremiumSelect from "@/components/forms/PremiumSelect";

type InterviewType = "standard" | "resume-based" | "human-data" | "software";

type InterviewTabProps = {
  interviewType: InterviewType | null;
  setInterviewType: (t: InterviewType | null) => void;
  langs: string[];
  setLangs: (l: string[]) => void;
  onCreateJob?: () => void;
  createDisabled?: boolean;
  // screeners
  screeners?: ScreenerRuleUI[];
  onAddPreset?: (cat: ScreenerCategory) => void;
  onChangeRule?: (idx: number, patch: Partial<ScreenerRuleUI>) => void;
  onRemoveRule?: (idx: number) => void;
};

type ScreenerKind = "number" | "currency" | "select" | "boolean" | "text";
type ScreenerCategory =
  | "experience"
  | "language"
  | "monthly-salary"
  | "notice-period"
  | "hourly-rate"
  | "custom";
type ScreenerRuleUI = {
  question: string;
  kind: ScreenerKind;
  category: ScreenerCategory;
  min?: string;
  max?: string;
  options?: string;
  idealAnswer?: string;
  qualifying: boolean;
  qualifyWhen?: "lt" | "lte" | "eq" | "gte" | "gt" | "neq" | "in" | "nin";
  qualifyValue?: string;
  currency?: "NGN" | "USD" | "CAD" | "EUR" | "GBP";
  unit?: string;
};

const LANG_GROUPS = [
  {
    label: "Global",
    options: [
      { code: "en", label: "English" },
      { code: "fr", label: "French" },
      { code: "es", label: "Spanish" },
      { code: "pt", label: "Portuguese" },
      { code: "de", label: "German" },
      { code: "it", label: "Italian" },
      { code: "nl", label: "Dutch" },
      { code: "ru", label: "Russian" },
      { code: "tr", label: "Turkish" },
      { code: "ar", label: "Arabic" },
      { code: "zh", label: "Chinese (Mandarin)" },
      { code: "ja", label: "Japanese" },
      { code: "ko", label: "Korean" },
      { code: "hi", label: "Hindi" },
      { code: "bn", label: "Bengali" },
      { code: "ur", label: "Urdu" },
      { code: "id", label: "Indonesian" },
      { code: "vi", label: "Vietnamese" },
      { code: "th", label: "Thai" },
      { code: "ms", label: "Malay" },
      { code: "pl", label: "Polish" },
      { code: "sv", label: "Swedish" },
      { code: "no", label: "Norwegian" },
      { code: "da", label: "Danish" },
      { code: "fi", label: "Finnish" },
      { code: "el", label: "Greek" },
      { code: "cs", label: "Czech" },
      { code: "ro", label: "Romanian" },
    ],
  },
  {
    label: "Africa",
    options: [
      { code: "yo", label: "Yoruba" },
      { code: "ig", label: "Igbo" },
      { code: "ha", label: "Hausa" },
      { code: "sw", label: "Swahili" },
      { code: "am", label: "Amharic" },
      { code: "zu", label: "Zulu" },
      { code: "xh", label: "Xhosa" },
      { code: "af", label: "Afrikaans" },
      { code: "pcm", label: "Nigerian Pidgin English" },
    ],
  },
];

function ScreenerItem({
  value,
  onChange,
  onDelete,
  index,
}: {
  value: ScreenerRuleUI;
  onChange: (patch: Partial<ScreenerRuleUI>) => void;
  onDelete: () => void;
  index: number;
}) {
  const onlyDigits = (s: string) => s.replace(/[^0-9]/g, "");
  const isNumericOp = (
    op?: ScreenerRuleUI["qualifyWhen"]
  ) => op === "lt" || op === "lte" || op === "eq" || op === "gte" || op === "gt" || op === "neq";
  return (
    <div className="rounded-xl border border-neutral-200 bg-white text-neutral-900 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-100 transition-colors focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-200/50 hover:border-emerald-300 transition-colors focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-200 hover:border-emerald-300">
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="text-sm font-medium">
          {index + 1}. {value.question || "Untitled question"}
        </div>
        <button
          type="button"
          className="rounded-lg border px-2 text-xs text-red-600 cursor-pointer"
          onClick={onDelete}
        >
          Delete
        </button>
      </div>
      <div className="border-t border-neutral-200 px-3 py-3 grid gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-neutral-600">Type</label>
            <PremiumSelect
              value={value.kind}
              onChange={(e) =>
                onChange({ kind: e.target.value as ScreenerKind })
              }
              appearance="light"
            >
              <option value="number">Number</option>
              <option value="currency">Currency</option>
              <option value="select">Select</option>
              <option value="boolean">Yes/No</option>
              <option value="text">Text</option>
            </PremiumSelect>
          </div>
          <div>
            <label className="text-xs text-neutral-600">Category</label>
            <PremiumSelect
              value={value.category}
              onChange={(e) =>
                onChange({ category: e.target.value as ScreenerCategory })
              }
              appearance="light"
            >
              <option value="experience">Experience</option>
              <option value="language">Language proficiency</option>
              <option value="monthly-salary">Monthly salary</option>
              <option value="notice-period">Notice period</option>
              <option value="hourly-rate">Hourly rate</option>
              <option value="custom">Custom</option>
            </PremiumSelect>
          </div>
        </div>
        <div>
          <label className="text-xs text-neutral-600">Question</label>
          <input
            value={value.question}
            onChange={(e) => onChange({ question: e.target.value })}
            className="w-full rounded-xl border p-2 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            placeholder="Type the question"
          />
        </div>
        {value.kind === "select" && (
          <div>
            <label className="text-xs text-neutral-600">
              Options (comma-separated)
            </label>
            <input
              value={value.options || ""}
              onChange={(e) => onChange({ options: e.target.value })}
              className="w-full rounded-xl border p-2 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="e.g., A1,A2,B1,B2,C1,C2"
            />
          </div>
        )}
        {(value.kind === "number" || value.kind === "currency") && (
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs text-neutral-600">Min</label>
              <input
                value={value.min || ""}
                onChange={(e) => onChange({ min: onlyDigits(e.target.value) })}
                className="w-full rounded-xl border p-2 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-600">Max</label>
              <input
                value={value.max || ""}
                onChange={(e) => onChange({ max: onlyDigits(e.target.value) })}
                className="w-full rounded-xl border p-2 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>
            {value.kind === "currency" ? (
              <div>
                <label className="text-xs text-neutral-600">Currency</label>
                <PremiumSelect
                  value={value.currency || "USD"}
                  onChange={(e) =>
                    onChange({ currency: e.target.value as any })
                  }
                  appearance="light"
                >
                  <option value="USD">USD</option>
                  <option value="NGN">NGN</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                </PremiumSelect>
              </div>
            ) : (
              <div>
                <label className="text-xs text-neutral-600">Unit</label>
                <input
                  value={value.unit || ""}
                  onChange={(e) => onChange({ unit: e.target.value })}
                  className="w-full rounded-xl border p-2"
                  placeholder="e.g., years, weeks"
                />
              </div>
            )}
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] items-center">
          <div>
            <label className="text-xs text-neutral-600">Ideal Answer</label>
            {value.kind === "number" || value.kind === "currency" ? (
              <input
                value={value.idealAnswer || ""}
                onChange={(e) => onChange({ idealAnswer: onlyDigits(e.target.value) })}
                className="w-full rounded-xl border p-2 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="e.g., 3"
              />
            ) : (
              <input
                value={value.idealAnswer || ""}
                onChange={(e) => onChange({ idealAnswer: e.target.value })}
                className="w-full rounded-xl border p-2 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                placeholder="e.g., B2 or Yes"
              />
            )}
          </div>
          <label className="inline-flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              checked={!!value.qualifying}
              onChange={(e) => onChange({ qualifying: e.target.checked })}
              className="h-4 w-4 accent-emerald-600"
            />
            <span className="text-sm">Qualifying question</span>
          </label>
        </div>
        {value.qualifying && (
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs text-neutral-600">Operator</label>
              <PremiumSelect
                value={value.qualifyWhen || "gte"}
                onChange={(e) =>
                  onChange({ qualifyWhen: e.target.value as any })
                }
                appearance="light"
              >
                <option value="lt">Less than</option>
                <option value="lte">≤ Less than or equal</option>
                <option value="eq">Equal</option>
                <option value="gte">≥ Greater than or equal</option>
                <option value="gt">Greater than</option>
                <option value="neq">Not equal</option>
                <option value="in">In (CSV)</option>
                <option value="nin">Not in (CSV)</option>
              </PremiumSelect>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-neutral-600">Value</label>
              <input
                value={value.qualifyValue || ""}
                onChange={(e) => onChange({ qualifyValue: e.target.value })}
                className="w-full rounded-xl border p-2 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                placeholder="e.g., 2  |  B2,C1,C2  |  Yes"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InterviewTab({
  interviewType,
  setInterviewType,
  langs,
  setLangs,
  onCreateJob,
  createDisabled,
  screeners = [],
  onAddPreset,
  onChangeRule,
  onRemoveRule,
}: InterviewTabProps) {
  return (
    <div className="grid gap-6">
      <div>
        <label className="block text-sm font-medium mb-1">Interview Type</label>
        <PremiumSelect
          value={interviewType ?? ""}
          onChange={(e) =>
            setInterviewType((e.target.value || null) as InterviewType | null)
          }
          aria-label="Select interview type"
        >
          <option value="">Select type.</option>
          <option value="standard">Standard</option>
          <option value="resume-based">Resume Based</option>
          <option value="human-data">Human Data</option>
          <option value="software">Software</option>
        </PremiumSelect>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Interview language
        </label>
        <PremiumSelect
          value={langs[0] ?? ""}
          onChange={(e) => setLangs(e.target.value ? [e.target.value] : [])}
          aria-label="Select interview language"
        >
          <option value="">Select language.</option>
          {LANG_GROUPS.map((g) => (
            <optgroup key={g.label} label={g.label}>
              {g.options.map((o) => (
                <option key={o.code} value={o.code}>
                  {o.label}
                </option>
              ))}
            </optgroup>
          ))}
        </PremiumSelect>
      </div>

      {/* Screener builder */}
      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Screening questions</h3>
        </div>
        <div className="grid gap-3">
          {screeners.length === 0 && (
            <div className="rounded-xl border bg-white text-neutral-700 p-4 dark:bg-neutral-900 dark:text-neutral-200 dark:border-neutral-700">
              No screening questions added yet.
            </div>
          )}
          {screeners.map((sc, idx) => (
            <ScreenerItem
              key={idx}
              value={sc}
              index={idx}
              onChange={(patch) => onChangeRule?.(idx, patch)}
              onDelete={() => onRemoveRule?.(idx)}
            />
          ))}
        </div>

        {/* Quick add bar */}
        <div className="flex flex-wrap gap-2 pt-1">
          {(
            [
              ["experience", "Experience"],
              ["language", "Language proficiency"],
              ["monthly-salary", "Monthly salary"],
              ["notice-period", "Notice period"],
              ["hourly-rate", "Hourly rate"],
              ["custom", "Custom question"],
            ] as Array<[ScreenerCategory, string]>
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => onAddPreset?.(k)}
              className="rounded-full border px-3 py-1 text-xs text-black bg-white hover:bg-emerald-50 hover:border-emerald-300 transition-colors cursor-pointer dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-700"
            >
              + {label}
            </button>
          ))}
        </div>
      </div>

      {/* Create Job CTA */}
      {onCreateJob && (
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onCreateJob}
            disabled={!!createDisabled}
            className="rounded-2xl px-5 py-3 font-semibold text-white bg-emerald-700/90 shadow ring-1 ring-black/10 hover:shadow-2xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:cursor-not-allowed"
          >
            Create Job
          </button>
        </div>
      )}
    </div>
  );
}
