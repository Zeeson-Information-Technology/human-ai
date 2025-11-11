"use client";
import React, { useState } from "react";
import PremiumSelect from "@/components/forms/PremiumSelect";
import Image from "next/image";

type JobTabProps = {
  title: string;
  setTitle: (v: string) => void;
  roleName: string;
  setRoleName: (v: string) => void;
  company: string;
  setCompany: (v: string) => void;

  // JD
  jdText: string;
  setJdText: (v: string) => void;

  // Details
  location: "remote" | "hybrid" | "onsite";
  setLocation: (v: "remote" | "hybrid" | "onsite") => void;
  locationDetails: string;
  setLocationDetails: (v: string) => void;
  employmentType: string;
  setEmploymentType: (v: string) => void;
  seniority: string;
  setSeniority: (v: string) => void;
  commImportance: number;
  setCommImportance: (v: number) => void;
  startDate: string;
  setStartDate: (v: string) => void;

  // Compensation
  salaryCurrency: "NGN" | "USD" | "CAD" | "EUR" | "GBP";
  setSalaryCurrency: (v: "NGN" | "USD" | "CAD" | "EUR" | "GBP") => void;
  monthlySalaryMin: string;
  setMonthlySalaryMin: (v: string) => void;
  monthlySalaryMax: string;
  setMonthlySalaryMax: (v: string) => void;
  hoursPerWeek: string;
  setHoursPerWeek: (v: string) => void;

  // Skills
  skills: string[];
  skillInput: string;
  setSkillInput: (v: string) => void;
  onAddSkill: () => void;
  onRemoveSkill: (s: string) => void;

  onGenerateAIJD: () => void;
  aiBusy?: boolean;
  onNext: () => void;
  nextDisabled?: boolean;
};

