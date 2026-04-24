"use client";

import { useState } from "react";
import PremiumSelect from "@/components/forms/PremiumSelect";
import FileDropUpload, {
  type UploadedFileItem,
} from "@/components/forms/FileDropUpload";
import { BTN, cx } from "@/components/ui-helper/buttonStyles";

type JobTabProps = {
  title: string;
  setTitle: (v: string) => void;
  roleName: string;
  setRoleName: (v: string) => void;
  company: string;
  setCompany: (v: string) => void;
  clientId: string;
  setClientId: (v: string) => void;
  clientName: string;
  setClientName: (v: string) => void;
  createClientInline: boolean;
  setCreateClientInline: (v: boolean) => void;
  clients: {
    id: string;
    name: string;
    primaryContactName?: string;
    primaryContactEmail?: string;
  }[];
  clientsLoading?: boolean;
  clientRepName: string;
  setClientRepName: (v: string) => void;
  clientRepEmail: string;
  setClientRepEmail: (v: string) => void;
  buyerOrganization: string;
  setBuyerOrganization: (v: string) => void;
  solicitationNumber: string;
  setSolicitationNumber: (v: string) => void;
  opportunitySource: string;
  setOpportunitySource: (v: string) => void;
  documents: UploadedFileItem[];
  setDocuments: (v: UploadedFileItem[]) => void;
  documentRefs: string;
  setDocumentRefs: (v: string) => void;
  submissionDeadline: string;
  setSubmissionDeadline: (v: string) => void;
  marketFocus: string;
  setMarketFocus: (v: string) => void;
  sourceText: string;
  setSourceText: (v: string) => void;
  jdText: string;
  setJdText: (v: string) => void;
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
  salaryCurrency: "NGN" | "USD" | "CAD" | "EUR" | "GBP";
  setSalaryCurrency: (v: "NGN" | "USD" | "CAD" | "EUR" | "GBP") => void;
  monthlySalaryMin: string;
  setMonthlySalaryMin: (v: string) => void;
  monthlySalaryMax: string;
  setMonthlySalaryMax: (v: string) => void;
  hoursPerWeek: string;
  setHoursPerWeek: (v: string) => void;
  skills: string[];
  skillInput: string;
  setSkillInput: (v: string) => void;
  onAddSkill: (v?: string) => void;
  onRemoveSkill: (s: string) => void;
  onExtractOpportunity: () => void;
  onGenerateAIJD: () => void;
  aiBusy?: boolean;
  extractBusy?: boolean;
  onNext: () => void;
  nextDisabled?: boolean;
};

const SOURCE_OPTIONS = [
  { value: "sales-call", label: "Sales call" },
  { value: "website-inquiry", label: "Website inquiry" },
  { value: "referral", label: "Referral" },
  { value: "existing-client", label: "Existing client" },
  { value: "email-intro", label: "Email intro" },
  { value: "other", label: "Other" },
];

const SUPPORT_PRESETS = [
  "Proposal writing",
  "RFP response coordination",
  "Compliance matrix",
  "Executive summary",
  "Content library review",
  "SME coordination",
  "Tender monitoring",
  "Candidate sourcing",
];

const INPUT =
  "w-full rounded-3xl border border-neutral-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-black/5";

const SECTION =
  "rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm";

