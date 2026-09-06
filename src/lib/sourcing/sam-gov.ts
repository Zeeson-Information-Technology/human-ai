const SAM_OPPORTUNITIES_API = "https://api.sam.gov/opportunities/v2/search";

export type SamGovResult = {
  externalId: string;
  title: string;
  url: string;
  source: "sam-gov";
  referenceNumber: string;
  status: string;
  category: string;
  setAside: string;
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
  classificationCodes?: string[];
  geography?: string[];
  statuses?: string[];
  noticeTypes?: string[];
  setAsides?: string[];
  publishedFrom?: string;
  publishedTo?: string;
  closingFrom?: string;
  closingTo?: string;
  publishedWindow?: string;
  closingWindow?: string;
};

type SamOpportunity = {
  noticeId?: string;
  title?: string;
  solicitationNumber?: string;
  department?: string;
  subTier?: string;
  office?: string;
  postedDate?: string;
  responseDeadLine?: string;
  type?: string;
  typeOfSetAside?: string;
  typeOfSetAsideDescription?: string;
  naicsCode?: string;
  classificationCode?: string;
  placeOfPerformance?: { city?: { name?: string }; state?: { code?: string; name?: string }; country?: { name?: string } };
  description?: string;
  uiLink?: string;
  resourceLinks?: string[];
};

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

function samDate(value?: string) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${date.getFullYear()}`;
}

function samDateRange(from?: string, to?: string) {
  const today = new Date();
  const todayValue = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const endValue = to || todayValue;
  const end = new Date(`${endValue}T00:00:00Z`);
  const start = from ? new Date(`${from}T00:00:00Z`) : new Date(end.getTime() - 364 * 24 * 60 * 60 * 1000);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { from: samDate(from), to: samDate(to) };
  }
  const boundedStart = start > end
    ? new Date(end.getTime() - 364 * 24 * 60 * 60 * 1000)
    : new Date(Math.max(start.getTime(), end.getTime() - 364 * 24 * 60 * 60 * 1000));
  return {
    from: samDate(boundedStart.toISOString().slice(0, 10)),
    to: samDate(endValue),
  };
}

export async function searchSamGov(query: string, options: SearchOptions = {}): Promise<SamGovResult[]> {
  const apiKey = process.env.SAM_GOV_API_KEY?.trim();
  if (!apiKey) throw new Error("SAM.gov requires a server-side public API key. Add SAM_GOV_API_KEY to the environment before searching.");
  const terms = [query, ...(options.keywords || [])].filter(Boolean);
  const url = new URL(SAM_OPPORTUNITIES_API);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("limit", "100");
  url.searchParams.set("offset", "0");
  if (query.trim()) url.searchParams.set("q", query.trim());
  const postedRange = samDateRange(options.publishedFrom, options.publishedTo);
  url.searchParams.set("postedFrom", postedRange.from);
  url.searchParams.set("postedTo", postedRange.to);
  if (options.closingFrom || options.closingTo) {
    const closingRange = samDateRange(options.closingFrom, options.closingTo);
    url.searchParams.set("rdlfrom", closingRange.from);
    url.searchParams.set("rdlto", closingRange.to);
  }
  const naicsCodes = (options.industryCodes || []).map((code) => code.trim()).filter((code) => /^\d{2,6}$/.test(code));
  const classificationCodes = (options.classificationCodes || []).map((code) => code.trim()).filter(Boolean);
  if (naicsCodes.length) url.searchParams.set("ncode", naicsCodes.join(","));
  if (classificationCodes.length) url.searchParams.set("ccode", classificationCodes.join(","));
  if (options.noticeTypes?.length) options.noticeTypes.forEach((type) => url.searchParams.append("ptype", type));
  if (options.setAsides?.length) url.searchParams.set("typeOfSetAside", options.setAsides[0]);
  if (options.geography?.length) url.searchParams.set("state", options.geography[0]);

  const response = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "EumanIntelligence/1.0" }, cache: "no-store" });
  if (!response.ok) {
    const detail = (await response.text()).replace(/\s+/g, " ").trim().slice(0, 180);
    if (response.status === 401 || response.status === 403) throw new Error("SAM.gov rejected the API key. Check that SAM_GOV_API_KEY is valid and active.");
    if (response.status === 429) {
      const retryMatch = detail.match(/nextAccessTime[\"']?\s*:\s*[\"']([^\"']+)/i);
      const retryAt = retryMatch?.[1] ? new Date(retryMatch[1]) : null;
      const retryLabel = retryAt && !Number.isNaN(retryAt.getTime())
        ? ` Try again after ${retryAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC.`
        : " Try again later.";
      throw new Error(`SAM.gov rate limit reached.${retryLabel}`);
    }
    throw new Error(`SAM.gov public search is temporarily unavailable (HTTP ${response.status})${detail ? `: ${detail}` : "."}`);
  }
  const payload = await response.json() as { opportunitiesData?: SamOpportunity[] };
  return (payload.opportunitiesData || []).map((item) => {
    const location = [item.placeOfPerformance?.city?.name, item.placeOfPerformance?.state?.code, item.placeOfPerformance?.state?.name, item.placeOfPerformance?.country?.name].filter(Boolean).join(", ");
    const organization = [item.department, item.subTier, item.office].filter(Boolean).join(" · ");
    const description = item.description || "";
    const searchable = [item.title, description, organization, location, item.naicsCode, item.classificationCode, item.typeOfSetAside, item.typeOfSetAsideDescription].filter(Boolean).join(" ");
    const matched = terms.filter((term) => searchable.toLowerCase().includes(term.toLowerCase())).length;
    const fitScore = Math.min(100, Math.round((matched / Math.max(terms.length, 1)) * 100));
    return {
      externalId: item.noticeId || item.solicitationNumber || item.uiLink || item.title || "sam-opportunity",
      title: item.title || "SAM.gov contract opportunity",
      url: item.uiLink || `https://sam.gov/opp/${item.noticeId}/view`,
      source: "sam-gov" as const,
      referenceNumber: item.solicitationNumber || item.noticeId || "",
      status: "active",
      category: item.type || "Contract opportunity",
      setAside: [item.typeOfSetAside, item.typeOfSetAsideDescription].filter(Boolean).join(" "),
      publishedDate: item.postedDate || "",
      closingDate: item.responseDeadLine || "",
      organization,
      unspsc: item.classificationCode || "",
      gsin: item.naicsCode || "",
      description,
      attachmentUrl: item.resourceLinks?.[0] || "",
      fitScore,
      preliminaryDecision: fitScore >= 35 ? "possible_fit" as const : "low_fit" as const,
      searchable,
      location,
    };
  }).filter((result) =>
    hasAny(result.searchable, terms) &&
    hasAny(result.location, options.geography || []) &&
    hasAny(result.setAside, options.setAsides || []) &&
    (!options.statuses?.length || options.statuses.some((status) => status === "open" || status === "active")) &&
    withinDates(result.publishedDate, options.publishedFrom, options.publishedTo) &&
    withinDates(result.closingDate, options.closingFrom, options.closingTo) &&
    withinWindow(result.publishedDate, options.publishedWindow || "", "past") &&
    withinWindow(result.closingDate, options.closingWindow || "", "future")
  ).map(({ searchable, location, ...result }) => {
    void searchable;
    void location;
    return result;
  }).slice(0, 50);
}
