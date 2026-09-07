"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowUpRight, Check, CheckCircle2, ChevronDown, Clock3, ExternalLink, X } from "lucide-react";
import PremiumToast from "@/components/feedback/PremiumToast";
import { useTimedToast } from "@/components/feedback/useTimedToast";
import BrandLoader from "@/components/brand-loader";
import ViewportPortal from "@/components/ViewportPortal";
import { BTN, cx } from "@/components/ui-helper/buttonStyles";

type Connection = {
  id: string;
  portalKey: string;
  portalName: string;
  loginUrl: string;
  username: string;
  status: string;
  lastCheckedAt?: string;
};

type Run = {
  id: string;
  query: string;
  portalKeys?: string[];
  status: string;
  decision: string;
  decisionReason?: string;
  resultCount: number;
  createdAt?: string;
  results?: Array<{
    title?: string;
    url?: string;
    organization?: string;
    referenceNumber?: string;
    closingDate?: string;
    description?: string;
    fitScore?: number;
    preliminaryDecision?: string;
  }>;
};

type SavedSearch = {
  id: string;
  name: string;
  query: string;
  keywords: string[];
  industryCodes: string[];
  categories: string[];
  bidTypes: string[];
  buyerKeywords?: string[];
  procurementStages: string[];
  valueRanges: string[];
  commercialTools: string[];
  naicsCodes: string[];
  sectors: string[];
  statuses: string[];
  noticeTypes: string[];
  setAsides: string[];
  geography: string[];
  publishedFrom?: string;
  publishedTo?: string;
  closingFrom?: string;
  closingTo?: string;
  publishedWindow?: string;
  closingWindow?: string;
  portalConnectionIds: string[];
  portalKeys: string[];
};

type SearchCriteria = Omit<SavedSearch, "id" | "name">;

const portals = [
  ["canada-buys", "CanadaBuys", "Canadian federal procurement opportunities."],
  ["sam-gov", "SAM.gov", "United States federal contract opportunities."],
  ["find-a-tender", "Find a Tender", "UK public procurement notices."],
  ["contracts-finder", "Contracts Finder", "UK public sector contract opportunities."],
  ["ted", "TED (EU Tenders)", "European Union public procurement notices."],
  ["ontario-tenders", "Ontario Tenders Portal", "Ontario public procurement opportunities."],
  ["merx", "MERX", "Canadian public and private tender listings."],
  ["bids-and-tenders", "Bids & Tenders", "Canadian public bid opportunities from participating buyers."],
  ["acquisition-gateway", "Acquisition Gateway Forecast", "US federal procurement forecasts and early signals."],
] as const;

const activeSearchPortals = ["canada-buys", "sam-gov", "merx", "bids-and-tenders", "find-a-tender", "contracts-finder", "ted", "ontario-tenders"];

const merxCategories = [
  { value: "10005", label: "Aerospace" },
  { value: "10016", label: "Air Conditioning and Refrigeration Equipment" },
  { value: "10048", label: "Architect and Engineering Services" },
  { value: "10027", label: "Armament" },
  { value: "10030", label: "Chemicals and Chemical Specialties" },
  { value: "10031", label: "Communications, Detection and Fibre Optics" },
  { value: "10042", label: "Communications, Photo, Mapping, Printing and Publication" },
  { value: "10032", label: "Construction Products" },
  { value: "10004", label: "Construction Services" },
  { value: "10033", label: "Cosmetics and Toiletries" },
  { value: "10037", label: "Custodial Operations and Related Services" },
  { value: "10034", label: "EDP Hardware and Software" },
  { value: "10035", label: "EDP and Office Equipment Maintenance" },
  { value: "10043", label: "Educational and Training Services" },
  { value: "10006", label: "Electrical and Electronics" },
  { value: "10007", label: "Energy" },
  { value: "10008", label: "Engines, Turbines, Components and Accessories" },
  { value: "10050", label: "Environmental Services" },
  { value: "10009", label: "Fabricated Materials" },
  { value: "10038", label: "Financial and Related Services" },
  { value: "10010", label: "Fire Fighting, Security and Safety Equipment" },
  { value: "10011", label: "Food" },
  { value: "10012", label: "Food Preparation and Serving Equipment" },
  { value: "10013", label: "Furniture" },
  { value: "10052", label: "Health and Social Services" },
  { value: "10014", label: "Industrial Equipment" },
  { value: "10049", label: "Information Processing and Related Telecom Services" },
  { value: "10045", label: "Lease and Rental of Equipment" },
  { value: "10046", label: "Leasing or Rental of Facilities" },
  { value: "10015", label: "Machinery and Tools" },
  { value: "10054", label: "Maintenance, Repair, Modification and Installation" },
  { value: "10017", label: "Marine" },
  { value: "10018", label: "Medical Equipment, Supplies and Pharmaceuticals" },
  { value: "10019", label: "Miscellaneous Goods" },
  { value: "10051", label: "Natural Resources Services" },
  { value: "10020", label: "Office Equipment" },
  { value: "10021", label: "Office Stationery and Supplies" },
  { value: "10039", label: "Operation of Government-Owned Facilities" },
  { value: "10022", label: "Prefabricated Structures" },
  { value: "10040", label: "Professional, Admin and Management Services" },
  { value: "10023", label: "Publications, Forms and Paper Products" },
  { value: "10053", label: "Quality Control, Testing, Inspection and Technical Services" },
  { value: "10036", label: "Research and Development" },
  { value: "10024", label: "Scientific Instruments" },
  { value: "10025", label: "Special Purpose Vehicles" },
  { value: "10047", label: "Special Studies and Analysis" },
  { value: "10026", label: "Systems Integration" },
  { value: "10028", label: "Textiles and Apparel" },
  { value: "10029", label: "Transportation Equipment and Spares" },
  { value: "10044", label: "Transportation, Travel and Relocation Services" },
  { value: "10055", label: "Undefined" },
  { value: "10041", label: "Utilities" },
];

const bidsAndTendersTypes = [
  { value: "Public", label: "Public" },
  { value: "Prequalification", label: "Prequalification" },
];

const ontarioWorkCategories = [
  { value: "Services", label: "Services" },
  { value: "Goods", label: "Goods" },
  { value: "Construction", label: "Construction" },
  { value: "Information technology", label: "Information technology" },
  { value: "Professional services", label: "Professional services" },
];

const ontarioProcurementRoutes = [
  { value: "Request for Bids", label: "Request for Bids" },
  { value: "Request for Proposals", label: "Request for Proposals" },
  { value: "Request for Information", label: "Request for Information" },
  { value: "Request for Qualifications", label: "Request for Qualifications" },
  { value: "Invitation to Tender", label: "Invitation to Tender" },
];

