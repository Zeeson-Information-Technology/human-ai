"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TabsNav, { type Tab } from "./components/TabsNav";
import BrandLoader from "@/components/brand-loader";
import PremiumToast from "@/components/feedback/PremiumToast";
import { useTimedToast } from "@/components/feedback/useTimedToast";
import { apiFetch, normalizeError } from "@/lib/api";
import JobTab from "./components/JobTabClean";
import type { UploadedFileItem } from "@/components/forms/FileDropUpload";

type ClientOption = {
  id: string;
  name: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
};

export default function AdminStartForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("job");
  const inquiryId = (searchParams.get("inquiry") || "").trim();
  const [prefillLoaded, setPrefillLoaded] = useState(false);
  const prefillClientId = (searchParams.get("clientId") || "").trim();

  // Workspace basics (expanded later)
  const [title, setTitle] = useState("");
  const [roleName, setRoleName] = useState("");
  const [company, setCompany] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [createClientInline, setCreateClientInline] = useState(false);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [jdText, setJdText] = useState("");
  const [clientRepName, setClientRepName] = useState("");
  const [clientRepEmail, setClientRepEmail] = useState("");
  const [buyerOrganization, setBuyerOrganization] = useState("");
  const [solicitationNumber, setSolicitationNumber] = useState("");
  const [opportunitySource, setOpportunitySource] = useState("sales-call");
  const [documentRefs, setDocumentRefs] = useState("");
  const [documents, setDocuments] = useState<UploadedFileItem[]>([]);
  const [submissionDeadline, setSubmissionDeadline] = useState("");
  const [marketFocus, setMarketFocus] = useState("");
  const [sourceText, setSourceText] = useState("");

  // Retained backend fields with safer defaults for proposal work
  const [location, setLocation] = useState<"remote" | "hybrid" | "onsite">(
    "remote"
  );
  const [locationDetails, setLocationDetails] = useState("");
  const [employmentType, setEmploymentType] = useState("contract");
  const [seniority, setSeniority] = useState("mid");
  const [commImportance, setCommImportance] = useState(3);
  const [startDate, setStartDate] = useState("");
  const [salaryCurrency, setSalaryCurrency] = useState<
    "NGN" | "USD" | "CAD" | "EUR" | "GBP"
  >("USD");
  const [monthlySalaryMin, setMonthlySalaryMin] = useState("");
  const [monthlySalaryMax, setMonthlySalaryMax] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("");

  // Skills
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [extractBusy, setExtractBusy] = useState(false);
  const { toast, showToast } = useTimedToast();

  // Derived validations
  const briefValid = jdText.trim().length >= 120;
  const supportTracksValid = skills.length > 0;
  const repValid = clientRepName.trim().length > 0;
  const deadlineValid = submissionDeadline.trim().length > 0;
  const clientValid = (clientId || clientName.trim().length > 0) && clientRepEmail.trim().length > 0;
  const jobInfoValid =
    title.trim().length > 0 &&
    clientValid &&
    roleName.trim().length > 0 &&
    repValid &&
    briefValid &&
    supportTracksValid &&
    deadlineValid;
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
        locationDetails: marketFocus || locationDetails,
        employmentType,
        seniority,
        commImportance,
        startDate: submissionDeadline || startDate,
        skills,
        salaryCurrency,
        monthlySalaryMin: monthlySalaryMin || undefined,
        monthlySalaryMax: monthlySalaryMax || undefined,
        hoursPerWeek: hoursPerWeek || undefined,
      };
      const j = await apiFetch<{ ok: boolean; jdText?: string; error?: string }>(
        "/api/zuri/jobs/ai-jd",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          retries: 1,
        }
      );
      if (!j?.ok) throw new Error(j?.error || "AI brief failed");
      setJdText(String(j.jdText || ""));
    } catch (e: any) {
      const { message } = normalizeError(e);
      setErr(message || "Failed to generate role brief");
      showToast(message || "Failed to generate role brief", "error");
    } finally {
      setAiBusy(false);
    }
  }

  async function handleExtractOpportunity(filesOverride: UploadedFileItem[] = documents) {
    const trimmed = sourceText.trim();
    if (trimmed.length < 80 && filesOverride.length === 0) {
      setErr("Paste RFP text or upload source documents before extracting details.");
      showToast("Paste RFP text or upload source documents before extracting details.", "error");
      return;
    }

    setExtractBusy(true);
    setErr(null);
    try {
      const j = await apiFetch<{
        ok: boolean;
        error?: string;
        extracted?: {
          title?: string;
          buyerOrganization?: string;
          solicitationNumber?: string;
          submissionDeadline?: string;
          marketFocus?: string;
          roleName?: string;
          supportTracks?: string[];
          brief?: string;
        };
      }>("/api/admin/opportunities/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: trimmed,
          documents: filesOverride.map((file) => ({
            name: file.name,
            url: file.url,
            resourceType: file.resourceType,
          })),
        }),
        retries: 1,
      });

      if (!j?.ok || !j.extracted) {
        throw new Error(j?.error || "Could not extract opportunity details");
      }

      const extracted = j.extracted;
      if (extracted.title) setTitle(extracted.title);
      if (extracted.buyerOrganization) setBuyerOrganization(extracted.buyerOrganization);
      if (extracted.solicitationNumber) setSolicitationNumber(extracted.solicitationNumber);
      if (extracted.submissionDeadline) setSubmissionDeadline(extracted.submissionDeadline);
      if (extracted.marketFocus) setMarketFocus(extracted.marketFocus);
      if (extracted.roleName) setRoleName(extracted.roleName);
      if (Array.isArray(extracted.supportTracks) && extracted.supportTracks.length) {
        setSkills((prev) =>
          Array.from(new Set([...prev, ...extracted.supportTracks!.filter(Boolean)]))
        );
      }
      if (extracted.brief) {
        setJdText((prev) => (prev.trim().length >= 120 ? prev : extracted.brief || prev));
      }
      showToast("Opportunity details extracted.", "success");
    } catch (e: any) {
      const { message } = normalizeError(e);
      setErr(message || "Failed to extract opportunity details");
      showToast(message || "Failed to extract opportunity details", "error");
    } finally {
      setExtractBusy(false);
    }
  }

  async function handleCreateJob() {
    setBusy(true);
    setErr(null);
    try {
      const payload: any = {
        title,
        company: clientName || company,
        clientId: clientId || undefined,
        clientName: clientName || company,
        clientContactName: clientRepName || undefined,
        clientContactEmail: clientRepEmail || undefined,
        buyerOrganization: buyerOrganization || undefined,
        solicitationNumber: solicitationNumber || undefined,
        opportunitySource: opportunitySource || undefined,
        submissionDeadline: submissionDeadline || undefined,
        marketFocus: marketFocus || undefined,
        roleName,
        inquiryId: inquiryId || undefined,
        jdText,
        documents,
        languages: ["en"],
        location,
        locationDetails: marketFocus || locationDetails,
        employmentType,
        seniority,
        commImportance,
        startDate: submissionDeadline || startDate,
        skills,
        focusAreas: skills,
        adminFocusNotes: [
          `Client rep: ${clientRepName || "-"}${clientRepEmail ? ` <${clientRepEmail}>` : ""}`,
          `Buyer / issuing authority: ${buyerOrganization || "-"}`,
          `Solicitation number: ${solicitationNumber || "-"}`,
          `Source: ${opportunitySource || "-"}`,
          `Submission deadline: ${submissionDeadline || "-"}`,
          `Market focus: ${marketFocus || "-"}`,
          documentRefs ? `Reference materials:\n${documentRefs}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
        interviewType: "software",
        salaryCurrency,
        monthlySalaryMin: monthlySalaryMin ? Number(monthlySalaryMin) : undefined,
        monthlySalaryMax: monthlySalaryMax ? Number(monthlySalaryMax) : undefined,
        hoursPerWeek: hoursPerWeek ? Number(hoursPerWeek) : undefined,
        screenerRules: [],
      };
      const j = await apiFetch<{ ok: boolean; code: string; error?: string }>(
        "/api/zuri/jobs",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          retries: 1,
        }
      );
      if (!j?.ok) throw new Error(j?.error || "Create failed");
      setTitle("");
      setRoleName("");
      setCompany("");
      setClientId("");
      setClientName("");
      setCreateClientInline(false);
      setJdText("");
      setClientRepName("");
      setClientRepEmail("");
      setBuyerOrganization("");
      setSolicitationNumber("");
      setOpportunitySource("sales-call");
      setDocumentRefs("");
      setDocuments([]);
      setSubmissionDeadline("");
      setMarketFocus("");
      setSourceText("");
      setLocation("remote");
      setLocationDetails("");
      setEmploymentType("contract");
      setSeniority("mid");
      setCommImportance(3);
      setStartDate("");
      setSalaryCurrency("USD");
      setMonthlySalaryMin("");
      setMonthlySalaryMax("");
      setHoursPerWeek("");
      setSkills([]);
      setSkillInput("");
      showToast("Opportunity created.", "success");
      window.setTimeout(() => {
        router.replace(`/admin/opportunities/${encodeURIComponent(String(j.code || ""))}`);
      }, 500);
    } catch (e: any) {
      const { message } = normalizeError(e);
      setErr(message || "Failed to create opportunity");
      showToast(message || "Failed to create opportunity", "error");
    } finally {
      setBusy(false);
    }
  }

  // Hydrate from URL so a manual reload preserves job + tab
  useEffect(() => {
    try {
      const t = (searchParams.get("tab") || "").toLowerCase();
      if (t === "job") {
        setTab("job");
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (prefillClientId) {
      setClientId(prefillClientId);
    }
  }, [prefillClientId]);

  useEffect(() => {
    async function loadInquiryPrefill() {
      if (!inquiryId || prefillLoaded) return;
      if (title || company || roleName || jdText) {
        setPrefillLoaded(true);
        return;
      }

      try {
        const res = await fetch(`/api/admin/inquiries/${inquiryId}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok || !data?.ok || !data?.inquiry) {
          setPrefillLoaded(true);
          return;
        }

        const inquiry = data.inquiry as {
          name: string;
          email: string;
          company: string;
          message: string;
          notes?: string;
        };

        setTitle(
          inquiry.company
            ? `${inquiry.company} opportunity`
            : "Proposal opportunity"
        );
        setClientName(inquiry.company || "");
        setRoleName("Proposal response support");
        setCompany(inquiry.company || "");
        setClientRepName(inquiry.name || "");
        setClientRepEmail(inquiry.email || "");
        setJdText(
          [
            "Inquiry summary",
            `Company: ${inquiry.company || "-"}`,
            `Primary contact: ${inquiry.name || "-"} <${inquiry.email || "-"}>`,
            "",
            "Client message",
            inquiry.message || "-",
            inquiry.notes ? `\nInternal notes\n${inquiry.notes}` : "",
          ]
            .filter(Boolean)
            .join("\n")
        );
        setOpportunitySource("website-inquiry");
      } catch {}

      setPrefillLoaded(true);
    }

    loadInquiryPrefill();
  }, [company, inquiryId, jdText, prefillLoaded, roleName, title]);

  useEffect(() => {
    async function loadClients() {
      try {
        const res = await fetch("/api/admin/clients", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.ok) {
          setClients(data.clients || []);
        }
      } finally {
        setClientsLoading(false);
      }
    }

    loadClients();
  }, []);

  useEffect(() => {
    if (!clientId) return;
    const selected = clients.find((client) => client.id === clientId);
    if (!selected) return;
    setClientName(selected.name || "");
    setCompany(selected.name || "");
    if (!clientRepName && selected.primaryContactName) {
      setClientRepName(selected.primaryContactName);
    }
    if (!clientRepEmail && selected.primaryContactEmail) {
      setClientRepEmail(selected.primaryContactEmail);
    }
  }, [clientId, clientRepEmail, clientRepName, clients]);

  function onAddSkill(value?: string) {
    const t = ((value ?? skillInput) || "").trim();
    if (!t) return;
    setSkills((prev) => Array.from(new Set([...prev, t])));
    setSkillInput("");
  }
  function onRemoveSkill(s: string) {
    setSkills((prev) => prev.filter((x) => x !== s));
  }

  return (
    <div className="relative min-h-[80vh] overflow-hidden">
      {toast && <PremiumToast message={toast.msg} type={toast.type} />}
      {extractBusy && <BrandLoader label="Extracting opportunity details..." />}
      <div aria-hidden className="bg-grain absolute inset-0" />

      <div className="relative mx-auto flex min-h-[80vh] w-full max-w-4xl flex-col px-4 py-10 sm:px-6 lg:px-8">
        <TabsNav tab={tab} setTab={setTab} />

        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-black/10 bg-white/70 p-6 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-white/10">
          {tab === "job" && (
            <JobTab
              title={title}
              setTitle={setTitle}
              roleName={roleName}
              setRoleName={setRoleName}
              company={company}
              setCompany={setCompany}
              clientId={clientId}
              setClientId={setClientId}
              clientName={clientName}
              setClientName={setClientName}
              createClientInline={createClientInline}
              setCreateClientInline={setCreateClientInline}
              clients={clients}
              clientsLoading={clientsLoading}
              clientRepName={clientRepName}
              setClientRepName={setClientRepName}
              clientRepEmail={clientRepEmail}
              setClientRepEmail={setClientRepEmail}
              buyerOrganization={buyerOrganization}
              setBuyerOrganization={setBuyerOrganization}
              solicitationNumber={solicitationNumber}
              setSolicitationNumber={setSolicitationNumber}
              opportunitySource={opportunitySource}
              setOpportunitySource={setOpportunitySource}
              documents={documents}
              setDocuments={setDocuments}
              documentRefs={documentRefs}
              setDocumentRefs={setDocumentRefs}
              submissionDeadline={submissionDeadline}
              setSubmissionDeadline={setSubmissionDeadline}
              marketFocus={marketFocus}
              setMarketFocus={setMarketFocus}
              sourceText={sourceText}
              setSourceText={setSourceText}
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
              onExtractOpportunity={handleExtractOpportunity}
              onGenerateAIJD={handleGenerateAIJD}
              onNext={handleCreateJob}
              aiBusy={aiBusy}
              extractBusy={extractBusy}
              nextDisabled={!jobInfoValid}
            />
          )}
        </div>

        {busy && (
          <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px] flex items-center justify-center">
            <div className="text-white/90 text-sm">Saving opportunity...</div>
          </div>
        )}
      </div>
    </div>
  );
}





