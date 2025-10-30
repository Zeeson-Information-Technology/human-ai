"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Switch from "@/components/switch";

const LANG_GROUPS = [
  {
    label: "Africa",
    options: [
      { code: "yo", label: "Yorùbá" },
      { code: "ig", label: "Igbo" },
      { code: "ha", label: "Hausa" },
      { code: "pcm", label: "Nigerian Pidgin English" },
    ],
  },
  {
    label: "Global",
    options: [
      { code: "en", label: "English" },
      { code: "es", label: "Spanish" },
      { code: "fr", label: "French" },
      { code: "pt", label: "Portuguese" },
      { code: "de", label: "German" },
      { code: "it", label: "Italian" },
      { code: "nl", label: "Dutch" },
      { code: "ru", label: "Russian" },
      { code: "tr", label: "Turkish" },
      { code: "hi", label: "Hindi" },
      { code: "bn", label: "Bengali" },
      { code: "ur", label: "Urdu" },
      { code: "zh", label: "Chinese (Mandarin)" },
      { code: "ja", label: "Japanese" },
      { code: "ko", label: "Korean" },
      { code: "id", label: "Indonesian" },
      { code: "vi", label: "Vietnamese" },
      { code: "th", label: "Thai" },
      { code: "ms", label: "Malay" },
    ],
  },
];

function Pill({ children }: { children: any }) {
  return (
    <span className="rounded-full border bg-white/70 px-3 py-1 text-xs text-gray-700 backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-gray-200">
      {children}
    </span>
  );
}

type Tab = "job" | "interview" | "candidates" | "invite";
type InterviewType = "standard" | "resume-based" | "human-data" | "software";

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
  options?: string; // comma-separated in UI
  idealAnswer?: string;
  qualifying: boolean;
  qualifyWhen?: "lt" | "lte" | "eq" | "gte" | "gt" | "neq" | "in" | "nin";
  qualifyValue?: string;
  currency?: "NGN" | "USD" | "CAD" | "EUR" | "GBP";
  unit?: string;
};

const PRESETS: Array<Partial<ScreenerRuleUI> & { label: string }> = [
  {
    label: "Experience (years)",
    category: "experience",
    kind: "number",
    question: "How many years of relevant experience do you have?",
    unit: "years",
    min: "0",
    qualifying: true,
    qualifyWhen: "gte",
    qualifyValue: "2",
  },
  {
    label: "Language proficiency",
    category: "language",
    kind: "select",
    question: "What is your proficiency level in the required language?",
    options: "A1,A2,B1,B2,C1,C2",
    idealAnswer: "B2",
    qualifying: true,
    qualifyWhen: "in",
    qualifyValue: "B2,C1,C2",
  },
  {
    label: "Monthly salary (expected)",
    category: "monthly-salary",
    kind: "currency",
    question: "What is your expected monthly salary?",
    currency: "NGN",
    qualifying: true,
    qualifyWhen: "lte",
    qualifyValue: "",
  },
  {
    label: "Notice period (weeks)",
    category: "notice-period",
    kind: "number",
    question: "What is your notice period (weeks)?",
    unit: "weeks",
    qualifying: true,
    qualifyWhen: "lte",
    qualifyValue: "4",
  },
  {
    label: "Hourly rate",
    category: "hourly-rate",
    kind: "currency",
    question: "What is your expected hourly rate?",
    currency: "USD",
    qualifying: false,
  },
  {
    label: "Custom question",
    category: "custom",
    kind: "text",
    question: "Add your custom question…",
    qualifying: false,
  },
];