export default function JobTab(props: JobTabProps) {
  const {
    title,
    setTitle,
    roleName,
    setRoleName,
    company,
    setCompany,
    jdText,
    setJdText,
    location,
    setLocation,
    locationDetails,
    setLocationDetails,
    employmentType,
    setEmploymentType,
    seniority,
    setSeniority,
    commImportance,
    setCommImportance,
    startDate,
    setStartDate,
    salaryCurrency,
    setSalaryCurrency,
    monthlySalaryMin,
    setMonthlySalaryMin,
    monthlySalaryMax,
    setMonthlySalaryMax,
    hoursPerWeek,
    setHoursPerWeek,
    skills,
    skillInput,
    setSkillInput,
    onAddSkill,
    onRemoveSkill,
    onGenerateAIJD,
    aiBusy,
    onNext,
    nextDisabled,
  } = props;

  const [locationScope, setLocationScope] = useState<
    "city" | "region" | "country" | "continent" | "global"
  >("country");

  function cap(s: string) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  }

  return (
    <div className="grid gap-5">
      {/* Basic */}
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">Job Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Frontend Developer"
            className="w-full rounded-xl border p-3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Role Name</label>
          <input
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="e.g., Frontend Engineering"
            className="w-full rounded-xl border p-3"
          />
        </div>
      </div>
      <div>
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company"
          className="w-full rounded-xl border p-3"
        />
      </div>

      {/* Location & type */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <PremiumSelect
            value={location}
            onChange={(e) =>
              setLocation((e.target as HTMLSelectElement).value as any)
            }
            appearance="light"
          >
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">Onsite</option>
          </PremiumSelect>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Location scope
          </label>
          <PremiumSelect
            value={locationScope}
            onChange={(e) => {
              const v = (e.target as HTMLSelectElement).value as
                | "city"
                | "region"
                | "country"
                | "continent"
                | "global";
              setLocationScope(v);
              if (v === "global") {
                try {
                  // reflect in details for AI context and exports
                  setLocationDetails("Global");
                } catch {}
              } else if ((locationDetails || "").toLowerCase() === "global") {
                setLocationDetails("");
              }
            }}
            appearance="light"
          >
            <option value="city">City</option>
            <option value="region">State / Region</option>
            <option value="country">Country</option>
            <option value="continent">Continent</option>
            <option value="global">Global</option>
          </PremiumSelect>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Employment Type
          </label>
          <PremiumSelect
            value={employmentType}
            onChange={(e) =>
              setEmploymentType((e.target as HTMLSelectElement).value)
            }
            appearance="light"
          >
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </PremiumSelect>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Seniority</label>
          <PremiumSelect
            value={seniority}
            onChange={(e) =>
              setSeniority((e.target as HTMLSelectElement).value)
            }
            appearance="light"
          >
            <option value="junior">Junior</option>
            <option value="mid">Mid</option>
            <option value="senior">Senior</option>
            <option value="lead">Lead</option>
          </PremiumSelect>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            Location details
          </label>
          <input
            value={locationDetails}
            onChange={(e) => setLocationDetails(e.target.value)}
            placeholder={
              locationScope === "global"
                ? "Global"
                : locationScope === "city"
                ? "e.g., Lagos"
                : locationScope === "region"
                ? "e.g., Ontario"
                : locationScope === "country"
                ? "e.g., Canada"
                : "e.g., Africa"
            }
            className="w-full rounded-xl border p-3"
            disabled={locationScope === "global"}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Start date</label>
          <input
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-xl border p-3 bg-white text-neutral-900 [color-scheme:light] dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-700"
            type="date"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Communication importance (1–5)
          </label>
          <input
            value={commImportance}
            onChange={(e) => setCommImportance(Number(e.target.value) || 1)}
            className="w-full rounded-xl border p-3"
            type="number"
            min={1}
            max={5}
          />
        </div>
      </div>

      {/* AI context preview (only after user adds something) */}
      {(() => {
        const detail =
          locationScope === "global"
            ? "Global"
            : (locationDetails || "").trim();
        const show =
          location !== "remote" || locationScope !== "country" || !!detail;
        if (!show) return null;
        return (
          <div className="rounded-xl border bg-white px-3 py-2 text-sm text-neutral-700">
            {cap(location)}
            {detail ? ` � ${detail}` : ""}
          </div>
        );
      })()}
      {/* Compensation & hours */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div>
          <label className="block text-sm font-medium mb-1">Currency</label>
          <PremiumSelect
            value={salaryCurrency}
            onChange={(e) =>
              setSalaryCurrency((e.target as HTMLSelectElement).value as any)
            }
            appearance="light"
          >
            {(["NGN", "USD", "CAD", "EUR", "GBP"] as const).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </PremiumSelect>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Salary (monthly) — from
          </label>
          <input
            value={monthlySalaryMin}
            onChange={(e) => setMonthlySalaryMin(e.target.value)}
            className="w-full rounded-xl border p-3"
            type="number"
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Salary (monthly) — to
          </label>
          <input
            value={monthlySalaryMax}
            onChange={(e) => setMonthlySalaryMax(e.target.value)}
            className="w-full rounded-xl border p-3"
            type="number"
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hours / week</label>
          <input
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(e.target.value)}
            className="w-full rounded-xl border p-3"
            type="number"
            min={0}
          />
        </div>
      </div>

      {/* Skills */}
      <div>
        <label className="block text-sm font-medium mb-1">Skills</label>
        <div className="flex gap-2">
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddSkill();
              }
            }}
            placeholder="Add a skill and press Enter"
            className="flex-1 rounded-xl border p-3"
          />
          <button
            type="button"
            onClick={onAddSkill}
            className="rounded-xl border px-4 py-2 text-sm bg-white text-black hover:bg-gray-50 min-w-[140px] shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer"
          >
            Add Skill
          </button>
        </div>
      </div>

      {/* JD */}
      <div>
        <div className="mb-1 text-sm font-medium">Job Description (JD)</div>
        <textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          className="rounded-xl border p-3 h-[300px] w-full overflow-auto leading-6 font-mono text-[13px]"
          placeholder="Paste or generate the job description here..."
        />
        <div className="mt-1 text-xs text-gray-500">
          JD length: {jdText.trim().length} characters (min 120)
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-end">
        {(() => {
          const jdEnough = (jdText || "").trim().length >= 60; // prime AI with enough context
          const hasBasics =
            (title || "").trim().length > 0 ||
            (roleName || "").trim().length > 0 ||
            (company || "").trim().length > 0;
          const canGenerate = jdEnough && hasBasics;
          const genTitle = canGenerate
            ? undefined
            : "Add title/role/company and at least ~60 chars in JD to generate";
          return (
            <>
              <button
                type="button"
                onClick={onGenerateAIJD}
                className="rounded-2xl px-5 py-3 font-semibold text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-600 shadow-xl ring-1 ring-black/10 hover:shadow-2xl transition focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:cursor-not-allowed"
                disabled={aiBusy || !canGenerate}
                title={genTitle}
              >
                {aiBusy ? "Generating…" : "Generate AI JD"}
              </button>
            </>
          );
        })()}
        <button
          type="button"
          onClick={onNext}
          disabled={!!nextDisabled}
          title={nextDisabled ? "Complete Job Info to continue" : undefined}
          className={`rounded-2xl px-5 py-3 font-semibold text-white bg-emerald-700/90 shadow ring-1 ring-black/10 hover:shadow-2xl transition ${
            nextDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
          } disabled:cursor-not-allowed disabled:hover:cursor-not-allowed`}
        >
          Next: Interview →
        </button>
      </div>

      {/* AI JD loader overlay */}
      {aiBusy && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-black/40 backdrop-blur-sm"
          role="status"
          aria-live="polite"
          aria-label="Generating job description"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="relative grid h-12 w-auto place-items-center">
              <Image
                src="/euman-logo.png"
                alt="Euman AI"
                width={160}
                height={36}
                priority
                className="h-9 w-auto animate-pulse"
              />
            </div>
            <div className="text-white/90 text-sm">Generating JD…</div>
          </div>
        </div>
      )}
    </div>
  );
}
