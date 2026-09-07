const MERX_OPEN_SOLICITATIONS = "https://www.merx.com/public/solicitations/open";

export type MerxResult = {
  externalId: string;
  title: string;
  url: string;
  source: "merx";
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

type MerxSearchOptions = {
  keywords?: string[];
  categories?: string[];
  geography?: string[];
  statuses?: string[];
  publishedFrom?: string;
  publishedTo?: string;
  closingFrom?: string;
  closingTo?: string;
  publishedWindow?: string;
  closingWindow?: string;
};

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x2F;|&#47;/g, "/")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function textFromHtml(value: string) {
  return decodeHtml(value.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function firstMatch(value: string, pattern: RegExp) {
  return value.match(pattern)?.[1] ? textFromHtml(value.match(pattern)?.[1] || "") : "";
}

function parseDate(value: string) {
  const parsed = new Date(value.replace(/\//g, "-"));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function withinDates(value: string, from?: string, to?: string) {
  const date = parseDate(value);
  if (!date) return !from && !to;
  if (from && date < new Date(`${from}T00:00:00`)) return false;
  if (to && date > new Date(`${to}T23:59:59`)) return false;
  return true;
}

function withinWindow(value: string, window: string, mode: "past" | "future") {
  if (!window) return true;
  const date = parseDate(value);
  if (!date) return false;
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

export async function searchMerx(query: string, options: MerxSearchOptions = {}): Promise<MerxResult[]> {
  const requestedTerms = [query, ...(options.keywords || [])].join(" ").match(/[a-z0-9]{2,}/gi) || [];
  const url = new URL(MERX_OPEN_SOLICITATIONS);
  url.searchParams.set("keywords", [query, ...(options.keywords || [])].filter(Boolean).join(" "));
  if (options.categories?.length) url.searchParams.set("category", options.categories.join(","));
  url.searchParams.set("solSearchStatus", "openSolicitationsTab");

  const response = await fetch(url, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-CA,en;q=0.8",
      "User-Agent": "Mozilla/5.0 (compatible; EumanIntelligence/1.0; +https://eumanai.com)",
    },
    redirect: "follow",
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`MERX public search is temporarily unavailable (HTTP ${response.status}).`);

  const html = await response.text();
  const matches = [...html.matchAll(/<a[^>]+href="([^"]+)"[^>]+class="[^"]*solicitation-link[^"]*"[\s\S]*?<\/a>/gi)];
  return matches.map((match) => {
    const block = match[0];
    const title = firstMatch(block, /class="rowTitle"[^>]*>([\s\S]*?)<\/span>/i) || "MERX tender opportunity";
    const organization = firstMatch(block, /class="buyer-name"[^>]*>([\s\S]*?)<\/span>/i);
    const location = firstMatch(block, /class="location"[^>]*>([\s\S]*?)<\/span>/i);
    const publishedDate = firstMatch(block, /class="publicationDate"[\s\S]*?class="dateValue"[^>]*>([\s\S]*?)<\/span>/i);
    const closingDate = firstMatch(block, /class="closingDate[^"]*"[\s\S]*?class="dateValue"[^>]*>([\s\S]*?)<\/span>/i);
    const referenceNumber = firstMatch(block, /class="accessibility-hidden"[^>]*>([\s\S]*?)<\/span>/i);
    const noticeUrl = new URL(match[1], MERX_OPEN_SOLICITATIONS).toString();
    const searchable = `${title} ${organization} ${location} ${block}`.toLowerCase();
    const matchesFound = requestedTerms.filter((term) => searchable.includes(term.toLowerCase())).length;
    const fitScore = Math.min(100, Math.round((matchesFound / Math.max(requestedTerms.length, 1)) * 100));
    return {
      externalId: referenceNumber || noticeUrl,
      title,
      url: noticeUrl,
      source: "merx" as const,
      referenceNumber,
      status: "open",
      category: "MERX public solicitation",
      publishedDate,
      closingDate,
      organization,
      unspsc: "",
      gsin: "",
      description: `${organization}${location ? ` · ${location}` : ""}`,
      attachmentUrl: "",
      fitScore,
      preliminaryDecision: fitScore >= 35 ? "possible_fit" as const : "low_fit" as const,
    };
  }).filter((result) =>
    // MERX already applies the keyword search server-side. Keep its relevant
    // results instead of requiring an exact local text match (for example,
    // "staffing" can legitimately return "staffed" notices).
    hasAny(result.description, options.geography || []) &&
    (!options.statuses?.length || options.statuses.some((status) => status.toLowerCase() === "open")) &&
    withinDates(result.publishedDate, options.publishedFrom, options.publishedTo) &&
    withinDates(result.closingDate, options.closingFrom, options.closingTo) &&
    withinWindow(result.publishedDate, options.publishedWindow || "", "past") &&
    withinWindow(result.closingDate, options.closingWindow || "", "future")
  ).slice(0, 50);
}
