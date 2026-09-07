const CONTRACTS_FINDER_SEARCH = "https://www.contractsfinder.service.gov.uk/Published/Notices/OCDS/Search";

export type ContractsFinderResult = {
  externalId: string;
  title: string;
  url: string;
  source: "contracts-finder";
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
  publishedFrom?: string;
  publishedTo?: string;
  closingFrom?: string;
  closingTo?: string;
  publishedWindow?: string;
  closingWindow?: string;
};

type Release = {
  id?: string;
  date?: string;
  tag?: string[];
  tender?: {
    id?: string;
    title?: string;
    description?: string;
    status?: string;
    mainProcurementCategory?: string;
    classification?: { id?: string; description?: string };
    additionalClassifications?: Array<{ id?: string; description?: string }>;
    tenderPeriod?: { endDate?: string };
    items?: Array<{ deliveryAddresses?: Array<{ countryName?: string; region?: string; postalCode?: string }> }>;
    documents?: Array<{ url?: string }>;
  };
  buyer?: { name?: string };
  parties?: Array<{ name?: string; roles?: string[] }>;
};

function dateInRange(value: string, from?: string, to?: string) {
  if (!value) return !from && !to;
  const date = new Date(value).getTime();
  if (Number.isNaN(date)) return false;
  return (!from || date >= new Date(`${from}T00:00:00Z`).getTime()) && (!to || date <= new Date(`${to}T23:59:59Z`).getTime());
}

function inWindow(value: string, window: string, future: boolean) {
  if (!window) return true;
  const date = new Date(value).getTime();
  if (Number.isNaN(date)) return false;
  const days = ({ "24h": 1, "1d": 1, "2d": 2, "3d": 3, "7d": 7, "14d": 14, "30d": 30, "90d": 90 } as Record<string, number>)[window] || 30;
  const now = new Date();
  const start = future ? new Date(new Date().setHours(0, 0, 0, 0)).getTime() : now.getTime() - days * 86400000;
  const end = future ? start + days * 86400000 : now.getTime();
  return date >= start && date <= end;
}

function includesAny(text: string, values: string[]) {
  if (!values.length) return true;
  const lower = text.toLowerCase();
  return values.some((value) => lower.includes(value.toLowerCase()));
}

export async function searchContractsFinder(query: string, options: SearchOptions = {}): Promise<ContractsFinderResult[]> {
  const url = new URL(CONTRACTS_FINDER_SEARCH);
  const now = new Date();
  const publishedFrom = options.publishedFrom || new Date(now.getTime() - 90 * 86400000).toISOString().slice(0, 10);
  const publishedTo = options.publishedTo || now.toISOString().slice(0, 10);
  url.searchParams.set("publishedFrom", publishedFrom);
  url.searchParams.set("publishedTo", publishedTo);
  url.searchParams.set("stages", "tender");
  url.searchParams.set("size", "100");
  url.searchParams.set("page", "1");
  const response = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0 (compatible; EumanIntelligence/1.0; +https://eumanai.com)" }, cache: "no-store" });
  if (!response.ok) throw new Error(`Contracts Finder public data is temporarily unavailable (HTTP ${response.status}).`);
  const payload = await response.json() as { releases?: Release[] };
  const terms = [query, ...(options.keywords || [])].join(" ").match(/[a-z0-9]{2,}/gi) || [];
  return (payload.releases || []).map((release) => {
    const tender = release.tender || {};
    const addresses = (tender.items || []).flatMap((item) => item.deliveryAddresses || []);
    const location = addresses.map((address) => [address.countryName, address.region, address.postalCode].filter(Boolean).join(" ")).filter(Boolean).join("; ");
    const codes = [tender.classification?.id, ...(tender.additionalClassifications || []).map((classification) => classification.id)].filter(Boolean) as string[];
    const buyer = release.buyer?.name || release.parties?.find((party) => party.roles?.includes("buyer"))?.name || "";
    const title = tender.title || "Contracts Finder opportunity";
    const description = tender.description || "";
    const searchable = [title, description, buyer, location, tender.classification?.description, ...codes].filter(Boolean).join(" ");
    const matched = terms.filter((term) => searchable.toLowerCase().includes(term.toLowerCase())).length;
    const fitScore = Math.min(100, Math.round((matched / Math.max(terms.length, 1)) * 100));
    const id = release.id || tender.id || "";
    return { externalId: id, title, url: `https://www.contractsfinder.service.gov.uk/Notice/${id}`, source: "contracts-finder" as const, referenceNumber: tender.id || id, status: tender.status || "active", category: tender.mainProcurementCategory || "UK public procurement", publishedDate: tenderDate(release.date), closingDate: tender.tenderPeriod?.endDate || "", organization: buyer, unspsc: "", gsin: codes.join(", "), description: location ? `${description}${description ? " " : ""}${location}` : description, attachmentUrl: tender.documents?.[0]?.url || "", fitScore, preliminaryDecision: (fitScore >= 35 ? "possible_fit" : "low_fit") as "possible_fit" | "low_fit" };
  }).filter((result) => {
    const active = !options.statuses?.length || options.statuses.includes("open") ? result.status.toLowerCase() === "active" || result.status.toLowerCase() === "open" : options.statuses.some((status) => result.status.toLowerCase().includes(status.toLowerCase()));
    return active && includesAny(`${result.title} ${result.description} ${result.organization} ${result.gsin}`, terms) && includesAny(`${result.description} ${result.organization} ${result.gsin}`, options.industryCodes || []) && includesAny(`${result.description} ${result.organization}`, options.geography || []) && dateInRange(result.publishedDate, options.publishedFrom, options.publishedTo) && dateInRange(result.closingDate, options.closingFrom, options.closingTo) && inWindow(result.publishedDate, options.publishedWindow || "", false) && inWindow(result.closingDate, options.closingWindow || "", true);
  }).slice(0, 50);
}

function tenderDate(value?: string) {
  return value || "";
}