const ontarioProjectTypes = [
  { value: "RFB", label: "Request for Bids" },
  { value: "RFP", label: "Request for Proposals" },
  { value: "RFI", label: "Request for Information" },
  { value: "RFQ", label: "Request for Qualifications" },
];

const ontarioLocations = [
  "Ontario", "Greater Toronto Area", "Central Ontario", "Eastern Ontario", "Northern Ontario", "Southwestern Ontario",
];

function portalNames(keys: string[] = []) {
  return keys.map((key) => portals.find(([portalKey]) => portalKey === key)?.[1] || key).join(", ") || "Portal source";
}

const sourcingOptions = {
  unspsc: [
    { value: "80101500", label: "80101500 · Business and management consultation" },
    { value: "80111500", label: "80111500 · Human resources" },
    { value: "80111600", label: "80111600 · Temporary personnel services" },
    { value: "80111700", label: "80111700 · Professional staff recruitment" },
    { value: "80161500", label: "80161500 · Management support services" },
  ],
  naics: [
    { value: "236220", label: "236220 · Commercial and institutional building construction" },
    { value: "238220", label: "238220 · Plumbing, heating, and air-conditioning contractors" },
    { value: "238320", label: "238320 · Painting and wall covering contractors" },
    { value: "541211", label: "541211 · Offices of certified public accountants" },
    { value: "541213", label: "541213 · Tax preparation services" },
    { value: "541214", label: "541214 · Payroll services" },
    { value: "541219", label: "541219 · Other accounting services" },
    { value: "541330", label: "541330 · Engineering services" },
    { value: "541511", label: "541511 · Custom computer programming services" },
    { value: "541512", label: "541512 · Computer systems design services" },
    { value: "541519", label: "541519 · Other computer related services" },
    { value: "541611", label: "541611 · Administrative management and general management consulting" },
    { value: "541612", label: "541612 · Human resources consulting services" },
    { value: "541613", label: "541613 · Marketing consulting services" },
    { value: "541614", label: "541614 · Process, physical distribution, and logistics consulting" },
    { value: "541618", label: "541618 · Other management consulting services" },
    { value: "541620", label: "541620 · Environmental consulting services" },
    { value: "541690", label: "541690 · Other scientific and technical consulting services" },
    { value: "541713", label: "541713 · Research and development in nanotechnology" },
    { value: "541714", label: "541714 · Research and development in biotechnology" },
    { value: "541715", label: "541715 · Research and development in the physical, engineering, and life sciences" },
    { value: "541720", label: "541720 · Research and development in the social sciences and humanities" },
    { value: "541810", label: "541810 · Advertising agencies" },
    { value: "541820", label: "541820 · Public relations agencies" },
    { value: "541910", label: "541910 · Marketing research and public opinion polling" },
    { value: "541990", label: "541990 · All other professional, scientific, and technical services" },
    { value: "561110", label: "561110 · Office administrative services" },
    { value: "561210", label: "561210 · Facilities support services" },
    { value: "561311", label: "561311 · Employment placement agencies" },
    { value: "561312", label: "561312 · Executive search services" },
    { value: "561320", label: "561320 · Temporary help services" },
    { value: "561330", label: "561330 · Professional employer organizations" },
    { value: "561410", label: "561410 · Document preparation services" },
    { value: "561499", label: "561499 · All other business support services" },
    { value: "561510", label: "561510 · Travel agencies" },
    { value: "561611", label: "561611 · Investigation services" },
    { value: "561612", label: "561612 · Security guards and patrol services" },
    { value: "561710", label: "561710 · Exterminating and pest control services" },
    { value: "561720", label: "561720 · Janitorial services" },
    { value: "561730", label: "561730 · Landscaping services" },
    { value: "561790", label: "561790 · Other services to buildings and dwellings" },
    { value: "611430", label: "611430 · Professional and management development training" },
    { value: "611699", label: "611699 · All other miscellaneous schools and instruction" },
    { value: "518210", label: "518210 · Computing infrastructure providers, data processing, web hosting" },
    { value: "813910", label: "813910 · Business associations" },
    { value: "813920", label: "813920 · Professional organizations" },
  ],
  geography: ["Canada", "National Capital Region", "Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba", "Saskatchewan", "Nova Scotia", "New Brunswick", "Newfoundland and Labrador", "Prince Edward Island", "Northwest Territories", "Nunavut", "Yukon"],
  sectors: ["Services", "Goods", "Construction", "Services related to goods"],
  statuses: ["open", "expired", "cancelled", "awarded"],
  noticeTypes: ["Request for Proposal", "Request for Services", "Request for Standing Offer", "Invitation to Tender", "Notice of Proposed Procurement"],
  setAsides: ["Indigenous business", "Small business", "Canadian supplier", "Competitive process"],
};

const samNoticeTypes = [
  { value: "r", label: "Sources Sought" },
  { value: "p", label: "Presolicitation" },
  { value: "o", label: "Solicitation" },
  { value: "k", label: "Combined Synopsis/Solicitation" },
  { value: "s", label: "Special Notice" },
  { value: "a", label: "Award Notice" },
  { value: "u", label: "Justification and Authorization" },
];

const samSetAsides = [
  { value: "SBA", label: "Total Small Business Set-Aside" },
  { value: "SBP", label: "Partial Small Business Set-Aside" },
  { value: "8A", label: "8(a) Set-Aside" },
  { value: "HZC", label: "HUBZone Set-Aside" },
  { value: "SDVOSBC", label: "SDVOSB Set-Aside" },
  { value: "WOSB", label: "Women-Owned Small Business Set-Aside" },
  { value: "EDWOSB", label: "Economically Disadvantaged WOSB Set-Aside" },
  { value: "LAS", label: "Local Area Set-Aside" },
  { value: "VSA", label: "Veteran-Owned Small Business Set-Aside" },
];

const samStates = [
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["CA", "California"], ["CO", "Colorado"], ["CT", "Connecticut"], ["DC", "District of Columbia"], ["FL", "Florida"], ["GA", "Georgia"], ["IL", "Illinois"], ["MA", "Massachusetts"], ["MD", "Maryland"], ["MI", "Michigan"], ["MN", "Minnesota"], ["NC", "North Carolina"], ["NJ", "New Jersey"], ["NY", "New York"], ["OH", "Ohio"], ["PA", "Pennsylvania"], ["TX", "Texas"], ["VA", "Virginia"], ["WA", "Washington"], ["WI", "Wisconsin"],
].map(([value, label]) => ({ value, label }));

const findATenderStages = [
  { value: "pipeline", label: "Pipeline" },
  { value: "planning", label: "Planning" },
  { value: "tender", label: "Tender" },
  { value: "award", label: "Award" },
  { value: "contract", label: "Contract" },
  { value: "termination", label: "Termination" },
  { value: "payments-compliance", label: "Payments compliance" },
];

