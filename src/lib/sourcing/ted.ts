const TED_SEARCH = "https://api.ted.europa.eu/v3/notices/search";

export type TedResult = {
  externalId: string;
  title: string;
  url: string;
  source: "ted";
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

type SearchOptions = { keywords?: string[]; industryCodes?: string[]; geography?: string[]; statuses?: string[]; noticeTypes?: string[]; publishedFrom?: string; publishedTo?: string; closingFrom?: string; closingTo?: string; publishedWindow?: string; closingWindow?: string };
type TedNotice = { "publication-number"?: string; "notice-title"?: Record<string, string>; "buyer-name"?: Record<string, string[]>; "publication-date"?: string; "form-type"?: string; "deadline-receipt-tender-date-lot"?: string[]; "place-of-performance-country-proc"?: string[]; "classification-cpv"?: string[]; "description-proc"?: Record<string, string>; links?: { html?: Record<string, string>; pdf?: Record<string, string> } };

function languageValue(value: Record<string, string> | undefined) { return value?.eng || Object.values(value || {})[0] || ""; }
function anyValue(value: unknown) { return Array.isArray(value) ? value.join(" ") : typeof value === "string" ? value : ""; }
function dateInRange(value: string, from?: string, to?: string) { if (!from && !to) return true; const time = new Date(value).getTime(); return Boolean(value) && !Number.isNaN(time) && (!from || time >= new Date(`${from}T00:00:00Z`).getTime()) && (!to || time <= new Date(`${to}T23:59:59Z`).getTime()); }
function includesAny(text: string, values: string[]) { if (!values.length) return true; const lower = text.toLowerCase(); return values.some((value) => lower.includes(value.toLowerCase())); }
function inWindow(value: string, window: string, future: boolean) { if (!window) return true; const time = new Date(value).getTime(); if (Number.isNaN(time)) return false; const days = ({ "24h": 1, "1d": 1, "2d": 2, "3d": 3, "7d": 7, "14d": 14, "30d": 30, "90d": 90 } as Record<string, number>)[window] || 30; const now = Date.now(); const start = future ? new Date(new Date().setHours(0, 0, 0, 0)).getTime() : now - days * 86400000; return time >= start && time <= (future ? start + days * 86400000 : now); }
function compactDate(value: string) { return value.replace(/-/g, ""); }
function dateAfterDays(days: number) { const date = new Date(); date.setDate(date.getDate() + days); return date.toISOString().slice(0, 10); }

export async function searchTed(query: string, options: SearchOptions = {}): Promise<TedResult[]> {
  const terms = [query, ...(options.keywords || [])].filter(Boolean);
  const now = new Date();
  const publishedFrom = options.publishedFrom || new Date(now.getTime() - 90 * 86400000).toISOString().slice(0, 10);
  const publishedTo = options.publishedTo || now.toISOString().slice(0, 10);
  const dateTerms = [`PD>=${compactDate(publishedFrom)}`, `PD<=${compactDate(publishedTo)}`];
  const closingDays = ({ "today": 0, "24h": 1, "1d": 1, "2d": 2, "3d": 3, "7d": 7, "14d": 14, "30d": 30, "90d": 90 } as Record<string, number>)[options.closingWindow || ""];
  const closingFrom = options.closingFrom || (closingDays !== undefined ? now.toISOString().slice(0, 10) : "");
  const closingTo = options.closingTo || (closingDays !== undefined ? dateAfterDays(closingDays) : "");
  if (closingFrom) dateTerms.push(`DD>=${compactDate(closingFrom)}`);
  if (closingTo) dateTerms.push(`DD<=${compactDate(closingTo)}`);
  const textTerms = terms.length ? terms.map((term) => `FT~${term.replace(/[^a-z0-9 ]/gi, " ").trim()}`).join(" AND ") : "FT~procurement";
  const expertTerms = `${dateTerms.join(" AND ")} AND ${textTerms}`;
  const fields = ["publication-number", "notice-title", "buyer-name", "publication-date", "form-type", "deadline-receipt-tender-date-lot", "place-of-performance-country-proc", "classification-cpv", "description-proc"];
  const response = await fetch(TED_SEARCH, { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json", "User-Agent": "Mozilla/5.0 (compatible; EumanIntelligence/1.0; +https://eumanai.com)" }, body: JSON.stringify({ query: expertTerms, fields, limit: 100, scope: "ACTIVE", paginationMode: "PAGE_NUMBER", page: 1 }), cache: "no-store" });
  if (!response.ok) throw new Error(`TED public search is temporarily unavailable (HTTP ${response.status}).`);
  const payload = await response.json() as { notices?: TedNotice[] };
  return (payload.notices || []).map((notice) => {
    const id = notice["publication-number"] || "";
    const title = languageValue(notice["notice-title"]);
    const buyer = (notice["buyer-name"]?.eng || Object.values(notice["buyer-name"] || {})[0] || [])[0] || "";
    const description = languageValue(notice["description-proc"]);
    const category = anyValue(notice["classification-cpv"]);
    const location = anyValue(notice["place-of-performance-country-proc"]);
    const closing = (notice["deadline-receipt-tender-date-lot"] || []).find((value) => !Number.isNaN(new Date(value).getTime())) || "";
    const searchable = [title, buyer, description, category, location, notice["form-type"]].join(" ");
    const matched = terms.filter((term) => searchable.toLowerCase().includes(term.toLowerCase())).length;
    const fitScore = Math.min(100, Math.round((matched / Math.max(terms.length, 1)) * 100));
    return { externalId: id, title: title || "TED opportunity", url: `https://ted.europa.eu/en/notice/${id}`, source: "ted" as const, referenceNumber: id, status: "active", category: category || "EU public procurement", publishedDate: notice["publication-date"] || "", closingDate: closing, organization: buyer, unspsc: "", gsin: category, description: description || `${buyer}${location ? ` - ${location}` : ""}`.trim(), attachmentUrl: notice.links?.pdf?.ENG || "", fitScore, preliminaryDecision: fitScore >= 35 ? "possible_fit" as const : "low_fit" as const };
  }).filter((result) => (!options.statuses?.length || result.status === "active") && includesAny(result.title + " " + result.description + " " + result.organization, terms) && includesAny(result.gsin, options.industryCodes || []) && includesAny(result.description + " " + result.organization, options.geography || []) && (!options.noticeTypes?.length || options.noticeTypes.some((type) => result.category.toLowerCase().includes(type.toLowerCase()))) && dateInRange(result.publishedDate, options.publishedFrom, options.publishedTo) && dateInRange(result.closingDate, options.closingFrom, options.closingTo) && inWindow(result.publishedDate, options.publishedWindow || "", false) && inWindow(result.closingDate, options.closingWindow || "", true)).slice(0, 50);
}
