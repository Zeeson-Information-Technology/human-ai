"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import TabsNav, { type Tab } from "./components/TabsNav";
import ErrorBanner from "@/components/ErrorBanner";
import { apiFetch, normalizeError } from "@/lib/api";
import CandidatesPanel from "./components/CandidatesPanel";
import InvitePanel from "./components/InvitePanel";
import JobTab from "./components/JobTabClean";
import InterviewTab from "./components/InterviewTab";

type InterviewType = "standard" | "resume-based" | "human-data" | "software";

export default function AdminStartForm() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("job");

  // Job basics (expanded later)
  const [title, setTitle] = useState("");
  const [roleName, setRoleName] = useState("");
  const [company, setCompany] = useState("");
  const [jdText, setJdText] = useState("");

  // Job details
  const [location, setLocation] = useState<"remote" | "hybrid" | "onsite">(
    "remote"
  );
  const [locationDetails, setLocationDetails] = useState("");
  const [employmentType, setEmploymentType] = useState(
    "full-time"
  );
  const [seniority, setSeniority] = useState("mid");
  const [commImportance, setCommImportance] = useState(3);
  const [startDate, setStartDate] = useState("");

  // Compensation + hours
  const [salaryCurrency, setSalaryCurrency] = useState<
    "NGN" | "USD" | "CAD" | "EUR" | "GBP"
  >("NGN");
  const [monthlySalaryMin, setMonthlySalaryMin] = useState("");
  const [monthlySalaryMax, setMonthlySalaryMax] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("");

  // Skills
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  // Interview basics
  const [interviewType, setInterviewType] = useState<InterviewType | null>(
    null
  );
  const [langs, setLangs] = useState<string[]>(["en"]);

  // Screener rules (user-friendly builder)
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
  const [screenerRulesUI, setScreenerRulesUI] = useState<ScreenerRuleUI[]>([]);

  function addScreenerPreset(cat: ScreenerCategory) {
    const baseQuestion: Record<ScreenerCategory, { q: string; kind: ScreenerKind; unit?: string; currency?: ScreenerRuleUI["currency"]; options?: string } > = {
      "experience": { q: "How many years of relevant experience do you have?", kind: "number", unit: "years" },
      "language": { q: "What is your proficiency level in the required language?", kind: "select", options: "A1,A2,B1,B2,C1,C2" },
      "monthly-salary": { q: "What is your expected monthly salary?", kind: "currency", currency: salaryCurrency },
      "notice-period": { q: "What is your notice period (weeks)?", kind: "number", unit: "weeks" },
      "hourly-rate": { q: "What is your expected hourly rate?", kind: "currency", currency: "USD" },
      "custom": { q: "Write your custom question", kind: "text" },
    };
    const b = baseQuestion[cat];
    setScreenerRulesUI((prev) => [
      ...prev,
      {
        question: b.q,
        category: cat,
        kind: b.kind,
        min: "",
        max: "",
        options: b.options || "",
        idealAnswer: "",
        qualifying: false,
        qualifyWhen: b.kind === "number" || b.kind === "currency" ? "gte" : undefined,
        qualifyValue: "",
        currency: b.currency,
        unit: b.unit,
      },
    ]);
  }
  function updateScreenerRule(idx: number, patch: Partial<ScreenerRuleUI>) {
    setScreenerRulesUI((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }
  function removeScreenerRule(idx: number) {
    setScreenerRulesUI((prev) => prev.filter((_, i) => i !== idx));
  }

  function packScreenerRules() {
    const toNum = (v?: string) => (v !== undefined && v !== "" && !Number.isNaN(Number(v)) ? Number(v) : undefined);
    return screenerRulesUI.map((r) => {
      let qualifyValue: any = r.qualifyValue;
      if ((r.qualifyWhen === "in" || r.qualifyWhen === "nin") && typeof qualifyValue === "string") {
        qualifyValue = qualifyValue.split(",").map((x) => x.trim()).filter(Boolean);
      }
      const options = r.options ? r.options.split(",").map((x) => x.trim()).filter(Boolean) : undefined;
      let ideal: any = r.idealAnswer;
      if (typeof ideal === "string" && ideal !== "" && !Number.isNaN(Number(ideal))) ideal = Number(ideal);
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

  // Candidates view
  const [jobCreated, setJobCreated] = useState<{ code?: string } | null>(null);
  const [applied, setApplied] = useState<any[]>([]);
  const [vetted, setVetted] = useState<any[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [aiBusy, setAiBusy] = useState(false);

  // Invite state
  const [inviteEmails, setInviteEmails] = useState<string[]>([""]);
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<string | null>(null);

  // Derived validations
  const salaryMinNum = Number((monthlySalaryMin || "").trim());
  const salaryMaxNum = Number((monthlySalaryMax || "").trim());
  const salaryValid =
    (monthlySalaryMin || "").trim().length > 0 &&
    (monthlySalaryMax || "").trim().length > 0 &&
    !Number.isNaN(salaryMinNum) &&
    !Number.isNaN(salaryMaxNum) &&
    salaryMinNum <= salaryMaxNum;
  const locDetailsValid = location === "remote" ? true : (locationDetails || "").trim().length > 0;
  const startValid = (startDate || "").trim().length > 0;
  const commValid = Number.isFinite(commImportance) && commImportance >= 1 && commImportance <= 5;
  const hoursValid = (hoursPerWeek || "").trim().length > 0 && !Number.isNaN(Number(hoursPerWeek)) && Number(hoursPerWeek) > 0;
  const skillsValid = skills.length > 0;
  const currencyValid = (salaryCurrency || "").trim().length > 0;
  const jobInfoValid =
    title.trim().length > 0 &&
    roleName.trim().length > 0 &&
    company.trim().length > 0 &&
    jdText.trim().length >= 120 &&
    locDetailsValid &&
    startValid &&
    salaryValid &&
    commValid &&
    hoursValid &&
    skillsValid &&
    currencyValid;
  const interviewInfoValid = langs.length > 0 && !!interviewType;

  // Actions
  async function handleGenerateAIJD() {
    setAiBusy(true);
    setErr(null);
    try {
      const body = {
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
        monthlySalaryMin: monthlySalaryMin || undefined,
        monthlySalaryMax: monthlySalaryMax || undefined,
        hoursPerWeek: hoursPerWeek || undefined,
      };
      const j = await apiFetch<{ ok: boolean; jdText?: string; error?: string }>(
        "/api/zuri/jobs/ai-jd",
        { method: "POST", body, retries: 1 }
      );
      if (!j?.ok) throw new Error(j?.error || "AI JD failed");
      setJdText(String(j.jdText || ""));
    } catch (e: any) {
      const { message } = normalizeError(e);
      setErr(message || "Failed to generate JD");
    } finally {
      setAiBusy(false);
    }
  }

  async function handleCreateJob() {
    setBusy(true);
    setErr(null);
    try {
      const payload: any = {
        title,
        company,
        roleName,
        jdText,
        languages: langs,
        location,
        locationDetails,
        employmentType,
        seniority,
        commImportance,
        startDate,
        skills,
        interviewType: interviewType || undefined,
        salaryCurrency,
        monthlySalaryMin: monthlySalaryMin ? Number(monthlySalaryMin) : undefined,
        monthlySalaryMax: monthlySalaryMax ? Number(monthlySalaryMax) : undefined,
        hoursPerWeek: hoursPerWeek ? Number(hoursPerWeek) : undefined,
        screenerRules: packScreenerRules(),
      };
      const j = await apiFetch<{ ok: boolean; code: string; error?: string }>(
        "/api/zuri/jobs",
        { method: "POST", body: payload, retries: 1 }
      );
      if (!j?.ok) throw new Error(j?.error || "Create failed");
      setJobCreated({ code: j.code });
      setTab("invite");
      // Keep context if the user reloads before inviting
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("code", String(j.code || ""));
        url.searchParams.set("tab", "invite");
        window.history.replaceState({}, "", url.toString());
      } catch {}
    } catch (e: any) {
      const { message } = normalizeError(e);
      setErr(message || "Failed to create job");
    } finally {
      setBusy(false);
    }
  }

  // Hydrate from URL so a manual reload preserves job + tab
  useEffect(() => {
    try {
      const code = searchParams.get("code");
      const t = (searchParams.get("tab") || "").toLowerCase();
      if (code && !jobCreated?.code) setJobCreated({ code });
      if (["job", "interview", "candidates", "invite"].includes(t)) {
        setTab(t as Tab);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function onAddSkill(value?: string) {
    const t = ((value ?? skillInput) || "").trim();
    if (!t) return;
    setSkills((prev) => Array.from(new Set([...prev, t])));
    setSkillInput("");
  }
  function onRemoveSkill(s: string) {
    setSkills((prev) => prev.filter((x) => x !== s));
  }

  // Invite actions
  function onChangeEmail(idx: number, email: string) {
    setInviteEmails((prev) => prev.map((e, i) => (i === idx ? email : e)));
  }
  function onRemoveEmail(idx: number) {
    setInviteEmails((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));
  }
  function onAddEmail() {
    setInviteEmails((prev) => [...prev, ""]);
  }
  async function onSendInvites() {
    if (!jobCreated?.code) return;
    setInviteBusy(true);
    setInviteMsg(null);
    try {
      const j = await apiFetch<{ ok: boolean; sent: number; error?: string }>(
        "/api/email/invite-multi",
        {
          method: "POST",
          body: { jobCode: jobCreated.code, emails: inviteEmails.filter((e) => e.trim()) },
          retries: 1,
        }
      );
      if (!j?.ok) throw new Error(j?.error || "Invite failed");
      setInviteMsg("Invites sent!");
      // Clear the invite inputs after successful send
      setInviteEmails([""]);
    } catch (e: any) {
      const { message } = normalizeError(e);
      setInviteMsg(message || "Invite error");
    } finally {
      setInviteBusy(false);
    }
  }

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

  return (
    <div className="relative min-h-[80vh] overflow-hidden">
      <div aria-hidden className="bg-grain absolute inset-0" />

      <div className="relative mx-auto flex min-h-[80vh] w-full max-w-4xl flex-col px-4 py-10 sm:px-6 lg:px-8">
        <TabsNav tab={tab} setTab={setTab} jobCreated={jobCreated} canGoInterview={jobInfoValid} />

        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-black/10 bg-white/70 p-6 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-white/10">
          {tab === "job" && (
            <JobTab
              title={title}
              setTitle={setTitle}
              roleName={roleName}
              setRoleName={setRoleName}
              company={company}
              setCompany={setCompany}
              jdText={jdText}
              setJdText={setJdText}
              location={location}
              setLocation={setLocation}
              locationDetails={locationDetails}
              setLocationDetails={setLocationDetails}
              employmentType={employmentType}
              setEmploymentType={setEmploymentType}
              seniority={seniority}
              setSeniority={setSeniority}
              commImportance={commImportance}
              setCommImportance={setCommImportance}
              startDate={startDate}
              setStartDate={setStartDate}
              salaryCurrency={salaryCurrency}
              setSalaryCurrency={setSalaryCurrency}
              monthlySalaryMin={monthlySalaryMin}
              setMonthlySalaryMin={setMonthlySalaryMin}
              monthlySalaryMax={monthlySalaryMax}
              setMonthlySalaryMax={setMonthlySalaryMax}
              hoursPerWeek={hoursPerWeek}
              setHoursPerWeek={setHoursPerWeek}
              skills={skills}
              skillInput={skillInput}
              setSkillInput={setSkillInput}
              onAddSkill={onAddSkill}
              onRemoveSkill={onRemoveSkill}
              onGenerateAIJD={handleGenerateAIJD}
              onNext={() => setTab("interview")}
              aiBusy={aiBusy}
              nextDisabled={!jobInfoValid}
            />
          )}

          {tab === "interview" && (
            <InterviewTab
              interviewType={interviewType}
              setInterviewType={setInterviewType}
              langs={langs}
              setLangs={setLangs}
              onCreateJob={handleCreateJob}
              createDisabled={!(jobInfoValid && interviewInfoValid)}
              screeners={screenerRulesUI}
              onAddPreset={addScreenerPreset}
              onChangeRule={updateScreenerRule}
              onRemoveRule={removeScreenerRule}
            />
          )}

          {tab === "candidates" && jobCreated && (
            <CandidatesPanel
              jobCode={jobCreated.code!}
              applied={applied}
              vetted={vetted}
              loading={loadingCandidates}
            />
          )}

          {tab === "invite" && jobCreated && (
            <InvitePanel
              jobCode={jobCreated.code!}
              inviteEmails={inviteEmails}
              onChangeEmail={onChangeEmail}
              onRemoveEmail={onRemoveEmail}
              onAddEmail={onAddEmail}
              onSendInvites={onSendInvites}
              inviteBusy={inviteBusy}
              inviteMsg={inviteMsg}
            />
          )}
        </div>

        {busy && (
          <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px] flex items-center justify-center">
            <div className="text-white/90 text-sm">Working…</div>
          </div>
        )}
        {err && (
          <div className="mt-4">
            <ErrorBanner message={err} onRetry={() => window.location.reload()} onDismiss={() => setErr(null)} />
          </div>
        )}
      </div>
    </div>
  );
}