const findATenderNoticeTypes = [
  { value: "Contract notice", label: "Contract notice" },
  { value: "Prior information notice", label: "Prior information notice" },
  { value: "Tender notice", label: "Tender notice" },
  { value: "Contract award notice", label: "Contract award notice" },
  { value: "Corrigendum", label: "Corrigendum" },
];

const findATenderCpvCodes = [
  { value: "03000000", label: "Agricultural, farming, fishing, forestry products" },
  { value: "45000000", label: "Construction work" },
  { value: "48000000", label: "Software packages and information systems" },
  { value: "50000000", label: "Repair and maintenance services" },
  { value: "55000000", label: "Hotel, restaurant and retail trade services" },
  { value: "60000000", label: "Transport services" },
  { value: "64000000", label: "Postal and telecommunications services" },
  { value: "72000000", label: "IT services: consulting, software development, Internet and support" },
  { value: "73000000", label: "Research and development services" },
  { value: "79000000", label: "Business services: law, marketing, consulting, recruitment, printing and security" },
  { value: "80000000", label: "Education and training services" },
  { value: "85000000", label: "Health and social work services" },
  { value: "90000000", label: "Sewage, refuse, cleaning and environmental services" },
];

const findATenderLocations = [
  "United Kingdom", "England", "Scotland", "Wales", "Northern Ireland", "East Midlands", "East of England",
  "London", "North East", "North West", "South East", "South West", "West Midlands", "Yorkshire and the Humber",
];

const tedCountries = [
  "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czechia", "Denmark", "Estonia", "Finland", "France",
  "Germany", "Greece", "Hungary", "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta", "Netherlands",
  "Poland", "Portugal", "Romania", "Slovakia", "Slovenia", "Spain", "Sweden",
].map((country) => ({ value: country, label: country }));

const findATenderSuitability = [
  { value: "SME", label: "Suitable for SMEs" },
  { value: "VCSE", label: "Suitable for voluntary, community and social enterprises" },
];

const findATenderValueRanges = [
  { value: "under-25000", label: "Under £25,000" },
  { value: "25000-100000", label: "£25,000 to £100,000" },
  { value: "100000-500000", label: "£100,000 to £500,000" },
  { value: "500000-1000000", label: "£500,000 to £1 million" },
  { value: "over-1000000", label: "Over £1 million" },
];

const findATenderCommercialTools = [
  { value: "framework", label: "Framework" },
  { value: "dynamic-purchasing-system", label: "Dynamic purchasing system" },
  { value: "qualification-system", label: "Qualification system" },
  { value: "call-off", label: "Call-off contract" },
];