export default function AdminStartForm() {
  // ---- All local state/effects/hooks live here (no early return above) ----
  const [tab, setTab] = useState<Tab>("job");

  // Job Info
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [roleName, setRoleName] = useState("");
  const [jdText, setJdText] = useState("");
  const [aiJD, setAiJD] = useState("");
  const [useAIJD, setUseAIJD] = useState(false);

  // Interview Info
  const [langs, setLangs] = useState<string[]>(["en"]);
  const [focus, setFocus] = useState("");
  const [focusList, setFocusList] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [screenerQuestions, setScreenerQuestions] = useState<string[]>([""]); // legacy (kept)
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // After creation
  const [jobCreated, setJobCreated] = useState<any>(null);

  // Candidates tabs
  const [applied, setApplied] = useState<any[]>([]);
  const [vetted, setVetted] = useState<any[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  // Invite
  const [inviteEmails, setInviteEmails] = useState<string[]>([""]);
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<string | null>(null);

  // NEW: interviewOnApply
  const [interviewOnApply, setInterviewOnApply] = useState(false);

  // New fields
  const [location, setLocation] = useState<"remote" | "hybrid" | "onsite">(
    "remote"
  );
  const [locationDetails, setLocationDetails] = useState("");
  const [employmentType, setEmploymentType] = useState("full-time");
  const [seniority, setSeniority] = useState("mid");
  const [commImportance, setCommImportance] = useState(3);
  const [startDate, setStartDate] = useState("");

  // 💰 Salary + Hours
  const [salaryCurrency, setSalaryCurrency] = useState<
    "NGN" | "USD" | "CAD" | "EUR" | "GBP"
  >("NGN");
  const [monthlySalaryMin, setMonthlySalaryMin] = useState<string>("");
  const [monthlySalaryMax, setMonthlySalaryMax] = useState<string>("");
  const [hoursPerWeek, setHoursPerWeek] = useState<string>("");

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const [interviewType, setInterviewType] = useState<InterviewType | null>(
    null
  );

  // NEW: structured screeners UI
  const [screenerRulesUI, setScreenerRulesUI] = useState<ScreenerRuleUI[]>([
    {
      label: PRESETS[0].label!,
      question: PRESETS[0].question!,
      category: "experience",
      kind: "number",
      unit: "years",
      min: "0",
      qualifying: true,
      qualifyWhen: "gte",
      qualifyValue: "2",
      options: "",
      idealAnswer: "",
      currency: undefined,
    } as ScreenerRuleUI,
  ] as any);

  const [published, setPublished] = useState(true);

  // Validation helpers
  const jdContent = (useAIJD ? aiJD : jdText).trim();
  const jdChars = jdContent.length;

  function addPreset(preset: (typeof PRESETS)[number]) {
    setScreenerRulesUI((prev) => [
      ...prev,
      {
        question: preset.question || "",
        category: (preset.category as ScreenerCategory) || "custom",
        kind: (preset.kind as ScreenerKind) || "text",
        min: preset.min ?? "",
        max: preset.max ?? "",
        options: preset.options ?? "",
        idealAnswer: (preset.idealAnswer as string) ?? "",
        qualifying: !!preset.qualifying,
        qualifyWhen: preset.qualifyWhen,
        qualifyValue: (preset.qualifyValue as string) ?? "",
        currency: preset.currency as any,
        unit: preset.unit,
      } as ScreenerRuleUI,
    ]);
  }

  function addScreenerRule() {
    addPreset(PRESETS.find((p) => p.category === "custom")!);
  }
  function removeScreenerRule(idx: number) {
    setScreenerRulesUI((prev) => prev.filter((_, i) => i !== idx));
  }
  function updateScreenerRule(idx: number, patch: Partial<ScreenerRuleUI>) {
    setScreenerRulesUI((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, ...patch } : r))
    );
  }

  function toggleLang(code: string) {
    setLangs((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }
  function addFocus() {
    const t = focus.trim();
    if (!t) return;
    setFocusList((x) => Array.from(new Set([...x, t])));
    setFocus("");
  }
  function addScreener() {
    setScreenerQuestions((prev) => [...prev, ""]);
  }
  function removeScreener(idx: number) {
    setScreenerQuestions((prev) => prev.filter((_, i) => i !== idx));
  }
  function updateScreener(idx: number, val: string) {
    setScreenerQuestions((prev) => prev.map((q, i) => (i === idx ? val : q)));
  }
  function addSkill() {
    const t = skillInput.trim();
    if (!t) return;
    setSkills((prev) => Array.from(new Set([...prev, t])));
    setSkillInput("");
  }
  function removeSkill(s: string) {
    setSkills((prev) => prev.filter((x) => x !== s));
  }

  async function generateAIJD() {
    setBusy(true);
    setErr(null);
    try {
      const prompt = {
        title,
        company,
        roleName,
        location,
        locationDetails,
        employmentType,
        seniority,
        commImportance,
        startDate,
        skills,
        salaryCurrency,
        monthlySalaryMin,
        monthlySalaryMax,
        hoursPerWeek,
      };
      const res = await fetch("/api/zuri/jobs/ai-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prompt),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) throw new Error(j.error || "AI JD failed");
      setAiJD(j.jdText || "");
      setUseAIJD(true);
    } catch (e: any) {
      setErr(e.message || "AI JD error");
    } finally {
      setBusy(false);
    }
  }

  function packScreenerRules() {
    return screenerRulesUI.map((r) => {
      const toNum = (v?: string) =>
        v !== undefined && v !== "" && !Number.isNaN(Number(v))
          ? Number(v)
          : undefined;

      // qualifyValue can be CSV for "in"/"nin"
      let qualifyValue: any = r.qualifyValue;
      if (
        (r.qualifyWhen === "in" || r.qualifyWhen === "nin") &&
        typeof qualifyValue === "string"
      ) {
        qualifyValue = qualifyValue
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean);
      }

      // options CSV → array
      const options = r.options
        ? r.options
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean)
        : undefined;

      // idealAnswer try-number
      let ideal: any = r.idealAnswer;
      if (
        typeof ideal === "string" &&
        ideal !== "" &&
        !Number.isNaN(Number(ideal))
      ) {
        ideal = Number(ideal);
      }

      return {
        question: r.question.trim(),
        kind: r.kind,
        category: r.category,
        min: toNum(r.min),
        max: toNum(r.max),
        options,
        idealAnswer: ideal,
        qualifying: !!r.qualifying,
        qualifyWhen: r.qualifyWhen,
        qualifyValue: qualifyValue === "" ? undefined : qualifyValue,
        currency: r.currency,
        unit: r.unit,
      };
    });
  }

  async function createJob(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const screenerRules = packScreenerRules();
      const res = await fetch("/api/zuri/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          company,
          roleName,
          jdText: useAIJD ? aiJD : jdText,
          languages: langs,
          focusAreas: focusList,
          adminFocusNotes: notes,

          // legacy strings:
          screenerQuestions: screenerQuestions.filter((q) => q.trim()),

          // structured rules:
          screenerRules,

          location,
          locationDetails,
          employmentType,
          seniority,
          commImportance,
          startDate,
          skills,

          // NEW interview types
          interviewType,

          // compensation
          salaryCurrency,
          monthlySalaryMin: monthlySalaryMin
            ? Number(monthlySalaryMin)
            : undefined,
          monthlySalaryMax: monthlySalaryMax
            ? Number(monthlySalaryMax)
            : undefined,
          hoursPerWeek: hoursPerWeek ? Number(hoursPerWeek) : undefined,

          // NEW: interviewOnApply
          interviewOnApply,
          published,
        }),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) throw new Error(j.error || "Failed to create job");
      setJobCreated(j);
      setTab("candidates");
    } catch (e: any) {
      setErr(e.message || "Error");
    } finally {
      setBusy(false);
    }
  }

  // Fetch applied/vetted candidates after job creation
  useEffect(() => {
    async function fetchCandidates() {
      if (!jobCreated?.code) return;
      setLoadingCandidates(true);
      try {
        const res = await fetch(`/api/admin/jobs/${jobCreated.code}/sessions`);
        const j = await res.json();
        if (res.ok && j.ok) {
          setApplied(j.sessions.filter((s: any) => s.status !== "finished"));
          setVetted(j.sessions.filter((s: any) => s.status === "finished"));
        }
      } finally {
        setLoadingCandidates(false);
      }
    }
    if (tab === "candidates" && jobCreated?.code) fetchCandidates();
  }, [tab, jobCreated?.code]);

  async function sendInvites() {
    setInviteBusy(true);
    setInviteMsg(null);
    try {
      const res = await fetch("/api/email/invite-multi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobCode: jobCreated.code,
          emails: inviteEmails.filter((e) => e.trim()),
        }),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) throw new Error(j.error || "Invite failed");
      setInviteMsg("Invites sent!");
    } catch (e: any) {
      setInviteMsg(e.message || "Invite error");
    } finally {
      setInviteBusy(false);
    }
  }

  const jobInfoValid =
    title.trim().length > 0 && roleName.trim().length > 0 && jdChars >= 120;

  const screenersValid =
    screenerRulesUI.length > 0 &&
    screenerRulesUI.every((r) => r.question.trim().length > 0);

  const interviewInfoValid =
    langs.length > 0 && !!interviewType && screenersValid;

  function cap(s: string) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  }

  function fmtMoney(v?: string) {
    if (!v) return "";
    return Number(v).toLocaleString();
  }

  // ---- UI ----
  return (
    <div className="relative min-h-[80vh] overflow-hidden">
      {/* Premium background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(60rem 60rem at 10% 10%, rgba(59,130,246,0.12), transparent 45%)," +
            "radial-gradient(50rem 50rem at 90% 30%, rgba(16,185,129,0.12), transparent 45%)," +
            "radial-gradient(40rem 40rem at 50% 120%, rgba(99,102,241,0.12), transparent 45%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.25] dark:opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(127,127,127,0.15) 1px, transparent 1px)," +
            "linear-gradient(to bottom, rgba(127,127,127,0.15) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(80rem 80rem at 50% 35%, rgba(0,0,0,1), rgba(0,0,0,0.05))",
          WebkitMaskImage:
            "radial-gradient(80rem 80rem at 50% 35%, rgba(0,0,0,1), rgba(0,0,0,0.05))",
        }}
      />
      <div aria-hidden className="bg-grain absolute inset-0" />

      <div className="relative mx-auto flex min-h-[80vh] w-full max-w-5xl flex-col px-4 py-12 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          <button
            className={`rounded-full px-3 py-1 border cursor-pointer ${
              tab === "job" ? "bg-black text-white" : "bg-white text-gray-900"
            }`}
            disabled={tab !== "job"}
          >
            Job Info
          </button>
          <button
            className={`rounded-full px-3 py-1 border cursor-pointer ${
              tab === "interview"
                ? "bg-black text-white"
                : "bg-white text-gray-900"
            }`}
            disabled={tab !== "interview"}
          >
            Interview Info
          </button>
          <button
            onClick={() => setTab("candidates")}
            className={`rounded-full px-3 py-1 border cursor-pointer ${
              tab === "candidates"
                ? "bg-black text-white"
                : "bg-white text-gray-900"
            }`}
            disabled={!jobCreated}
          >
            Candidates
          </button>
          <button
            onClick={() => setTab("invite")}
            className={`rounded-full px-3 py-1 border cursor-pointer ${
              tab === "invite"
                ? "bg-black text-white"
                : "bg-white text-gray-900"
            }`}
            disabled={!jobCreated}
          >
            Invite
          </button>
        </div>

        {/* Badges */}
        <div className="mb-8 flex flex-wrap justify-center gap-2 sm:gap-3">
          <Pill>Audit-ready configs</Pill>
          <Pill>Multilingual</Pill>
          <Pill>Shareable invites</Pill>
        </div>

        {/* Card */}
        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-black/10 bg-white/70 p-8 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-white/10">
          {/* Job Info tab */}
          {tab === "job" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (jobInfoValid) setTab("interview");
              }}
              className="grid gap-4"
            >
              {/* Job Title and Role Name */}
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Job Title{" "}
                    <span className="ml-1 text-xs text-gray-500">ⓘ</span>
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Project Manager"
                    className="rounded-xl border p-3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Role Name{" "}
                    <span className="ml-1 text-xs text-gray-500">ⓘ</span>
                  </label>
                  <input
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="e.g., Project Management"
                    className="rounded-xl border p-3"
                    required
                  />
                </div>
              </div>

              {/* Company */}
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company"
                className="rounded-xl border p-3"
              />

              {/* Location */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Job Location
                </label>
                <div className="relative">
                  <select
                    value={location}
                    onChange={(e) =>
                      setLocation(
                        e.target.value as "remote" | "hybrid" | "onsite"
                      )
                    }
                    className="w-full appearance-none rounded-xl border p-3 bg-white text-gray-900 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    aria-label="Select job location"
                  >
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">Onsite</option>
                  </select>
                  <svg
                    aria-hidden
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
                <input
                  value={locationDetails}
                  onChange={(e) => setLocationDetails(e.target.value)}
                  placeholder='Location details (e.g., "Canada", "Worldwide")'
                  className="mt-2 rounded-xl border p-3"
                />
                <div className="mt-1 text-xs text-gray-500">
                  Specify a country, region, or "Worldwide" for
                  remote/hybrid/onsite jobs.
                </div>
              </div>

              {/* Employment Type */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Employment Type
                </label>
                <div className="flex gap-2">
                  {["full-time", "part-time"].map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setEmploymentType(opt)}
                      className={`rounded-full border px-3 py-1 text-sm cursor-pointer ${
                        employmentType === opt
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-gray-900 border-white/20 hover:bg-gray-100"
                      }`}
                    >
                      {opt
                        .replace("-", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seniority */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Seniority Level
                </label>
                <select
                  value={seniority}
                  onChange={(e) => setSeniority(e.target.value)}
                  className="rounded-xl border p-3 bg-white text-gray-900"
                  style={{ backgroundColor: "#fff", color: "#171717" }}
                >
                  <option value="junior">Junior</option>
                  <option value="mid">Mid</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                </select>
              </div>

              {/* Communication importance */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  How much do you care about client communication?
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={commImportance}
                  onChange={(e) => setCommImportance(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {
                    ["Not important", "Low", "Medium", "High", "Critical"][
                      commImportance - 1
                    ]
                  }
                </div>
              </div>

              {/* Desired Start Date */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Desired Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-xl border p-3"
                />
              </div>

              {/* 💰 Salary + Hours */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ideal Monthly Salary Range (optional)
                </label>
                <div className="grid gap-2 sm:grid-cols-[140px_1fr_1fr]">
                  <select
                    value={salaryCurrency}
                    onChange={(e) =>
                      setSalaryCurrency(
                        e.target.value as "NGN" | "USD" | "CAD" | "EUR" | "GBP"
                      )
                    }
                    className="rounded-xl border p-3 bg-white text-gray-900"
                    aria-label="Salary currency"
                  >
                    <option value="NGN">NGN (₦)</option>
                    <option value="USD">USD ($)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={monthlySalaryMin}
                    onChange={(e) => setMonthlySalaryMin(e.target.value)}
                    placeholder="Min e.g., 300000"
                    className="rounded-xl border p-3"
                    aria-label="Minimum monthly salary"
                  />
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={monthlySalaryMax}
                    onChange={(e) => setMonthlySalaryMax(e.target.value)}
                    placeholder="Max e.g., 600000"
                    className="rounded-xl border p-3"
                    aria-label="Maximum monthly salary"
                  />
                </div>
                <div className="mt-2">
                  <label className="block text-sm font-medium mb-1">
                    Hours for this position (per week, optional)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={80}
                    inputMode="numeric"
                    value={hoursPerWeek}
                    onChange={(e) => setHoursPerWeek(e.target.value)}
                    placeholder="e.g., 40"
                    className="rounded-xl border p-3 w-full sm:w-56"
                    aria-label="Hours per week"
                  />
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Skills Required
                </label>
                <div className="flex gap-2">
                  <input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="e.g., SQL, empathy, Zendesk"
                    className="flex-1 rounded-lg border p-2"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="rounded-lg border px-3 cursor-pointer py-1 text-sm hover:bg-gray-50"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border bg-white px-3 py-1 text-xs text-gray-700"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => removeSkill(s)}
                        className="ml-2 text-xs text-red-600"
                        aria-label="Remove skill"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Meta preview chips */}
              <div className="mb-2 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border px-2.5 py-1 bg-white/20">
                  {location.charAt(0).toUpperCase() + location.slice(1)}
                  {locationDetails ? ` • ${locationDetails}` : ""}
                </span>
                <span className="rounded-full border px-2.5 py-1 bg-white/20">
                  {employmentType.replace("-", " ")}
                </span>
                <span className="rounded-full border px-2.5 py-1 bg-white/20">
                  {cap(seniority)}
                </span>
                {!!hoursPerWeek && (
                  <span className="rounded-full border px-2.5 py-1 bg-white/20">
                    {hoursPerWeek} hrs/week
                  </span>
                )}
                {(monthlySalaryMin || monthlySalaryMax) && (
                  <span className="rounded-full border px-2.5 py-1 bg-white/20">
                    {salaryCurrency} {fmtMoney(monthlySalaryMin)}
                    {monthlySalaryMax
                      ? ` – ${fmtMoney(monthlySalaryMax)}`
                      : ""}{" "}
                    /mo
                  </span>
                )}
                {!!skills.length && (
                  <span className="rounded-full border px-2.5 py-1 bg-white/20">
                    Skills: {skills.slice(0, 3).join(", ")}
                    {skills.length > 3 ? " +" + (skills.length - 3) : ""}
                  </span>
                )}
              </div>

              {/* Page-wide overlay when generating */}
              <LoaderOverlay show={busy} />

              {/* JD */}
              <div>
                <div className="mb-1 text-sm font-medium">
                  Job Description (JD)
                </div>

                {busy ? (
                  <JDStreamingLoader />
                ) : (
                  <textarea
                    value={useAIJD ? aiJD : jdText}
                    onChange={(e) => {
                      if (useAIJD) setAiJD(e.target.value);
                      else setJdText(e.target.value);
                    }}
                    placeholder="Paste a JD here, or click Generate AI JD to start from a prompt…"
                    className="rounded-xl border p-3 h[360px] min-h-[320px] w-full overflow-auto leading-6 font-mono text-[13px]"
                    style={{ scrollBehavior: "smooth" }}
                    required={!useAIJD}
                  />
                )}

                {/* Length helper */}
                {!busy && (
                  <div className="mt-1 text-xs text-gray-500">
                    {(useAIJD ? (aiJD || "").length : (jdText || "").length) <
                    120 ? (
                      <>
                        JD length: {useAIJD ? aiJD.length : jdText.length}/120 —
                        add {120 - (useAIJD ? aiJD.length : jdText.length)} more
                        characters to continue.
                      </>
                    ) : (
                      <>
                        JD length: {useAIJD ? aiJD.length : jdText.length}/120 ✓
                      </>
                    )}
                  </div>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={generateAIJD}
                    disabled={busy || !title || !roleName}
                    className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {busy ? "Generating…" : "Generate AI JD"}
                  </button>

                  {aiJD && !busy && (
                    <>
                      <button
                        type="button"
                        onClick={() => setUseAIJD(true)}
                        className={`rounded-lg px-3 py-1 text-sm border cursor-pointer ${
                          useAIJD
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        Use AI JD
                      </button>
                      <button
                        type="button"
                        onClick={() => setUseAIJD(false)}
                        className={`rounded-lg px-3 py-1 text-sm border cursor-pointer ${
                          !useAIJD
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        Use Manual JD
                      </button>
                      <span className="text-xs text-gray-500">
                        You can edit the text directly either way.
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Next */}
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    type="submit"
                    onClick={(e) => {
                      if (!jobInfoValid) {
                        e.preventDefault();
                        setErr(
                          "Please fill out all required fields and ensure your Job Description has at least 120 characters."
                        );
                      } else {
                        setErr(null);
                      }
                    }}
                    className={`rounded-xl px-4 py-3 font-medium text-white transition 
                      ${
                        jobInfoValid
                          ? "bg-black hover:opacity-90 cursor-pointer"
                          : "bg-gray-600 text-gray-500 cursor-not-allowed"
                      }`}
                    disabled={!jobInfoValid}
                  >
                    Next: Interview Info
                  </button>
                </div>
                {!jobInfoValid && err && (
                  <p className="text-xs text-red-600 mt-1">{err}</p>
                )}
              </div>
            </form>
          )}

          {/* Interview Info tab */}
          {tab === "interview" && (
            <form onSubmit={createJob} className="grid gap-8">
              {/* Interview Type */}
              <section>
                <div className="mb-2 text-sm font-semibold">Interview Type</div>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      {
                        k: "standard",
                        label: "Standard",
                        tip: "Live-style Q&A flow.",
                      },
                      {
                        k: "resume-based",
                        label: "Resume-based",
                        tip: "Questions derived from CV/resume.",
                      },
                      {
                        k: "human-data",
                        label: "Human Data",
                        tip: "Zuri records; humans annotate with rubrics.",
                      },
                      {
                        k: "software",
                        label: "Software Engineer",
                        tip: "Tech interview (auto Q&A + scoring).",
                      },
                    ] as const
                  ).map((opt) => {
                    const selected = interviewType === opt.k;
                    return (
                      <button
                        key={opt.k}
                        type="button"
                        title={opt.tip}
                        onClick={() => setInterviewType(opt.k as InterviewType)}
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-sm transition cursor-pointer
                          ${
                            selected
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                              : "bg-neutral-50 text-neutral-900 border-neutral-200 hover:bg-neutral-100"
                          }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                {!interviewType && (
                  <p className="mt-1 text-xs text-red-600">
                    Select an interview type.
                  </p>
                )}
              </section>

              {/* Language (single-select) */}
              <section>
                <div className="mb-2 text-sm font-semibold">
                  Interview language
                </div>
                <SingleLanguageSelect
                  groups={LANG_GROUPS}
                  value={langs[0] || ""}
                  onChange={(val) => setLangs(val ? [val] : [])}
                />
                <p className="mt-2 text-xs text-neutral-300">
                  Choose the language for this AI interview. You can create
                  another job if you need a different language.
                </p>
              </section>

              {/* Focus areas */}
              <section className="grid gap-2">
                <div className="text-sm font-semibold">Focus areas</div>
                <div className="flex gap-2">
                  <input
                    value={focus}
                    onChange={(e) => setFocus(e.target.value)}
                    placeholder="e.g., De-escalation, SQL basics"
                    className="flex-1 rounded-xl border border-neutral-200 bg-white p-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const t = focus.trim();
                      if (!t) return;
                      setFocusList((x) => Array.from(new Set([...x, t])));
                      setFocus("");
                    }}
                    className="rounded-xl border border-neutral-200 bg-neutral-400 px-3 py-2 text-sm hover:bg-neutral-300 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                {!!focusList.length && (
                  <div className="mt-1 flex flex-wrap gap-2">
                    {focusList.map((f) => (
                      <span
                        key={f}
                        className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-800"
                      >
                        {f}
                        <button
                          type="button"
                          className="text-red-600"
                          onClick={() =>
                            setFocusList((s) => s.filter((x) => x !== f))
                          }
                          aria-label={`Remove ${f}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </section>

              {/* Notes */}
              <section>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes to interviewers (optional)"
                  className="min-h-[64px] w-full rounded-xl border border-neutral-200 bg-white p-3 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </section>

              {/* Screeners */}
              <section>
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-semibold">
                    Screener Questions
                  </div>
                  <div className="flex items-center gap-2">
                    <FancySelect
                      placeholder="+ Add preset…"
                      options={PRESETS.map((p) => ({
                        label: p.label,
                        value: p.label,
                      }))}
                      onChange={(val) => {
                        const p = PRESETS.find((x) => x.label === val);
                        if (!p) return;
                        setScreenerRulesUI((prev) => [
                          ...prev,
                          {
                            question: p.question || "",
                            category: (p.category as any) || "custom",
                            kind: (p.kind as any) || "text",
                            min: p.min ?? "",
                            max: p.max ?? "",
                            options: p.options ?? "",
                            idealAnswer: (p.idealAnswer as any) ?? "",
                            qualifying: !!p.qualifying,
                            qualifyWhen: p.qualifyWhen as any,
                            qualifyValue: (p.qualifyValue as any) ?? "",
                            currency: p.currency as any,
                            unit: p.unit,
                          },
                        ]);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setScreenerRulesUI((prev) => [
                          ...prev,
                          {
                            question: "Custom question",
                            category: "custom",
                            kind: "text",
                            qualifying: false,
                          } as any,
                        ])
                      }
                      className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 bg-neutral-400 px-4 py-2 text-sm text-black hover:bg-neutral-300 cursor-pointer"
                    >
                      <span className="text-lg font-semibold leading-none">
                        +
                      </span>
                      <span>Custom</span>
                    </button>
                  </div>
                </div>

                <div className="grid gap-3">
                  {screenerRulesUI.map((r, idx) => (
                    <ScreenerItem
                      key={idx}
                      value={r}
                      onChange={(patch) =>
                        setScreenerRulesUI((prev) =>
                          prev.map((x, i) =>
                            i === idx ? { ...x, ...patch } : x
                          )
                        )
                      }
                      onDelete={() =>
                        setScreenerRulesUI((prev) =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                    />
                  ))}
                </div>

                {!screenersValid && (
                  <p className="mt-2 text-xs text-red-600">
                    Each screener needs a question.
                  </p>
                )}
                <p className="mt-2 text-xs text-neutral-600">
                  Candidates answer these while applying. If a qualifying rule
                  fails, you can auto-flag or disqualify them.
                </p>
              </section>

              {/* Actions */}
              {err && <div className="text-red-600">{err}</div>}
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setTab("job")}
                  className="rounded-xl border border-neutral-200 bg-white px-4 py-3 font-medium text-neutral-800 hover:bg-neutral-50 cursor-pointer"
                >
                  ← Back to Job Info
                </button>
                <button
                  type="submit"
                  disabled={!interviewInfoValid || busy}
                  className="rounded-xl bg-black px-4 py-3 font-medium text-white hover:opacity-90 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                >
                  {busy ? "Creating…" : "Create & Continue"}
                </button>
              </div>
            </form>
          )}

          {/* Candidates tab */}
          {tab === "candidates" && jobCreated && (
            <div>
              <h2 className="text-lg font-bold mb-2">Candidates</h2>
              <div className="mb-4 flex gap-2">
                <button
                  onClick={() => setTab("candidates")}
                  className="rounded-full border px-3 py-1 text-sm bg-emerald-600 text-white cur"
                >
                  Applied
                </button>
                <button
                  onClick={() => setTab("candidates")}
                  className="rounded-full border px-3 py-1 text-sm bg-black text-white cursor-pointer"
                >
                  Vetted
                </button>
              </div>
              {loadingCandidates ? (
                <div className="text-gray-500">Loading candidates…</div>
              ) : (
                <>
                  <div className="mb-4">
                    <div className="font-semibold cursor-pointer">
                      Applied Candidates
                    </div>
                    <div className="grid gap-2 mt-2">
                      {applied.length === 0 && (
                        <div className="text-xs text-gray-500">
                          No applied candidates yet.
                        </div>
                      )}
                      {applied.map((c) => (
                        <div
                          key={c.id}
                          className="rounded-lg border p-2 flex flex-col gap-1"
                        >
                          <div className="font-medium">{c.candidate.name}</div>
                          <div className="text-xs text-gray-600">
                            {c.candidate.email}
                          </div>
                          <div className="text-xs text-gray-500">
                            Status: {c.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">Vetted Candidates</div>
                    <div className="grid gap-2 mt-2">
                      {vetted.length === 0 && (
                        <div className="text-xs text-gray-500">
                          No vetted candidates yet.
                        </div>
                      )}
                      {vetted.map((c) => (
                        <div
                          key={c.id}
                          className="rounded-lg border p-2 flex flex-col gap-1 bg-emerald-50"
                        >
                          <div className="font-medium">{c.candidate.name}</div>
                          <div className="text-xs text-gray-600">
                            {c.candidate.email}
                          </div>
                          <div className="text-xs text-gray-500">
                            Score: {c.score ?? "—"}
                          </div>
                          <div className="text-xs text-gray-500">
                            Finished:{" "}
                            {c.finishedAt
                              ? new Date(c.finishedAt).toLocaleString()
                              : "—"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              <div className="mt-4">
                <Link
                  href={`/jobs/apply?code=${jobCreated.code}`}
                  className="text-sm text-gray-600 hover:underline"
                >
                  Public job link for candidates to apply
                </Link>
              </div>

              {/* Recommended */}
              <div className="mt-8">
                <div className="font-semibold mb-1">
                  Recommended (Eumani Certified) Candidates
                  <span className="ml-2 text-xs text-emerald-600 font-normal">
                    (coming soon)
                  </span>
                </div>
                <div className="rounded-lg border border-dashed p-4 text-xs text-gray-500 bg-gray-50">
                  This section will show recommended candidates certified by
                  Euman AI based on advanced vetting and skills matching.
                </div>
              </div>
            </div>
          )}

          {/* Invite tab */}
          {tab === "invite" && jobCreated && (
            <div>
              <h2 className="text-lg font-bold mb-2">Invite Candidates</h2>
              <p className="mb-2 text-gray-600">
                Share this job link or invite candidates by email.
              </p>
              <div className="mb-4">
                <div className="font-mono text-xs bg-gray-500 rounded p-2">
                  Job link:{" "}
                  <a
                    href={`/jobs/apply?code=${jobCreated.code}`}
                    target="_blank"
                    rel="noopener"
                  >{`${
                    typeof window !== "undefined" ? window.location.origin : ""
                  }/jobs/apply?code=${jobCreated.code}`}</a>
                </div>
              </div>
              <div className="mb-4">
                <div className="font-semibold text-sm mb-2">
                  Invite by email
                </div>
                {inviteEmails.map((email, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      value={email}
                      onChange={(e) => {
                        const arr = [...inviteEmails];
                        arr[idx] = e.target.value;
                        setInviteEmails(arr);
                      }}
                      placeholder="candidate@email.com"
                      className="flex-1 rounded-lg border p-2"
                      type="email"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setInviteEmails(
                          inviteEmails.filter((_, i) => i !== idx)
                        )
                      }
                      className="rounded-lg border px-2 text-xs text-red-600"
                      disabled={inviteEmails.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setInviteEmails([...inviteEmails, ""])}
                  className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
                >
                  + Add candidate
                </button>
                <button
                  type="button"
                  onClick={sendInvites}
                  disabled={inviteBusy}
                  className="mt-3 rounded-xl bg-black px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-60"
                >
                  {inviteBusy ? "Sending…" : "Send Invites"}
                </button>
                {inviteMsg && (
                  <div className="mt-2 text-emerald-700">{inviteMsg}</div>
                )}
              </div>
              <div className="mt-4">
                <Link
                  href="/admin/jobs"
                  className="text-sm text-gray-600 hover:underline"
                >
                  Back to Jobs
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ========================= Helpers & subcomponents ========================= */

function LoaderOverlay({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div
      className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px] flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label="Generating job description"
    >
      <div className="flex flex-col items-center gap-3">
        <svg className="h-8 w-8 animate-spin text-white/90" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-90"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z"
          />
        </svg>
        <div className="text-white/90 text-sm">
          Crafting an AI job description…
        </div>
      </div>
    </div>
  );
}

function JDStreamingLoader() {
  return (
    <div className="relative h-[360px] min-h-[320px] w-full overflow-hidden rounded-xl border p-0">
      <div className="absolute inset-0 overflow-auto font-mono text-[13px] leading-6 px-3 py-3">
        <div className="space-y-2">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className="h-4 rounded-[3px] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-white/10 dark:via-white/5 dark:to-white/10"
              style={{
                animation: `shimmer 1.6s ${i * 0.08}s linear infinite`,
                width:
                  i % 5 === 0
                    ? "92%"
                    : i % 4 === 0
                    ? "85%"
                    : i % 3 === 0
                    ? "78%"
                    : i % 2 === 0
                    ? "96%"
                    : "88%",
              }}
            />
          ))}
        </div>
        <div className="mt-3 h-4 w-2 bg-gray-400 dark:bg الأبيض/50 animate-pulse" />
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -400px 0;
          }
          100% {
            background-position: 400px 0;
          }
        }
        div[style*="shimmer"] {
          background-size: 800px 100%;
        }
      `}</style>
    </div>
  );
}

function FancySelect({
  placeholder,
  value,
  options,
  onChange,
  showChevron = true,
}: {
  placeholder?: string;
  value?: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  showChevron?: boolean;
}) {
  return (
    <div className="relative inline-block w-full">
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-neutral-300 bg-white px-3 py-2 pr-9 text-sm text-neutral-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
        aria-haspopup="listbox"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {showChevron && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
      )}
    </div>
  );
}

function ScreenerItem({
  value,
  onChange,
  onDelete,
}: {
  value: ScreenerRuleUI;
  onChange: (patch: Partial<ScreenerRuleUI>) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  const header =
    value.question?.trim() ||
    (value.category ? `${value.category} (untitled)` : "Untitled screener");

  return (
    <div className="rounded-xl border border-neutral-200 bg-white">
      {/* Header */}
      <div
        className="flex cursor-pointer items-center justify-between gap-2 px-3 py-2"
        onClick={() => setOpen((s) => !s)}
      >
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-neutral-900">
            {header}
          </div>
          <div className="mt-0.5 text-xs text-neutral-500">
            {value.category ?? "custom"} • {value.kind ?? "text"}
            {value.qualifying ? " • qualifying" : ""}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs text-red-600 hover:bg-neutral-100"
            aria-label="Delete screener"
          >
            Delete
          </button>
          <svg
            className={`h-4 w-4 text-neutral-500 transition ${
              open ? "rotate-180" : ""
            }`}
            viewBox="0 0 24 24"
          >
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Body */}
      {open && (
        <div className="border-t border-neutral-200 px-3 py-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-neutral-600">Category</label>
              <FancySelect
                options={[
                  { label: "Experience (years)", value: "experience" },
                  { label: "Language proficiency", value: "language" },
                  { label: "Monthly salary", value: "monthly-salary" },
                  { label: "Notice period", value: "notice-period" },
                  { label: "Hourly rate", value: "hourly-rate" },
                  { label: "Custom", value: "custom" },
                ]}
                value={value.category}
                onChange={(v) => onChange({ category: v as any })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-neutral-600">Response Type</label>
              <FancySelect
                options={[
                  { label: "Number", value: "number" },
                  { label: "Currency", value: "currency" },
                  { label: "Select", value: "select" },
                  { label: "Yes/No", value: "boolean" },
                  { label: "Text", value: "text" },
                ]}
                value={value.kind}
                onChange={(v) => onChange({ kind: v as any })}
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="text-xs text-neutral-600">Question</label>
            <input
              value={value.question || ""}
              onChange={(e) => onChange({ question: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 bg-white p-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              placeholder="Ask the question candidates must answer"
            />
          </div>

          {value.kind === "select" && (
            <div className="mt-3">
              <label className="text-xs text-neutral-600">
                Options (comma-separated)
              </label>
              <input
                value={value.options || ""}
                onChange={(e) => onChange({ options: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 bg-white p-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                placeholder="e.g., A1, A2, B1, B2, C1, C2"
              />
            </div>
          )}

          {(value.kind === "number" || value.kind === "currency") && (
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs text-neutral-600">Min</label>
                <input
                  value={value.min ?? ""}
                  onChange={(e) => onChange({ min: e.target.value })}
                  inputMode="numeric"
                  className="w-full rounded-xl border border-neutral-200 bg-white p-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-600">Max</label>
                <input
                  value={value.max ?? ""}
                  onChange={(e) => onChange({ max: e.target.value })}
                  inputMode="numeric"
                  className="w-full rounded-xl border border-neutral-200 bg-white p-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  placeholder="100"
                />
              </div>
              {value.kind === "currency" ? (
                <div>
                  <label className="text-xs text-neutral-600">Currency</label>
                  <FancySelect
                    value={value.currency || "NGN"}
                    onChange={(v) => onChange({ currency: v as any })}
                    options={[
                      { label: "NGN (₦)", value: "NGN" },
                      { label: "USD ($)", value: "USD" },
                      { label: "CAD ($)", value: "CAD" },
                      { label: "EUR (€)", value: "EUR" },
                      { label: "GBP (£)", value: "GBP" },
                    ]}
                  />
                </div>
              ) : (
                <div>
                  <label className="text-xs text-neutral-600">Unit</label>
                  <input
                    value={value.unit || ""}
                    onChange={(e) => onChange({ unit: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 bg-white p-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    placeholder="e.g., years, weeks"
                  />
                </div>
              )}
            </div>
          )}

          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
            <div>
              <label className="text-xs text-neutral-600">Ideal Answer</label>
              <input
                value={value.idealAnswer || ""}
                onChange={(e) => onChange({ idealAnswer: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 bg-white p-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                placeholder="e.g., B2 or 3 or Yes"
              />
            </div>
            <label className="mt-6 inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!value.qualifying}
                onChange={(e) => onChange({ qualifying: e.target.checked })}
                className="h-4 w-4 accent-emerald-600"
              />
              <span className="text-sm text-neutral-800">
                Disqualify if condition fails
              </span>
            </label>
          </div>

          {value.qualifying && (
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs text-neutral-600">Operator</label>
                <FancySelect
                  value={value.qualifyWhen || "gte"}
                  onChange={(v) => onChange({ qualifyWhen: v as any })}
                  options={[
                    { label: "Less than", value: "lt" },
                    { label: "≤ Less than or equal", value: "lte" },
                    { label: "Equal", value: "eq" },
                    { label: "≥ Greater than or equal", value: "gte" },
                    { label: "Greater than", value: "gt" },
                    { label: "Not equal", value: "neq" },
                    { label: "In (CSV)", value: "in" },
                    { label: "Not in (CSV)", value: "nin" },
                  ]}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-neutral-600">Value</label>
                <input
                  value={value.qualifyValue || ""}
                  onChange={(e) => onChange({ qualifyValue: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-white p-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  placeholder="e.g., 2  |  B2,C1,C2  |  Yes"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SingleLanguageSelect({
  groups,
  value,
  onChange,
}: {
  groups: { label: string; options: { code: string; label: string }[] }[];
  value: string;
  onChange: (code: string) => void;
}) {
  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-xl border border-neutral-300 bg-white px-3 py-2 pr-9 text-sm text-neutral-900 shadow-sm outline-none ring-0 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
        aria-label="Interview language"
      >
        <option value="">Select language…</option>
        {groups.map((g) => (
          <optgroup key={g.label} label={g.label}>
            {g.options.map((o) => (
              <option key={o.code} value={o.code}>
                {o.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M6 9l6 6 6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
/* eslint-disable @typescript-eslint/no-explicit-any */
