"use client";
import React, { useState } from "react";
import PremiumSelect from "@/components/forms/PremiumSelect";
import Image from "next/image";
import { suggestNormalizedTitle } from "@/lib/smart-input";
import { apiFetch } from "@/lib/api";
import SkillSuggest from "./SkillSuggest";

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
  onAddSkill: (v?: string) => void;
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
  const [titleReady, setTitleReady] = useState(false);
  const [titleAlts, setTitleAlts] = useState<string[]>([]);
  const [titleBusy, setTitleBusy] = useState(false);
  const [lastTitleAi, setLastTitleAi] = useState<string>("");
  const [showHints, setShowHints] = useState(false);

  const titleValid = (title || "").trim().length > 0;
  const roleValid = (roleName || "").trim().length > 0;
  const companyValid = (company || "").trim().length > 0;
  const jdValid = (jdText || "").trim().length >= 120;
  const locationDetailsRequired = location !== "remote" && locationScope !== "global";
  const locationDetailsValid = !locationDetailsRequired || (locationDetails || "").trim().length > 0;
  const salaryFromValid = (monthlySalaryMin || "").trim().length > 0;
  const salaryToValid = (monthlySalaryMax || "").trim().length > 0;
  const salaryOrderValid =
    salaryFromValid && salaryToValid && !Number.isNaN(Number(monthlySalaryMin)) && !Number.isNaN(Number(monthlySalaryMax))
      ? Number(monthlySalaryMin) <= Number(monthlySalaryMax)
      : false;
  const startValid = (startDate || "").trim().length > 0;
  const commValid = Number.isFinite(commImportance) && commImportance >= 1 && commImportance <= 5;
  const currencyValid = (salaryCurrency || "").trim().length > 0;
  const hoursValid = (hoursPerWeek || "").trim().length > 0 && !Number.isNaN(Number(hoursPerWeek)) && Number(hoursPerWeek) > 0;
  const skillsValid = skills.length > 0;

  function focusById(id: string) {
    try {
      const el = document.getElementById(id) as HTMLElement | null;
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus?.();
    } catch {}
  }
  function gotoFirstInvalid() {
    if (!titleValid) return focusById("job-title");
    if (!roleValid) return focusById("role-name");
    if (!companyValid) return focusById("company-name");
    if (!jdValid) return focusById("jd-text");
    if (!locationDetailsValid) return focusById("location-details");
    if (!startValid) return focusById("start-date");
    if (!commValid) return focusById("comm-importance");
    if (!salaryFromValid) return focusById("salary-from");
    if (!salaryToValid || !salaryOrderValid) return focusById("salary-to");
    if (!currencyValid) return focusById("salary-currency");
    if (!hoursValid) return focusById("hours-week");
    if (!skillsValid) return focusById("skills-input");
  }

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
            id="job-title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleReady) setTitleReady(false);
            }}
            onBlur={() => {
              const { suggestion, changed } = suggestNormalizedTitle(title);
              if (changed) setTitle(suggestion);
              setTitleReady(true);
              // AI suggestions (title-only), gated to preserve tokens
              const tval = (changed ? suggestion : title).trim();
              if (!tval || tval.length < 4) return;
              if (lastTitleAi === tval) return;
              setTitleBusy(true);
              apiFetch<{ ok: boolean; suggestion: string; alternates: string[]; confidence: number }>(
                "/api/suggest/title",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ text: tval }),
                  retries: 0,
                }
              )
                .then((res) => {
                  if (res?.ok) {
                    const s = res.suggestion?.trim();
                    if (s && s !== tval) {
                      setTitleAlts(Array.from(new Set([s, ...(res.alternates || [])])).slice(0, 5));
                    } else {
                      setTitleAlts((res.alternates || []).slice(0, 5));
                    }
                    setLastTitleAi(tval);
                  }
                })
                .catch(() => {})
                .finally(() => setTitleBusy(false));
            }}
            placeholder="e.g., Frontend Developer"
            className={`w-full rounded-xl p-3 cursor-text border ${
              showHints && !titleValid ? "border-red-400 focus:ring-2 focus:ring-red-300" : ""
            }`}
            aria-invalid={showHints && !titleValid}
          />
          {(() => {
            const { suggestion, changed } = suggestNormalizedTitle(title);
            if (!changed || !suggestion) return null;
            return (
              <div className="mt-1 text-xs text-neutral-600">
                Did you mean <button type="button" className="underline text-emerald-700" onClick={() => setTitle(suggestion)}>{suggestion}</button>?
              </div>
            );
          })()}
          {showHints && !titleValid && (
            <div className="mt-1 text-[11px] text-red-600">Job title is required.</div>
          )}
          {titleAlts.length > 0 && (
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-[11px] uppercase tracking-wide text-neutral-500">Suggestions:</span>
              {titleAlts.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="rounded-full border px-2.5 py-0.5 text-xs hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer"
                  onClick={() => {
                    setTitle(s);
                    setTitleAlts([]);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Role Name</label>
          <input
            id="role-name"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="e.g., Frontend Engineer"
            className={`w-full rounded-xl p-3 cursor-text border ${
              showHints && !roleValid ? "border-red-400 focus:ring-2 focus:ring-red-300" : ""
            }`}
            aria-invalid={showHints && !roleValid}
          />
          {showHints && !roleValid && (
            <div className="mt-1 text-[11px] text-red-600">Role name is required.</div>
          )}
          {(() => {
            const { suggestion, changed } = suggestNormalizedTitle(roleName);
            if (!changed || !suggestion) return null;
            return (
              <div className="mt-1 text-xs text-neutral-600">
                Did you mean <button type="button" className="underline text-emerald-700" onClick={() => setRoleName(suggestion)}>{suggestion}</button>?
              </div>
            );
          })()}
        </div>
      </div>
      <div>
        <input
          id="company-name"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company"
          className={`w-full rounded-xl p-3 cursor-text border ${
            showHints && !companyValid ? "border-red-400 focus:ring-2 focus:ring-red-300" : ""
          }`}
          aria-invalid={showHints && !companyValid}
        />
        {showHints && !companyValid && (
          <div className="mt-1 text-[11px] text-red-600">Company is required.</div>
        )}
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
          <label className="block text-sm font-medium mb-1">Location scope</label>
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
          <label className="block text-sm font-medium mb-1">Employment Type</label>
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
            onChange={(e) => setSeniority((e.target as HTMLSelectElement).value)}
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
          <label className="block text-sm font-medium mb-1">Location details</label>
          <input
            id="location-details"
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
            className={`w-full rounded-xl p-3 border ${
              showHints && !locationDetailsValid ? "border-red-400 focus:ring-2 focus:ring-red-300" : ""
            }`}
            disabled={locationScope === "global"}
          />
          {showHints && !locationDetailsValid && (
            <div className="mt-1 text-[11px] text-red-600">Location details are required (unless scope is Global).</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Start date</label>
          <input
            id="start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-xl border p-3 bg-white text-neutral-900 [color-scheme:light] dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-700"
            type="date"
          />
          {showHints && !startValid && (
            <div className="mt-1 text-[11px] text-red-600">Please select a start date.</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Communication importance (1-5)</label>
          <input
            id="comm-importance"
            value={commImportance === 0 ? "" : String(commImportance)}
            onChange={(e) => {
              const raw = e.target.value;
              const v = raw.replace(/[^0-9]/g, "");
              if (v === "") {
                setCommImportance(0); // invalid state to allow highlighting
                return;
              }
              const num = Math.min(5, Math.max(1, parseInt(v, 10)));
              setCommImportance(num);
            }}
            className={`w-full rounded-xl p-3 border ${showHints && !commValid ? "border-red-400 focus:ring-2 focus:ring-red-300" : ""}`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="1 to 5"
            aria-invalid={showHints && !commValid}
          />
          {showHints && !commValid && (
            <div className="mt-1 text-[11px] text-red-600">Enter a value from 1 to 5.</div>
          )}
        </div>
      </div>

      {/* AI context preview (only after user adds something) */}
      {(() => {
        const detail = locationScope === "global" ? "Global" : (locationDetails || "").trim();
        const show = location !== "remote" || locationScope !== "country" || !!detail;
        if (!show) return null;
        return (
          <div className="rounded-xl border bg-white px-3 py-2 text-sm text-neutral-700">{cap(location)}{detail ? ` - ${detail}` : ""}</div>
        );
      })()}

      {/* Compensation & hours */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div>
          <label className="block text-sm font-medium mb-1">Currency</label>
          <PremiumSelect
            id="salary-currency"
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
          <label className="block text-sm font-medium mb-1">Monthly salary - from</label>
          <div className="relative">
            <input
              id="salary-from"
              value={monthlySalaryMin}
              onChange={(e) => setMonthlySalaryMin(e.target.value.replace(/[^0-9]/g, ""))}
              className={`w-full rounded-xl p-3 pr-16 border ${
                showHints && !salaryFromValid ? "border-red-400 focus:ring-2 focus:ring-red-300" : ""
              }`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="e.g., 5000"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">/month</span>
          </div>
          {showHints && !salaryFromValid && (
            <div className="mt-1 text-[11px] text-red-600">Enter a minimum monthly salary.</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Monthly salary - to</label>
          <div className="relative">
            <input
              id="salary-to"
              value={monthlySalaryMax}
              onChange={(e) => setMonthlySalaryMax(e.target.value.replace(/[^0-9]/g, ""))}
              className={`w-full rounded-xl p-3 pr-16 border ${
                showHints && (!salaryToValid || !salaryOrderValid) ? "border-red-400 focus:ring-2 focus:ring-red-300" : ""
              }`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="e.g., 8000"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">/month</span>
          </div>
          {showHints && !salaryToValid && (
            <div className="mt-1 text-[11px] text-red-600">Enter a maximum monthly salary.</div>
          )}
          {showHints && salaryToValid && !salaryOrderValid && (
            <div className="mt-1 text-[11px] text-red-600">Maximum should be greater than or equal to minimum.</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hours / week</label>
          <input
            id="hours-week"
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(e.target.value.replace(/[^0-9]/g, ""))}
            className={`w-full rounded-xl p-3 border ${showHints && !hoursValid ? "border-red-400 focus:ring-2 focus:ring-red-300" : ""}`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="e.g., 40"
          />
          {showHints && !hoursValid && (
            <div className="mt-1 text-[11px] text-red-600">Enter hours per week (e.g., 40).</div>
          )}
        </div>
      </div>

      {/* Skills */}
      <div>
        <label className="block text-sm font-medium mb-1">Skills</label>
        <div className="flex gap-2">
          <input
            id="skills-input"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddSkill();
              }
            }}
            placeholder="Add a skill and press Enter"
            className={`flex-1 rounded-xl p-3 border ${showHints && !skillsValid ? "border-red-400 focus:ring-2 focus:ring-red-300" : ""}`}
          />
          <button
            type="button"
            onClick={() => onAddSkill()}
            className="rounded-xl border px-4 py-2 text-sm bg-white text-black hover:bg-gray-50 min-w-[140px] shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer"
          >
            Add Skill
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {skills.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-gray-600 bg-white"
            >
              {s}
              <button
                type="button"
                className="text-red-600 cursor-pointer"
                onClick={() => onRemoveSkill(s)}
                aria-label={`Remove ${s}`}
                title="Remove"
              >
                {"\u00D7"}
              </button>
            </span>
          ))}
        </div>
        {showHints && !skillsValid && (
          <div className="mt-1 text-[11px] text-red-600">Add at least one skill.</div>
        )}
        <SkillSuggest
          title={title}
          existing={skills}
          enabled={titleReady}
          onPick={(s) => {
            if (skills.includes(s)) return;
            onAddSkill(s);
          }}
        />
      </div>

      {/* JD */}
      <div>
        <div className="mb-1 text-sm font-medium">Job Description (JD)</div>
        <textarea
          id="jd-text"
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          className={`rounded-xl p-3 h-[300px] w-full overflow-auto leading-6 font-mono text-[13px] border ${
            showHints && !jdValid ? "border-red-400 focus:ring-2 focus:ring-red-300" : ""
          }`}
          placeholder="Paste or generate the job description here..."
        />
        <div className="mt-1 text-xs text-gray-500">
          JD length: {jdText.trim().length} characters (min 120)
        </div>
        {showHints && !jdValid && (
          <div className="mt-1 text-[11px] text-red-600">Please write at least 120 characters.</div>
        )}

      {showHints && (!titleValid || !roleValid || !companyValid || !jdValid || !locationDetailsValid || !startValid || !salaryFromValid || !salaryToValid || (salaryToValid && !salaryOrderValid) || !commValid || !hoursValid || !skillsValid || !currencyValid) && (
        <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-2 text-[12px] text-amber-800">
          Complete to continue:
          <div className="mt-1 flex flex-wrap gap-2">
            {!titleValid && (
              <button type="button" className="underline" onClick={() => focusById("job-title")}>Job Title</button>
            )}
            {!roleValid && (
              <button type="button" className="underline" onClick={() => focusById("role-name")}>Role Name</button>
            )}
            {!companyValid && (
              <button type="button" className="underline" onClick={() => focusById("company-name")}>Company</button>
            )}
            {!jdValid && (
              <button type="button" className="underline" onClick={() => focusById("jd-text")}>Job Description</button>
            )}
            {!locationDetailsValid && (
              <button type="button" className="underline" onClick={() => focusById("location-details")}>Location details</button>
            )}
            {!startValid && (
              <button type="button" className="underline" onClick={() => focusById("start-date")}>Start date</button>
            )}
            {(!salaryFromValid || !salaryToValid || (salaryToValid && !salaryOrderValid)) && (
              <button type="button" className="underline" onClick={() => focusById(!salaryFromValid ? "salary-from" : "salary-to")}>Salary range</button>
            )}
            {!commValid && (
              <button type="button" className="underline" onClick={() => focusById("comm-importance")}>Communication importance</button>
            )}
            {!hoursValid && (
              <button type="button" className="underline" onClick={() => focusById("hours-week")}>Hours / week</button>
            )}
            {!skillsValid && (
              <button type="button" className="underline" onClick={() => focusById("skills-input")}>Skills</button>
            )}
            {!currencyValid && (
              <button type="button" className="underline" onClick={() => focusById("salary-currency")}>Currency</button>
            )}
          </div>
        </div>
      )}
      </div>

      <div className="flex flex-wrap gap-3 justify-end relative">
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
                {aiBusy ? "Generating..." : "Generate AI JD"}
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
          Next: Interview
        </button>
        {nextDisabled && (
          <button
            type="button"
            className="absolute right-0 top-0 h-full w-[200px] cursor-not-allowed bg-transparent"
            title="Complete Job Info to continue"
            onClick={() => {
              setShowHints(true);
              gotoFirstInvalid();
            }}
            aria-hidden
          />
        )}
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
              <Image src="/euman-logo.png" alt="Euman AI" width={160} height={36} priority className="h-9 w-auto animate-pulse" />
            </div>
            <div className="text-white/90 text-sm">Generating JD...</div>
          </div>
        </div>
      )}
    </div>
  );
}