function csvValues(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function MultiSelect({
  label,
  placeholder,
  options,
  values,
  onChange,
  allowCustom = false,
  customPattern = /^\d{2,6}$/,
  customLabel = "code",
}: {
  label: string;
  placeholder: string;
  options: Array<string | { value: string; label: string }>;
  values: string[];
  onChange: (values: string[]) => void;
  allowCustom?: boolean;
  customPattern?: RegExp;
  customLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedCount = values.length;
  const toggle = (option: string) => onChange(values.includes(option) ? values.filter((item) => item !== option) : [...values, option]);
  const normalizedSearch = search.trim().toLowerCase();
  const filteredOptions = options.filter((option) => {
    if (!normalizedSearch) return true;
    const value = typeof option === "string" ? option : option.value;
    const optionLabel = typeof option === "string" ? option : option.label;
    return `${value} ${optionLabel}`.toLowerCase().includes(normalizedSearch);
  });
  const canAddCustom = allowCustom && customPattern.test(search.trim()) && !values.includes(search.trim());

  useEffect(() => {
    if (!open) return;
    function closeWhenOutside(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", closeWhenOutside);
    return () => document.removeEventListener("pointerdown", closeWhenOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative min-w-0">
      <span className="mb-1.5 block text-xs font-medium text-white/65">{label}</span>
      <button type="button" aria-expanded={open} onClick={() => { setOpen((current) => !current); setSearch(""); }} className="flex min-h-11 w-full min-w-0 cursor-pointer items-center justify-between gap-3 rounded-2xl border border-white/15 bg-slate-950 px-4 py-3 text-left text-sm text-white transition hover:border-emerald-300/45 hover:bg-slate-900">
        <span className={cx("min-w-0 truncate", selectedCount ? "text-white" : "text-white/45")}>{selectedCount ? `${selectedCount} selected` : placeholder}</span>
        <ChevronDown className={cx("h-4 w-4 shrink-0 text-white/55 transition", open && "rotate-180 text-emerald-200")} />
      </button>
      {open ? (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-white/15 bg-slate-900 p-2 shadow-2xl shadow-black/40">
           <input value={search} onChange={(event) => setSearch(event.target.value)} onClick={(event) => event.stopPropagation()} onKeyDown={(event) => { if (event.key === "Enter" && canAddCustom) { event.preventDefault(); toggle(search.trim()); setSearch(""); } }} autoFocus placeholder={allowCustom ? `Search or enter a ${customLabel}` : `Search ${label.toLowerCase()}`} className="mb-2 w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-emerald-300/60" />
           {canAddCustom ? <button type="button" onClick={() => { toggle(search.trim()); setSearch(""); }} className="mb-1 flex w-full cursor-pointer items-center rounded-xl px-3 py-2.5 text-left text-xs font-medium text-emerald-200 transition hover:bg-emerald-300/10">Add {customLabel} {search.trim()}</button> : null}
          {filteredOptions.map((option) => {
            const value = typeof option === "string" ? option : option.value;
            const label = typeof option === "string" ? option : option.label;
            const checked = values.includes(value);
            return <button key={value} type="button" onClick={() => toggle(value)} className="flex w-full cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 text-left text-xs text-white/75 transition hover:bg-white/10 hover:text-white"><span className={cx("mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border", checked ? "border-emerald-300 bg-emerald-400 text-slate-950" : "border-white/25 bg-white/[0.03]")}>{checked ? <Check className="h-3 w-3" /> : null}</span><span className="min-w-0 leading-5">{label}</span></button>;
          })}
          {!filteredOptions.length && !canAddCustom ? <p className="px-3 py-2 text-xs text-white/45">No matching options.</p> : null}
        </div>
      ) : null}
    </div>
  );
}

function StyledSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: ReadonlyArray<readonly [string, string]> }) {
  return <label className="grid min-w-0 gap-1.5 text-xs font-medium text-white/65"><span>{label}</span><span className="relative"><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full min-w-0 cursor-pointer appearance-none rounded-2xl border border-white/15 bg-slate-950 px-4 py-3 pr-10 text-sm text-white transition hover:border-emerald-300/45 focus:border-emerald-300/60 focus:outline-none">{options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/55" /></span></label>;
}

function SourcingReviewModal({
  run,
  onClose,
  onDelete,
}: {
  run: Run;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-label="Sourcing review">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-emerald-200/20 bg-slate-950 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-gradient-to-br from-emerald-300/10 via-transparent to-cyan-300/10 px-5 py-5 sm:px-7">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200/75"><CheckCircle2 className="h-4 w-4" /> Sourcing review</div>
            <h2 className="mt-3 break-words text-xl font-semibold text-white sm:text-2xl">{run.query}</h2>
            <p className="mt-2 text-sm text-white/55">Review matches before turning one into an opportunity.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close sourcing review" title="Close" className="shrink-0 cursor-pointer rounded-full border border-white/10 p-2 text-white/70 transition hover:border-white/25 hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <div className="overflow-y-auto px-5 py-5 sm:px-7">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><div className="text-xs uppercase tracking-[0.14em] text-white/45">Status</div><div className="mt-2 font-medium capitalize text-white">{run.status}</div></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><div className="text-xs uppercase tracking-[0.14em] text-white/45">Decision</div><div className="mt-2 font-medium capitalize text-white">{run.decision.replaceAll("_", " ")}</div></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><div className="text-xs uppercase tracking-[0.14em] text-white/45">Matches</div><div className="mt-2 font-medium text-white">{run.resultCount || 0}</div></div>
          </div>
          {run.decisionReason ? <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white/65">{run.decisionReason}</p> : null}
          {run.status === "failed" ? <div className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4 text-sm leading-6 text-rose-100">This review did not produce results. Retry the search after confirming the portal is available.</div> : null}
          <div className="mt-5 grid gap-3">
            {run.results?.length ? run.results.map((result, index) => (
              <a key={`${run.id}-result-${index}`} href={result.url || "#"} target="_blank" rel="noreferrer" className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-emerald-300/35 hover:bg-emerald-300/[0.07]">
                <div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="break-words font-medium text-white">{result.title || "Untitled opportunity"}</div><div className="mt-2 text-sm text-white/55">{result.organization || "CanadaBuys"}{result.referenceNumber ? ` - ${result.referenceNumber}` : ""}</div></div><ArrowUpRight className="h-5 w-5 shrink-0 text-emerald-200 opacity-70 transition group-hover:opacity-100" /></div>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/55"><span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> Fit {result.fitScore ?? 0}%</span>{result.closingDate ? <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5 text-cyan-200" /> Closes {result.closingDate}</span> : null}<span className="capitalize">{result.preliminaryDecision?.replace("_", " ") || "Needs review"}</span></div>
                {result.description ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/65">{result.description}</p> : null}<div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-200">Open CanadaBuys notice <ExternalLink className="h-4 w-4" /></div>
              </a>
            )) : <p className="rounded-2xl border border-dashed border-white/15 p-5 text-sm text-white/55">No matching opportunities were found for this search.</p>}
          </div>
        </div>
        <div className="flex flex-col items-center gap-3 border-t border-white/10 px-5 py-5 sm:flex-row sm:justify-center sm:px-7">
          <button type="button" onClick={onClose} className={cx(BTN.primary, "w-full cursor-pointer justify-center px-6 py-2.5 text-sm sm:w-auto")}><X className="h-4 w-4" /> Close review</button>
          <button type="button" onClick={onDelete} className="w-full cursor-pointer rounded-xl border border-rose-300/25 px-5 py-2.5 text-sm text-rose-100 transition hover:bg-rose-400/10 sm:w-auto">Delete review</button>
        </div>
      </div>
    </div>
  );
}

export default function SourcingPanel() {
  const searchParams = useSearchParams();
  const savedSearchId = searchParams.get("savedSearch");
  const [connections, setConnections] = useState<Connection[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [portalKey, setPortalKey] = useState("canada-buys");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [query, setQuery] = useState("");
  const [keywords, setKeywords] = useState("");
  const [buyerKeywords, setBuyerKeywords] = useState("");
  const [industryCodes, setIndustryCodes] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [bidTypes, setBidTypes] = useState<string[]>([]);
  const [procurementStages, setProcurementStages] = useState<string[]>([]);
  const [valueRanges, setValueRanges] = useState<string[]>([]);
  const [commercialTools, setCommercialTools] = useState<string[]>([]);
  const [naicsCodes, setNaicsCodes] = useState("");
  const [sectors, setSectors] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>(["open"]);
  const [noticeTypes, setNoticeTypes] = useState<string[]>([]);
  const [setAsides, setSetAsides] = useState<string[]>([]);
  const [geography, setGeography] = useState("");
  const [publishedFrom, setPublishedFrom] = useState("");
  const [publishedTo, setPublishedTo] = useState("");
  const [closingFrom, setClosingFrom] = useState("");
  const [closingTo, setClosingTo] = useState("");
  const [publishedWindow, setPublishedWindow] = useState("");
  const [closingWindow, setClosingWindow] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [canadaBuysSelected, setCanadaBuysSelected] = useState(true);
  const [selectedRun, setSelectedRunState] = useState<Run | null>(null);
  function setSelectedRun(run: Run | null) {
    if (run) {
      window.location.assign(`/admin/sourcing/${run.id}`);
      return;
    }
    setSelectedRunState(null);
  }
  const [busy, setBusy] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const { toast, showToast } = useTimedToast();
  const isSamGov = portalKey === "sam-gov";
   const supportsCodes = ["canada-buys", "sam-gov", "find-a-tender", "contracts-finder", "ted", "ontario-tenders", "acquisition-gateway"].includes(portalKey);
   const supportsNoticeTypes = ["canada-buys", "sam-gov", "find-a-tender", "contracts-finder", "ted", "ontario-tenders"].includes(portalKey);
  const supportsSetAsides = ["canada-buys", "sam-gov", "acquisition-gateway"].includes(portalKey);
  const supportsSectors = portalKey === "canada-buys";
   const codeLabel = isSamGov ? "PSC codes" : ["find-a-tender", "contracts-finder", "ted"].includes(portalKey) ? "CPV codes" : portalKey === "ontario-tenders" ? "UNSPSC project category" : "UNSPSC / GSIN codes";
  const secondaryCodeLabel = isSamGov ? "NAICS codes" : "NAICS codes";
  const portalNoticeTypes = isSamGov ? samNoticeTypes : sourcingOptions.noticeTypes;
  const portalSetAsides = isSamGov ? samSetAsides : sourcingOptions.setAsides;
   const portalGeography = isSamGov ? samStates : portalKey === "ontario-tenders" ? ontarioLocations : portalKey === "ted" ? tedCountries : sourcingOptions.geography;

  async function load() {
    const [connectionsRes, runsRes, savedSearchesRes] = await Promise.all([
      fetch("/api/admin/sourcing/connections", { cache: "no-store" }),
      fetch("/api/admin/sourcing/runs", { cache: "no-store" }),
      fetch("/api/admin/sourcing/saved-searches", { cache: "no-store" }),
    ]);
    const connectionsData = await connectionsRes.json().catch(() => ({}));
    const runsData = await runsRes.json().catch(() => ({}));
    const savedSearchesData = await savedSearchesRes.json().catch(() => ({}));
    if (!connectionsRes.ok || !connectionsData.ok) throw new Error(connectionsData.error || "Could not load portal connections.");
    setConnections(connectionsData.connections || []);
    setRuns(runsData.runs || []);
    setSavedSearches(savedSearchesRes.ok && savedSearchesData.ok ? savedSearchesData.searches || [] : []);
    setSelected((current) => current.filter((id) => (connectionsData.connections || []).some((item: Connection) => item.id === id)));
  }

  useEffect(() => { void load().catch((error: unknown) => showToast(error instanceof Error ? error.message : "Could not load sourcing data.", "error")); }, [showToast]);

  useEffect(() => {
    if (!savedSearchId || !savedSearches.length) return;
    loadSavedSearch(savedSearchId);
    window.history.replaceState({}, "", "/admin/sourcing");
    // The loader intentionally runs once when the requested saved search arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedSearchId, savedSearches.length]);

  async function saveConnection(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await fetch("/api/admin/sourcing/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portalKey, username, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) throw new Error(data.error || "Could not save portal connection.");
      setUsername(""); setPassword("");
      await load();
      showToast("Portal connection saved securely.", "success");
    } catch (error: unknown) { showToast(error instanceof Error ? error.message : "Could not save portal connection.", "error"); }
    finally { setBusy(false); }
  }

  async function removeConnection(id: string) {
    if (!window.confirm("Remove this portal connection? Stored credentials will be deleted.")) return;
    const response = await fetch("/api/admin/sourcing/connections", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) { showToast(data.error || "Could not remove connection.", "error"); return; }
    await load();
    showToast("Portal connection removed.", "success");
  }

  function currentSearchCriteria(): SearchCriteria {
    return {
      query,
      keywords: keywords.split(",").map((value) => value.trim()).filter(Boolean),
      buyerKeywords: buyerKeywords.split(",").map((value) => value.trim()).filter(Boolean),
      industryCodes: industryCodes.split(",").map((value) => value.trim()).filter(Boolean),
      categories,
      bidTypes,
      procurementStages,
      valueRanges,
      commercialTools,
      naicsCodes: naicsCodes.split(",").map((value) => value.trim()).filter(Boolean),
      sectors,
      statuses,
      noticeTypes,
      setAsides,
      geography: geography.split(",").map((value) => value.trim()).filter(Boolean),
      publishedFrom,
      publishedTo,
      closingFrom,
      closingTo,
      publishedWindow,
      closingWindow,
      portalConnectionIds: selected,
      portalKeys: [portalKey],
    };
  }

  function hasSearchCriteria() {
    return Boolean(
      query.trim() || keywords.trim() || buyerKeywords.trim() || industryCodes.trim() || naicsCodes.trim() ||
      categories.length || bidTypes.length || procurementStages.length || valueRanges.length || commercialTools.length ||
      sectors.length || statuses.length || noticeTypes.length || setAsides.length ||
      geography.trim() || publishedFrom || publishedTo || closingFrom || closingTo ||
      publishedWindow || closingWindow
    );
  }

  function focusRunList() {
    window.setTimeout(() => document.getElementById("sourcing-runs")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function loadSavedSearch(id: string) {
    const saved = savedSearches.find((item) => item.id === id);
    if (!saved) return;
    setQuery(saved.query);
    setKeywords(saved.keywords.join(", "));
    setBuyerKeywords((saved.buyerKeywords || []).join(", "));
    setIndustryCodes(saved.industryCodes.join(", "));
    setCategories(saved.categories || []);
    setBidTypes(saved.bidTypes || []);
    setProcurementStages(saved.procurementStages || []);
    setValueRanges(saved.valueRanges || []);
    setCommercialTools(saved.commercialTools || []);
    setNaicsCodes(saved.naicsCodes.join(", "));
    setSectors(saved.sectors);
    setStatuses(saved.statuses);
    setNoticeTypes(saved.noticeTypes || []);
    setSetAsides(saved.setAsides || []);
    setGeography(saved.geography.join(", "));
    setPublishedFrom(saved.publishedFrom || "");
    setPublishedTo(saved.publishedTo || "");
    setClosingFrom(saved.closingFrom || "");
    setClosingTo(saved.closingTo || "");
    setPublishedWindow(saved.publishedWindow || "");
    setClosingWindow(saved.closingWindow || "");
    setSelected(saved.portalConnectionIds);
    setPortalKey(saved.portalKeys[0] || "canada-buys");
    setCanadaBuysSelected(saved.portalKeys.includes("canada-buys"));
    showToast(`${saved.name} loaded.`, "success");
  }

  async function startRun(event: FormEvent) {
    event.preventDefault();
    const criteria = currentSearchCriteria();
    setBusy(true);
    try {
      const response = await fetch("/api/admin/sourcing/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      body: JSON.stringify(criteria),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) throw new Error(data.error || "Could not queue sourcing review.");
      setQuery("");
      await load();
      focusRunList();
      showToast(`${portals.find(([key]) => key === portalKey)?.[1] || "Portal"} search completed.`, "success");
    } catch (error: unknown) { showToast(error instanceof Error ? error.message : "Could not start sourcing review.", "error"); }
    finally { setBusy(false); }
  }

  async function deleteRun(id: string) {
    setPendingDeleteId(id);
  }

  async function confirmDeleteRun() {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    const response = await fetch("/api/admin/sourcing/runs", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) { showToast(data.error || "Could not delete sourcing review.", "error"); return; }
    setSelectedRun(null);
    await load();
    showToast("Sourcing review deleted.", "success");
  }

  return (
    <div className="grid min-w-0 gap-4 overflow-x-hidden sm:gap-6 2xl:grid-cols-[minmax(0,7fr)_minmax(0,13fr)]">
      {busy ? <ViewportPortal><BrandLoader label="Processing portal search..." /></ViewportPortal> : null}
      {pendingDeleteId ? <ViewportPortal><div className="fixed inset-0 z-[120] flex h-dvh items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="delete-review-title"><div className="my-auto w-full max-w-sm rounded-2xl border border-rose-300/25 bg-slate-950 p-5 shadow-2xl"><div className="flex items-start gap-3"><div className="rounded-full bg-rose-300/10 p-2 text-rose-200"><AlertTriangle className="h-5 w-5" /></div><div><h2 id="delete-review-title" className="font-semibold text-white">Delete this review?</h2><p className="mt-2 text-sm leading-6 text-white/60">This will permanently remove the review and its stored opportunity results.</p></div></div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setPendingDeleteId(null)} className="cursor-pointer rounded-lg border border-white/15 px-3 py-2 text-sm text-white/75 hover:bg-white/10">Cancel</button><button type="button" onClick={() => void confirmDeleteRun()} className="cursor-pointer rounded-lg bg-rose-500 px-3 py-2 text-sm font-medium text-white hover:bg-rose-400">Delete review</button></div></div></div></ViewportPortal> : null}
      {selectedRun ? <SourcingReviewModal run={selectedRun} onClose={() => setSelectedRun(null)} onDelete={() => void deleteRun(selectedRun.id)} /> : null}
      {toast ? <PremiumToast message={toast.msg} type={toast.type} /> : null}
      <div className="order-1 grid min-w-0 gap-4 2xl:order-1 2xl:gap-5">
        <section className="min-w-0 rounded-3xl border border-emerald-300/15 bg-emerald-300/[0.05] p-4 sm:p-5">
           <div className="flex items-center justify-between gap-3"><div><div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200/70">Saved criteria</div><p className="mt-2 text-sm leading-6 text-white/55">Manage and reuse complete search criteria saved for this business.</p></div><Link href="/admin/sourcing/saved-searches" className={cx(BTN.outline, "shrink-0 cursor-pointer !rounded-lg !px-3 !py-2 text-xs")}>Open saved criteria</Link></div>
           </section>
         <section className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.06] p-4 sm:p-5">
           <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Portal setup</div>
           <h2 className="mt-2 text-lg font-semibold text-white">Choose where to search</h2>
           <p className="mt-2 text-sm leading-6 text-white/60">Select a portal for the search fields below. Portal access credentials are managed separately and are only needed where a portal requires them.</p>
           <div className="mt-5 border-t border-white/10 pt-4"><StyledSelect label="Search portal" value={portalKey} onChange={(value) => { setPortalKey(value); setCanadaBuysSelected(value === "canada-buys"); setNoticeTypes([]); setSetAsides([]); setGeography(""); setCategories([]); setBidTypes([]); setProcurementStages([]); setValueRanges([]); setCommercialTools([]); }} options={portals.map(([key, name]) => [key, `${name}${key === "acquisition-gateway" ? " (forecast)" : !activeSearchPortals.includes(key) ? " (coming soon)" : ""}`] as [string, string])} /><p className="mt-2 text-xs leading-5 text-white/45">Search fields adapt to the selected portal. Find a Tender uses UK procurement stages, CPV, suitability, contract value, and commercial tools. Ontario Tenders Portal uses project info, buyer, UNSPSC, work category, procurement route, project type, and dates.</p><details className="mt-3 rounded-xl border border-white/10 bg-slate-950/40 p-3"><summary className="cursor-pointer text-xs font-medium text-white/70">Manage portal access</summary><form onSubmit={saveConnection} className="mt-3 grid gap-2"><input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Portal username or email" className="w-full min-w-0 rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-white/35" autoComplete="off" /><input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Portal password" type="password" className="w-full min-w-0 rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-white/35" autoComplete="new-password" /><button className={cx(BTN.primary, "w-full cursor-pointer justify-center px-3 py-2 text-xs")} disabled={busy || !username.trim() || !password}>{busy ? "Saving..." : "Save access"}</button></form>{connections.length ? <div className="mt-3 grid gap-2">{connections.map((connection) => <label key={connection.id} className="flex min-w-0 items-center gap-2 text-xs text-white/70"><input type="checkbox" checked={selected.includes(connection.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, connection.id] : current.filter((id) => id !== connection.id))} className="accent-emerald-400" /><span className="min-w-0 truncate">{connection.portalName} - {connection.username}</span></label>)}</div> : null}</details></div>
         </section>
         <section className="hidden min-w-0 rounded-3xl border border-white/10 bg-white/[0.06] p-4 sm:p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Portal connections</div>
          <h2 className="mt-2 text-xl font-semibold">Choose where Euman should look</h2>
          <p className="mt-2 text-sm leading-6 text-white/60">Credentials are encrypted on the server and never shown again after saving. Start with portals that permit this kind of access under your account terms.</p>
          <form onSubmit={saveConnection} className="mt-5 grid gap-3">
            <label className="grid gap-1.5 text-xs font-medium text-white/60">Portal<select value={portalKey} onChange={(event) => setPortalKey(event.target.value)} className="w-full min-w-0 cursor-pointer appearance-none rounded-2xl border border-white/15 bg-slate-950 px-4 py-3 text-sm text-white">
              {portals.map(([key, name]) => <option key={key} value={key}>{name}</option>)}
            </select></label>
            <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Portal username or email" className="rounded-2xl border border-white/15 bg-slate-950 px-4 py-3 text-white placeholder:text-white/35" autoComplete="off" />
            <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Portal password" type="password" className="rounded-2xl border border-white/15 bg-slate-950 px-4 py-3 text-white placeholder:text-white/35" autoComplete="new-password" />
            <button className={cx(BTN.primary, "justify-self-start px-4 py-2 text-sm")} disabled={busy || !username.trim() || !password}>{busy ? "Saving..." : "Save connection"}</button>
          </form>
          <div className="mt-6 grid gap-3">
            <label className="flex items-center gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-50">
              <input type="checkbox" checked={canadaBuysSelected} onChange={(event) => setCanadaBuysSelected(event.target.checked)} className="h-4 w-4 accent-emerald-400" />
              <span><span className="block font-medium">CanadaBuys public search</span><span className="block text-xs text-emerald-100/70">No portal login is needed to browse tender notices.</span></span>
            </label>
            {connections.length === 0 ? <p className="rounded-2xl border border-dashed border-white/15 p-4 text-sm text-white/55">No authenticated portals connected yet. CanadaBuys can still be searched publicly.</p> : connections.map((connection) => (
              <div key={connection.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                <label className="flex min-w-0 items-center gap-3">
                  <input type="checkbox" checked={selected.includes(connection.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, connection.id] : current.filter((id) => id !== connection.id))} className="h-4 w-4 accent-emerald-400" />
                  <span className="min-w-0"><span className="block font-medium text-white">{connection.portalName}</span><span className="block truncate text-xs text-white/50">{connection.username} · {connection.status}</span></span>
                </label>
                <button type="button" onClick={() => void removeConnection(connection.id)} className="cursor-pointer rounded-lg px-3 py-2 text-xs text-rose-200 hover:bg-rose-400/10">Remove</button>
              </div>
            ))}
          </div>
        </section>
        <section className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.06] p-4 sm:p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Opportunity search</div>
          <h2 className="mt-2 break-words text-xl font-semibold">Find procurement opportunities</h2>
          <p className="mt-2 text-sm leading-6 text-white/60">Search selected portals using a short brief and optional filters. Every result remains subject to human review.</p>
          <form onSubmit={startRun} className="mt-5 grid gap-3">
            <div className="hidden rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.06] p-4">
              <div className="flex flex-wrap items-end gap-2">
                <label className="min-w-0 flex-1"><span className="mb-1.5 block text-xs font-medium text-white/65">Saved search</span><select defaultValue="" onChange={(event) => loadSavedSearch(event.target.value)} className="w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white"><option value="">Load saved criteria...</option>{savedSearches.map((saved) => <option key={saved.id} value={saved.id}>{saved.name}</option>)}</select></label>
              </div>
              <p className="mt-2 text-xs leading-5 text-white/45">Saved searches belong to this business and can be reused by the internal team.</p>
            </div>
            <label className="grid gap-1.5 text-xs font-medium text-white/60">Optional free-text search<textarea value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Optional: describe the opportunity or leave blank to search by the criteria below." className="min-h-24 w-full min-w-0 rounded-2xl border border-white/15 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-white/35" /></label>
             <label className="grid gap-1.5 text-xs font-medium text-white/60"><span>{portalKey === "ontario-tenders" ? "Project information" : "Optional keywords"}</span><input value={keywords} onChange={(event) => setKeywords(event.target.value)} placeholder={portalKey === "ontario-tenders" ? "Project title, reference, or description" : "Comma separated: proposal, training, recruitment"} className="rounded-2xl border border-white/15 bg-slate-950 px-4 py-3 text-white placeholder:text-white/35" /></label>
             {portalKey === "ontario-tenders" ? <label className="grid gap-1.5 text-xs font-medium text-white/60"><span>Buyer organization</span><input value={buyerKeywords} onChange={(event) => setBuyerKeywords(event.target.value)} placeholder="e.g., Ministry of Health" className="rounded-2xl border border-white/15 bg-slate-950 px-4 py-3 text-white placeholder:text-white/35" /></label> : null}
             {supportsCodes ? <div className="grid gap-3 sm:grid-cols-2">{["find-a-tender", "contracts-finder", "ted"].includes(portalKey) ? <MultiSelect label={codeLabel} placeholder="All CPV codes" options={findATenderCpvCodes} values={csvValues(industryCodes)} onChange={(values) => setIndustryCodes(values.join(", "))} allowCustom customPattern={/^\d{8}$/} customLabel="CPV code" /> : <MultiSelect label={codeLabel} placeholder={`Select ${codeLabel.toLowerCase()}`} options={sourcingOptions.unspsc} values={csvValues(industryCodes)} onChange={(values) => setIndustryCodes(values.join(", "))} />}{isSamGov || portalKey === "acquisition-gateway" ? <MultiSelect label={secondaryCodeLabel} placeholder="Select industry codes" options={sourcingOptions.naics} values={csvValues(naicsCodes)} onChange={(values) => setNaicsCodes(values.join(", "))} allowCustom={isSamGov} /> : <div />}</div> : null}
             <MultiSelect label={portalKey === "find-a-tender" || portalKey === "contracts-finder" ? "UK contract location" : isSamGov ? "Place of performance (state)" : portalKey === "ted" ? "EU contract location" : "Location"} placeholder={portalKey === "find-a-tender" || portalKey === "contracts-finder" ? "All UK locations" : isSamGov ? "Select US states" : portalKey === "ted" ? "All EU locations" : "Select provinces, territories, or Canada-wide"} options={portalKey === "find-a-tender" || portalKey === "contracts-finder" ? findATenderLocations : portalGeography} values={csvValues(geography)} onChange={(values) => setGeography(values.join(", "))} />
            <div className="grid gap-3 sm:grid-cols-2"><label className="grid gap-1.5 text-xs font-medium text-white/60">Published from<input type="date" value={publishedFrom} onChange={(event) => setPublishedFrom(event.target.value)} className="w-full min-w-0 cursor-pointer rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white" /></label><label className="grid gap-1.5 text-xs font-medium text-white/60">Published to<input type="date" value={publishedTo} onChange={(event) => setPublishedTo(event.target.value)} className="w-full min-w-0 cursor-pointer rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white" /></label><label className="grid gap-1.5 text-xs font-medium text-white/60">Closing from<input type="date" value={closingFrom} onChange={(event) => setClosingFrom(event.target.value)} className="w-full min-w-0 cursor-pointer rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white" /></label><label className="grid gap-1.5 text-xs font-medium text-white/60">Closing to<input type="date" value={closingTo} onChange={(event) => setClosingTo(event.target.value)} className="w-full min-w-0 cursor-pointer rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white" /></label></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <StyledSelect label="Publication window" value={publishedWindow} onChange={setPublishedWindow} options={[["", "Any publication date"], ["1d", "Published last day"], ["2d", "Published last 2 days"], ["3d", "Published last 3 days"], ["7d", "Published last week"], ["14d", "Published last 2 weeks"], ["30d", "Published last month"], ["90d", "Published last 3 months"]]} />
              <StyledSelect label="Closing window" value={closingWindow} onChange={setClosingWindow} options={[["", "Any closing date"], ["today", "Closing today"], ["2d", "Closing next 2 days"], ["3d", "Closing next 3 days"], ["7d", "Closing next week"], ["14d", "Closing next 2 weeks"], ["30d", "Closing next month"], ["90d", "Closing next 3 months"]]} />
            </div>
             <div className="grid gap-2 sm:grid-cols-2">{supportsSectors ? <MultiSelect label="Sector" placeholder="All sectors" options={sourcingOptions.sectors} values={sectors} onChange={setSectors} /> : null}<MultiSelect label={portalKey === "find-a-tender" ? "Open opportunities" : "Notice status"} placeholder={portalKey === "find-a-tender" ? "Open opportunities only" : "Open notices"} options={portalKey === "find-a-tender" ? [{ value: "open", label: "Open opportunities only" }] : sourcingOptions.statuses} values={statuses} onChange={setStatuses} /></div>
             {portalKey === "find-a-tender" ? <><MultiSelect label="Procurement stage" placeholder="All procurement stages" options={findATenderStages} values={procurementStages} onChange={setProcurementStages} /><div className="grid gap-3 sm:grid-cols-2"><MultiSelect label="Notice type" placeholder="All notice types" options={findATenderNoticeTypes} values={noticeTypes} onChange={setNoticeTypes} /><MultiSelect label="Suitability" placeholder="All suitability options" options={findATenderSuitability} values={setAsides} onChange={setSetAsides} /></div><div className="grid gap-3 sm:grid-cols-2"><MultiSelect label="Contract value" placeholder="All contract values" options={findATenderValueRanges} values={valueRanges} onChange={setValueRanges} /><MultiSelect label="Commercial tool" placeholder="All commercial tools" options={findATenderCommercialTools} values={commercialTools} onChange={setCommercialTools} /></div></> : null}
             {portalKey === "ted" ? <div className="grid gap-3 sm:grid-cols-2"><MultiSelect label="TED notice type" placeholder="All notice types" options={sourcingOptions.noticeTypes} values={noticeTypes} onChange={setNoticeTypes} /><MultiSelect label="Procurement stage" placeholder="All stages" options={[{ value: "tender", label: "Tender" }, { value: "planning", label: "Planning" }, { value: "award", label: "Award" }]} values={procurementStages} onChange={setProcurementStages} /></div> : null}
             {portalKey === "merx" ? <MultiSelect label="MERX category" placeholder="All MERX categories" options={merxCategories} values={categories} onChange={setCategories} /> : null}
             {portalKey === "bids-and-tenders" ? <MultiSelect label="Bid type" placeholder="All bid types" options={bidsAndTendersTypes} values={bidTypes} onChange={setBidTypes} /> : null}
             {portalKey === "ontario-tenders" ? <><MultiSelect label="Work category" placeholder="All work categories" options={ontarioWorkCategories} values={categories} onChange={setCategories} /><div className="grid gap-3 sm:grid-cols-2"><MultiSelect label="Procurement route" placeholder="All procurement routes" options={ontarioProcurementRoutes} values={bidTypes} onChange={setBidTypes} /><MultiSelect label="Project type" placeholder="All project types" options={ontarioProjectTypes} values={noticeTypes} onChange={setNoticeTypes} /></div></> : null}
             {portalKey !== "find-a-tender" && portalKey !== "ontario-tenders" && (supportsNoticeTypes || supportsSetAsides) ? <div className="grid gap-4 sm:grid-cols-2">{supportsNoticeTypes ? <MultiSelect label={isSamGov ? "SAM.gov notice type" : "Notice type"} placeholder="All notice types" options={portalNoticeTypes} values={noticeTypes} onChange={setNoticeTypes} /> : <div />}{supportsSetAsides ? <MultiSelect label={isSamGov ? "SAM.gov set-aside" : "Set-aside / acquisition strategy"} placeholder="All eligibility options" options={portalSetAsides} values={setAsides} onChange={setSetAsides} /> : null}</div> : null}
            <button className={cx(BTN.primary, "w-full justify-center px-4 py-2 text-sm sm:w-auto")} disabled={busy || !hasSearchCriteria() || !activeSearchPortals.includes(portalKey)}>{busy ? "Searching..." : `Search ${portals.find(([key]) => key === portalKey)?.[1] || "portal"}`}</button>
          </form>
        </section>
      </div>
      <div className="order-2 grid min-w-0 gap-6 2xl:order-2">
        <section id="sourcing-runs" className="scroll-mt-6 rounded-3xl border border-white/10 bg-white/[0.06] p-5">
          <div className="flex items-center justify-between gap-3"><div><div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Review queue</div><h2 className="mt-2 text-xl font-semibold">Sourcing runs</h2></div><span className="text-sm text-white/55">{runs.length} recent</span></div>
          <div className="mt-5 grid gap-3">
            {runs.length === 0 ? <p className="rounded-2xl border border-dashed border-white/15 p-4 text-sm text-white/55">No sourcing reviews queued yet.</p> : runs.map((run) => <div key={run.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-emerald-300/30 hover:bg-white/[0.06]"><div className="flex min-w-0 flex-wrap items-start justify-between gap-3"><div className="min-w-0"><div className="mb-2 inline-flex max-w-full items-center rounded-full border border-sky-300/20 bg-sky-300/10 px-2.5 py-1 text-[11px] font-semibold text-sky-100">{portalNames(run.portalKeys)}</div><div className="break-words font-medium text-white">{run.query || `${portalNames(run.portalKeys)} criteria search`}</div><div className="mt-2 text-xs text-white/50">Decision: {run.decision.replaceAll("_", " ")} · {run.resultCount || 0} {run.resultCount === 1 ? "result" : "results"}</div>{run.status === "completed" && !run.resultCount ? <div className="mt-2 break-words text-xs leading-5 text-amber-200/80">Search completed with no matching opportunities.</div> : null}{run.status === "failed" && run.decisionReason ? <div className="mt-2 break-words text-xs leading-5 text-rose-200/80">{run.decisionReason}</div> : null}</div><span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-xs font-medium capitalize text-emerald-100">{run.status.replaceAll("_", " ")}</span></div><div className="mt-4 flex flex-col gap-2 sm:flex-row"><button type="button" onClick={() => setSelectedRun(run)} className={cx(BTN.primary, "w-full cursor-pointer justify-center !rounded-lg !px-2.5 !py-1.5 text-[11px] sm:w-auto")}>Open review</button><button type="button" onClick={() => void deleteRun(run.id)} className="w-full cursor-pointer rounded-lg border border-rose-300/25 px-2.5 py-1.5 text-[11px] font-medium text-rose-100 transition hover:border-rose-300/45 hover:bg-rose-400/10 sm:w-auto">Delete review</button></div></div>)}
          </div>
        </section>
      </div>
      {selectedRun ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" role="dialog" aria-modal="true" aria-label="Sourcing review"><div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/15 bg-slate-950 p-5 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Sourcing review</div><h2 className="mt-2 text-xl font-semibold text-white">{selectedRun.query || `${portalNames(selectedRun.portalKeys)} criteria search`}</h2></div><button type="button" onClick={() => setSelectedRun(null)} className="cursor-pointer rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10">Close</button></div><div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/70"><div>Status: <span className="text-white">{selectedRun.status}</span> · Decision: <span className="text-white">{selectedRun.decision}</span> · Results: <span className="text-white">{selectedRun.resultCount || 0}</span></div>{selectedRun.status === "completed" && !selectedRun.resultCount ? <p className="mt-2 leading-6 text-amber-200/80">Search completed with no matching opportunities.</p> : null}{selectedRun.decisionReason ? <p className="mt-2 leading-6">{selectedRun.decisionReason}</p> : null}</div>{selectedRun.status === "failed" ? <div className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4 text-sm leading-6 text-rose-100">This run did not produce results. Check the connector response and retry.</div> : null}<div className="mt-4 grid gap-3">{selectedRun.results?.length ? selectedRun.results.map((result, index) => <a key={`${selectedRun.id}-modal-${index}`} href={result.url || "#"} target="_blank" rel="noreferrer" className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.08]"><div className="font-medium text-white">{result.title || "Untitled opportunity"}</div><div className="mt-2 text-xs text-white/55">Preliminary fit: {result.fitScore ?? 0}% · {result.preliminaryDecision?.replace("_", " ") || "review"}</div></a>) : <p className="rounded-2xl border border-dashed border-white/15 p-4 text-sm text-white/55">No matching opportunities were found for this search.</p>}</div><button type="button" onClick={() => void deleteRun(selectedRun.id)} className="mt-5 cursor-pointer rounded-xl border border-rose-300/25 px-4 py-2 text-sm text-rose-100 hover:bg-rose-400/10">Delete review</button></div></div> : null}
    </div>
  );
}
