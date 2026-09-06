const FIND_A_TENDER_OCDS = "https://www.find-tender.service.gov.uk/api/1.0/ocdsReleasePackages";

export type FindATenderResult = {
  externalId: string;
  title: string;
  url: string;
  source: "find-a-tender";
  referenceNumber: string;
  status: string;
  category: string;
  publishedDate: string;
  closingDate: string;
  organization: string;
  unspsc: string;
  gsin: string;
  description: string;
  attachmentUrl: string;
  fitScore: number;
  preliminaryDecision: "possible_fit" | "low_fit";
};

type SearchOptions = {
  keywords?: string[];
  industryCodes?: string[];
  geography?: string[];
  statuses?: string[];
  noticeTypes?: string[];
  procurementStages?: string[];
  categories?: string[];
  valueRanges?: string[];
  commercialTools?: string[];
  publishedFrom?: string;
  publishedTo?: string;
  closingFrom?: string;
  closingTo?: string;
  publishedWindow?: string;
  closingWindow?: string;
};

type OcdsRelease = {
  id?: string;
  date?: string;
  tag?: string[];
  description?: string;
    tender?: {
    id?: string;
    title?: string;
    status?: string;
    description?: string;
    mainProcurementCategory?: string;
    procurementMethod?: string;
    value?: { amount?: number; currency?: string };
    classification?: { id?: string; description?: string };
    tenderPeriod?: { endDate?: string };
    items?: Array<{ deliveryLocation?: { description?: string }; additionalClassifications?: Array<{ id?: string; description?: string }> }>;
  };
  buyer?: { name?: string };
  parties?: Array<{ name?: string; roles?: string[] }>;
  links?: Array<{ rel?: string; href?: string }>;
};

function decode(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function withinDates(value: string, from?: string, to?: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return !from && !to;
  if (from && date < new Date(`${from}T00:00:00`)) return false;
  if (to && date > new Date(`${to}T23:59:59`)) return false;
  return true;
}

function withinWindow(value: string, window: string, mode: "past" | "future") {
  if (!window) return true;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const days = ({ "24h": 1, "1d": 1, "2d": 2, "3d": 3, "7d": 7, "14d": 14, "30d": 30, "90d": 90, today: 1 } as Record<string, number>)[window] || 30;
  const now = new Date();
  if (mode === "past") return date >= new Date(now.getTime() - days * 24 * 60 * 60 * 1000) && date <= now;
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const upper = new Date(start);
  upper.setDate(upper.getDate() + days);
  return date >= start && date <= upper;
}

function hasAny(value: string, terms: string[]) {
  if (!terms.length) return true;
  const lower = value.toLowerCase();
  return terms.some((term) => lower.includes(term.toLowerCase()));
}

export async function searchFindATender(query: string, options: SearchOptions = {}): Promise<FindATenderResult[]> {
  const terms = [query, ...(options.keywords || [])].join(" ").match(/[a-z0-9]{2,}/gi) || [];
  const url = new URL(FIND_A_TENDER_OCDS);
  url.searchParams.set("limit", "100");
  const stages = options.procurementStages?.filter((stage) => ["planning", "tender", "award", "contract"].includes(stage));
  url.searchParams.set("stages", stages?.length ? stages.join(",") : "tender");
  const response = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0 (compatible; EumanIntelligence/1.0; +https://eumanai.com)" }, cache: "no-store" });
  if (!response.ok) throw new Error(`Find a Tender public data is temporarily unavailable (HTTP ${response.status}).`);
  const payload = await response.json() as { releases?: OcdsRelease[] };
  return (payload.releases || []).map((release) => {
    const tender = release.tender || {};
    const location = (tender.items || []).map((item) => item.deliveryLocation?.description || "").filter(Boolean).join("; ");
    const cpv = tender.classification?.id || "";
    const cpvDescription = tender.classification?.description || "";
    const stage = release.tag?.[0] || "tender";
    const valueAmount = tender.value?.amount;
    const commercialTool = tender.procurementMethod || "";
    const buyer = release.buyer?.name || release.parties?.find((party) => party.roles?.includes("buyer"))?.name || "";
    const noticeUrl = `https://www.find-tender.service.gov.uk/Notice/${release.id || ""}`;
    const searchable = [tender.title, tender.description, release.description, buyer, location, cpv, cpvDescription, stage, commercialTool, ...(release.tag || [])].filter(Boolean).join(" ");
    const matched = terms.filter((term) => searchable.toLowerCase().includes(term.toLowerCase())).length;
    const fitScore = Math.min(100, Math.round((matched / Math.max(terms.length, 1)) * 100));
    return {
      externalId: release.id || tender.id || noticeUrl,
      title: decode(tender.title || "Find a Tender opportunity"),
      url: noticeUrl,
      source: "find-a-tender" as const,
      referenceNumber: release.id || tender.id || "",
      status: tender.status || "active",
      category: tender.mainProcurementCategory || "UK public procurement",
      publishedDate: release.date || "",
      closingDate: tender.tenderPeriod?.endDate || "",
      organization: decode(buyer),
      unspsc: "",
      gsin: cpv,
      description: decode(tender.description || release.description || ""),
      attachmentUrl: "",
      fitScore,
      preliminaryDecision: fitScore >= 35 ? "possible_fit" as const : "low_fit" as const,
      searchable,
      location,
      tags: release.tag || [],
      stage,
      valueAmount,
      commercialTool,
    };
  }).filter((result) =>
    hasAny(result.searchable, terms) &&
    hasAny(`${result.location} ${result.description}`, options.geography || []) &&
    hasAny(result.gsin, options.industryCodes || []) &&
    hasAny(result.category, options.categories || []) &&
    (!options.procurementStages?.length || options.procurementStages.includes(result.stage)) &&
    (!options.commercialTools?.length || options.commercialTools.some((tool) => result.commercialTool.toLowerCase().includes(tool.replaceAll("-", " ").toLowerCase()))) &&
    (!options.valueRanges?.length || options.valueRanges.some((range) => {
      if (typeof result.valueAmount !== "number") return false;
      if (range === "under-25000") return result.valueAmount < 25000;
      if (range === "25000-100000") return result.valueAmount >= 25000 && result.valueAmount <= 100000;
      if (range === "100000-500000") return result.valueAmount > 100000 && result.valueAmount <= 500000;
      if (range === "500000-1000000") return result.valueAmount > 500000 && result.valueAmount <= 1000000;
      return result.valueAmount > 1000000;
    })) &&
    (!options.statuses?.length || options.statuses.some((status) => status === "open" ? result.status === "active" : result.status.toLowerCase().includes(status.toLowerCase()))) &&
    (!options.noticeTypes?.length || options.noticeTypes.some((type) => result.tags.join(" ").toLowerCase().includes(type.toLowerCase()))) &&
    withinDates(result.publishedDate, options.publishedFrom, options.publishedTo) &&
    withinDates(result.closingDate, options.closingFrom, options.closingTo) &&
    withinWindow(result.publishedDate, options.publishedWindow || "", "past") &&
    withinWindow(result.closingDate, options.closingWindow || "", "future")
  ).map(({ searchable, location, tags, stage, valueAmount, commercialTool, ...result }) => {
    void searchable;
    void location;
    void tags;
    void stage;
    void valueAmount;
    void commercialTool;
    return result;
  }).slice(0, 50);
}
