const ONTARIO_TENDERS_SEARCH = "https://ontariotenders.bravosolution.com/esop/guest/go/public/opportunity/current?locale=en_CA&customLoginPage=/esop/nac-host/public/web/login.html&customGuest=";

export type OntarioTendersResult = {
  externalId: string;
  title: string;
  url: string;
  source: "ontario-tenders";
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
  buyerKeywords?: string[];
  industryCodes?: string[];
  categories?: string[];
  bidTypes?: string[];
  noticeTypes?: string[];
  publishedFrom?: string;
  publishedTo?: string;
  closingFrom?: string;
  closingTo?: string;
};

function text(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function cell(block: string, index: number) {
  return text([...block.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)][index]?.[1] || "");
}

function href(block: string) {
  const value = block.match(/<a[^>]+href=["']([^"']+)["']/i)?.[1] || "";
  return value ? new URL(value, ONTARIO_TENDERS_SEARCH).toString() : "";
}

function withinDates(value: string, from?: string, to?: string) {
  if (!from && !to) return true;
  const date = new Date(value.split(" ")[0].split("/").reverse().join("-"));
  if (Number.isNaN(date.getTime())) return true;
  if (from && date < new Date(`${from}T00:00:00`)) return false;
  if (to && date > new Date(`${to}T23:59:59`)) return false;
  return true;
}

export async function searchOntarioTenders(query: string, options: SearchOptions = {}): Promise<OntarioTendersResult[]> {
  const projectSearch = [query, ...(options.keywords || [])].filter(Boolean).join(" ");
  const headers = {
    Accept: "text/html,application/xhtml+xml",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
  };
  const initial = await fetch(ONTARIO_TENDERS_SEARCH, { headers, redirect: "manual", cache: "no-store" });
  const cookies = initial.headers.getSetCookie?.().map((cookie) => cookie.split(";", 1)[0]).join("; ") || "";
  const location = initial.headers.get("location");
  const response = location
    ? await fetch(new URL(location, ONTARIO_TENDERS_SEARCH), { headers: { ...headers, ...(cookies ? { Cookie: cookies } : {}) }, redirect: "follow", cache: "no-store" })
    : initial;
  if (!response.ok) throw new Error(`Ontario Tenders Portal public search is temporarily unavailable (HTTP ${response.status}).`);
  const html = await response.text();
  const terms = projectSearch.toLowerCase().split(/\s+/).filter(Boolean);
  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((match) => match[0]).filter((row) => /<td/i.test(row));
  return rows.map((row) => {
    const procurementRoute = cell(row, 0);
    void procurementRoute;
    const organization = cell(row, 1);
    const referenceNumber = cell(row, 2);
    const title = cell(row, 3) || "Ontario Tenders Portal opportunity";
    const publishedDate = cell(row, 4);
    const category = cell(row, 5);
    const closingDate = cell(row, 6);
    const url = href(row);
    const searchable = `${organization} ${title} ${category}`.toLowerCase();
    const matched = terms.filter((term) => searchable.includes(term)).length;
    return {
      externalId: url || referenceNumber || `${organization}-${title}`,
      title,
      url: url || "https://ontariotenders.bravosolution.com/esop/guest/login.do",
      source: "ontario-tenders" as const,
      referenceNumber,
      status: "open",
      category: category || "Ontario public procurement",
      publishedDate,
      closingDate,
      organization,
      unspsc: "",
      gsin: "",
      description: `${organization}${category ? ` · ${category}` : ""}`,
      attachmentUrl: "",
      fitScore: Math.min(100, Math.round((matched / Math.max(terms.length, 1)) * 100)),
      preliminaryDecision: matched > 0 || !terms.length ? "possible_fit" as const : "low_fit" as const,
    };
  }).filter((result) =>
    (!terms.length || terms.some((term) => `${result.title} ${result.organization} ${result.category}`.toLowerCase().includes(term))) &&
    (!options.buyerKeywords?.length || options.buyerKeywords.some((term) => result.organization.toLowerCase().includes(term.toLowerCase()))) &&
    (!options.categories?.length || options.categories.some((term) => result.category.toLowerCase().includes(term.toLowerCase()))) &&
    withinDates(result.publishedDate, options.publishedFrom, options.publishedTo) &&
    withinDates(result.closingDate, options.closingFrom, options.closingTo)
  ).slice(0, 50);
}