export default function JobTab({
  title,
  setTitle,
  roleName,
  setRoleName,
  company,
  setCompany,
  clientId,
  setClientId,
  clientName,
  setClientName,
  createClientInline,
  setCreateClientInline,
  clients,
  clientsLoading,
  clientRepName,
  setClientRepName,
  clientRepEmail,
  setClientRepEmail,
  buyerOrganization,
  setBuyerOrganization,
  solicitationNumber,
  setSolicitationNumber,
  opportunitySource,
  setOpportunitySource,
  documents,
  setDocuments,
  documentRefs,
  setDocumentRefs,
  submissionDeadline,
  setSubmissionDeadline,
  marketFocus,
  setMarketFocus,
  sourceText,
  setSourceText,
  jdText,
  setJdText,
  skillInput,
  setSkillInput,
  skills,
  onAddSkill,
  onRemoveSkill,
  onExtractOpportunity,
  onNext,
  nextDisabled,
  extractBusy,
}: JobTabProps) {
  const briefLength = jdText.trim().length;
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const canExtract = sourceText.trim().length >= 80 || documents.length > 0;
  const steps = [
    {
      id: 0 as const,
      label: "Source",
      title: "Source material",
      desc: "Start from pasted text, uploaded files, or manual entry.",
    },
    {
      id: 1 as const,
      label: "Opportunity",
      title: "Opportunity details",
      desc: "Capture the buyer, deadline, and pursuit details.",
    },
    {
      id: 2 as const,
      label: "Client & Scope",
      title: "Client and delivery scope",
      desc: "Link the client, define support tracks, and finalize the brief.",
    },
  ];
  const sourceStepValid =
    canExtract || title.trim().length > 0;
  const opportunityStepValid =
    title.trim().length > 0 &&
    roleName.trim().length > 0 &&
    buyerOrganization.trim().length > 0 &&
    submissionDeadline.trim().length > 0;
  const clientStepValid =
    (clientId || clientName.trim().length > 0) &&
    clientRepName.trim().length > 0 &&
    clientRepEmail.trim().length > 0 &&
    skills.length > 0 &&
    briefLength >= 120;
  const currentStepValid =
    step === 0 ? sourceStepValid : step === 1 ? opportunityStepValid : clientStepValid;
  const stepHelp =
    step === 0
      ? "Add source text, upload documents, or start the opportunity details before continuing."
      : step === 1
        ? "Complete the title, delivery track, buyer, and deadline before continuing."
        : "Complete the client details, support tracks, and opportunity brief before continuing.";

  return (
    <div className="grid gap-6">
      <div className="rounded-[28px] border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Opportunity form
            </div>
            <div className="mt-1 text-sm font-medium text-neutral-900">
              {steps[step].title}
            </div>
            <div className="mt-1 text-sm text-neutral-600">
              {steps[step].desc}
            </div>
          </div>
          <div className="text-sm font-medium text-neutral-700">
            Step {step + 1} of {steps.length}
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-200">
          <div
            className="h-full rounded-full bg-black transition-all"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {step === 0 && (
      <div className={SECTION}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-900">
              Opportunity source material
            </div>
            <div className="mt-1 text-sm text-gray-600">
              Use pasted source text, uploaded documents, or fill the form
              manually. Extraction works from either the pasted notice or the
              uploaded files.
            </div>
          </div>
          <button
            type="button"
            onClick={onExtractOpportunity}
            disabled={!!extractBusy || !canExtract}
            className={cx(
              BTN.primary,
              "min-w-[160px] bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-700 px-4 py-3 text-sm",
              (!!extractBusy || !canExtract) && "cursor-not-allowed opacity-60"
            )}
          >
            {extractBusy ? "Extracting..." : "Extract from source"}
          </button>
        </div>

        <div className="mt-4">
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            className="min-h-[200px] w-full rounded-[28px] border border-neutral-200 bg-white px-4 py-3 text-sm leading-6 text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-black/5"
            placeholder="Paste the buyer notice, RFP summary, portal listing, or tender text here. If left empty, extraction can still use uploaded text or image files."
          />
          <div className="mt-2 text-xs text-gray-500">
            You can leave this empty if you only have the opportunity
            documents. You can also skip extraction entirely and complete the
            fields below yourself.
          </div>
        </div>
      </div>
      )}

      {step === 0 && (
      <div>
        <label className="mb-2 block text-sm font-medium">
          Opportunity documents
        </label>
        <FileDropUpload
          files={documents}
          onChange={setDocuments}
          onExtract={onExtractOpportunity}
          extractBusy={extractBusy}
          folder="opportunity-documents"
          label="Drag proposal files here or upload"
          helperText="Upload the source RFP, briefing note, or any opportunity documents you already have. These can be used on their own to prefill the form."
        />
      </div>
      )}

      {step === 1 && (
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Opportunity title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Ministry of Health RFP response support"
            className={INPUT}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Primary delivery track
          </label>
          <input
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="e.g., Proposal response support"
            className={INPUT}
          />
        </div>
      </div>
      )}

      {step === 2 && (
      <div className={SECTION}>
        <div className="text-sm font-semibold text-gray-900">Client</div>
        <div className="mt-1 text-sm text-gray-700">
          Link this opportunity to the customer you are supporting, or create a
          new client record if this is the first pursuit for them.
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">
              Existing client
            </label>
            <PremiumSelect
              value={clientId}
              onChange={(e) => {
                const next = e.target.value;
                setClientId(next);
                if (next) setCreateClientInline(false);
              }}
              wrapperClassName="group relative inline-block w-full rounded-3xl ring-1 ring-neutral-200 shadow-sm hover:shadow transition"
              className="rounded-3xl px-4 py-3 pr-10 text-sm"
              appearance="light"
              disabled={clientsLoading}
            >
              <option value="">
                {clientsLoading ? "Loading clients..." : "Select client..."}
              </option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </PremiumSelect>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setCreateClientInline(!createClientInline);
                if (!createClientInline) setClientId("");
              }}
              className={cx(
                BTN.primary,
                "min-w-[170px] bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-700 px-4 py-3 text-sm"
              )}
            >
              {createClientInline ? "Use existing client" : "Add new client"}
            </button>
          </div>
        </div>

        {createClientInline && (
          <div className="mt-4 rounded-[24px] border border-neutral-200 bg-neutral-50/80 p-4">
            <div className="mb-1 text-sm font-semibold text-gray-900">
              New client details
            </div>
            <div className="mb-3 text-xs text-gray-700">
              Capture the client you are serving for this opportunity.
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-900">
                  Client name
                </label>
                <input
                  value={clientName}
                  onChange={(e) => {
                    setClientName(e.target.value);
                    setCompany(e.target.value);
                  }}
                  placeholder="e.g., New Consulting"
                  className={INPUT}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-900">
                  Client representative
                </label>
                <input
                  value={clientRepName}
                  onChange={(e) => setClientRepName(e.target.value)}
                  placeholder="e.g., Jerry Smith"
                  className={INPUT}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-900">
                  Client contact email
                </label>
                <input
                  value={clientRepEmail}
                  onChange={(e) => setClientRepEmail(e.target.value)}
                  placeholder="e.g., client@company.com"
                  className={INPUT}
                  type="email"
                />
              </div>
            </div>
          </div>
        )}

        {!createClientInline && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900">
                Client representative
              </label>
              <input
                value={clientRepName}
                onChange={(e) => setClientRepName(e.target.value)}
                placeholder="e.g., Jerry Smith"
                className={INPUT}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900">
                Client contact email
              </label>
              <input
                value={clientRepEmail}
                onChange={(e) => setClientRepEmail(e.target.value)}
                placeholder="e.g., client@company.com"
                className={INPUT}
                type="email"
              />
            </div>
          </div>
        )}
      </div>
      )}

      {step === 1 && (
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Buyer / issuing authority
          </label>
          <input
            value={buyerOrganization}
            onChange={(e) => setBuyerOrganization(e.target.value)}
            placeholder="e.g., Department of National Defence Canada"
            className={INPUT}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Market focus
          </label>
          <input
            value={marketFocus}
            onChange={(e) => setMarketFocus(e.target.value)}
            placeholder="e.g., Canada, US, UK"
            className={INPUT}
          />
        </div>
      </div>
      )}

      {step === 1 && (
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Solicitation / reference number
          </label>
          <input
            value={solicitationNumber}
            onChange={(e) => setSolicitationNumber(e.target.value)}
            placeholder="e.g., W8486-240001/A"
            className={INPUT}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Opportunity source
          </label>
          <PremiumSelect
            value={opportunitySource}
            onChange={(e) => setOpportunitySource(e.target.value)}
            wrapperClassName="group relative inline-block w-full rounded-3xl ring-1 ring-neutral-200 shadow-sm hover:shadow transition"
            className="rounded-3xl px-4 py-3 pr-10 text-sm"
            appearance="light"
          >
            {SOURCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </PremiumSelect>
        </div>
      </div>
      )}

      {step === 1 && (
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Submission deadline
          </label>
          <input
            value={submissionDeadline}
            onChange={(e) => setSubmissionDeadline(e.target.value)}
            className={INPUT}
            type="date"
          />
        </div>
      </div>
      )}

      {step === 2 && (
      <div>
        <label className="mb-1 block text-sm font-medium">
          Support tracks
        </label>
        <div className="flex flex-wrap gap-2">
          {SUPPORT_PRESETS.map((item) => {
            const selected = skills.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => (selected ? onRemoveSkill(item) : onAddSkill(item))}
                className={`cursor-pointer rounded-full border px-3 py-1 text-xs ${
                  selected
                    ? "border-black bg-black text-white"
                    : "bg-white text-gray-900 hover:bg-gray-50"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddSkill();
              }
            }}
            placeholder="Add another support area and press Enter"
            className={cx(INPUT, "flex-1")}
          />
          <button
            type="button"
            onClick={() => onAddSkill()}
            className={cx(BTN.subtle, "px-4 py-2 text-sm")}
          >
            Add
          </button>
        </div>
        {skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs text-gray-900"
              >
                {skill}
                <button
                type="button"
                onClick={() => onRemoveSkill(skill)}
                  className="cursor-pointer font-semibold text-gray-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      )}

      {step === 2 && (
      <div>
        <label className="mb-1 block text-sm font-medium">
          Opportunity brief
        </label>
        <textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          className="h-[280px] w-full rounded-[28px] border border-neutral-200 bg-white px-4 py-3 text-sm leading-6 text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-black/5"
          placeholder="Summarize the opportunity, buyer context, scope, expectations, constraints, win themes, and any immediate next steps."
        />
        <div className="mt-1 text-xs text-gray-500">
          Brief length: {briefLength} characters (min 120)
        </div>
      </div>
      )}

      {step === 2 && (
      <div>
        <label className="mb-1 block text-sm font-medium">
          Document notes or reference links
        </label>
        <textarea
          value={documentRefs}
          onChange={(e) => setDocumentRefs(e.target.value)}
          className="min-h-[120px] w-full rounded-[28px] border border-neutral-200 bg-white px-4 py-3 text-sm leading-6 text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-black/5"
          placeholder="Paste file paths, shared-drive links, portal references, or notes about documents to collect."
        />
      </div>
      )}

      {step === 2 && (
      <div className="rounded-2xl border bg-gray-50 p-4 text-sm text-gray-700">
        This opportunity form is proposal-first. Candidates, SMEs, and other collaborators can be added later only when this opportunity needs them.
      </div>
      )}

      <div className="flex justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep((prev) => (prev > 0 ? ((prev - 1) as 0 | 1 | 2) : prev))}
          disabled={step === 0}
          className={cx(BTN.subtle, "rounded-2xl", step === 0 && "cursor-not-allowed opacity-50")}
        >
          Back
        </button>
        {step < 2 ? (
          <div className="flex flex-col items-end gap-2">
            {!currentStepValid ? (
              <div className="text-right text-xs text-red-600">{stepHelp}</div>
            ) : null}
            <button
              type="button"
              onClick={() => setStep((prev) => ((prev + 1) as 0 | 1 | 2))}
              disabled={!currentStepValid}
              className={cx(
                BTN.primary,
                "rounded-2xl",
                !currentStepValid && "cursor-not-allowed opacity-50"
              )}
            >
              Continue
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-end gap-2">
            {!currentStepValid ? (
              <div className="text-right text-xs text-red-600">{stepHelp}</div>
            ) : null}
            <button
              type="button"
              onClick={onNext}
              disabled={!!nextDisabled || !currentStepValid}
              className={cx(
                BTN.primary,
                "rounded-2xl",
                (nextDisabled || !currentStepValid) &&
                  "cursor-not-allowed opacity-50"
              )}
            >
              Create opportunity
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
