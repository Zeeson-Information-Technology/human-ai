const BIDS_AND_TENDERS_OPEN = "https://opportunities.bidsandtenders.com/";

export type BidsAndTendersResult = {
  externalId: string;
  title: string;
  url: string;
  source: "bids-and-tenders";
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
  bidTypes?: string[];
  geography?: string[];
  statuses?: string[];
  publishedFrom?: string;
  publishedTo?: string;
  closingFrom?: string;
  closingTo?: string;
  publishedWindow?: string;
  closingWindow?: string;
};

function text(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, " ").replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16))).replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code))).replace(/\s+/g, " ").trim();
}

function attr(block: string, name: string) {
  return block.match(new RegExp(`${name}="([^"]+)"`, "i"))?.[1] || "";
}

function cell(block: string, className: string) {
  return text(block.match(new RegExp(`<[^>]+class="[^"]*${className}[^"]*"[^>]*>([\\s\\S]*?)<\\/[^>]+>`, "i"))?.[1] || "");
}

function withinDates(value: string, from?: string, to?: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return !from && !to;
  if (from && date < new Date(`${from}T00:00:00`)) return false;
  if (to && date > new Date(`${to}T23:59:59`)) return false;
  return true;
}

function withinWindow(value: string, window: string | undefined, mode: "past" | "future") {
  if (!window) return true;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const days = ({ "1d": 1, "2d": 2, "3d": 3, "7d": 7, "14d": 14, "30d": 30, "90d": 90, today: 1 } as Record<string, number>)[window] || 30;
  const now = new Date();
  if (mode === "past") return date >= new Date(now.getTime() - days * 24 * 60 * 60 * 1000) && date <= now;
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const upper = new Date(start);
  upper.setDate(upper.getDate() + days);
  return date >= start && date <= upper;
}

export async function searchBidsAndTenders(query: string, options: SearchOptions = {}): Promise<BidsAndTendersResult[]> {
  const terms = [query, ...(options.keywords || [])].join(" ").match(/[a-z0-9]{2,}/gi) || [];
  const url = new URL(BIDS_AND_TENDERS_OPEN);
  url.searchParams.set("q", [query, ...(options.keywords || [])].filter(Boolean).join(" "));
  url.searchParams.set("status", (options.statuses || []).includes("open") || !(options.statuses || []).length ? "Open" : (options.statuses || []).join(","));
  if (options.bidTypes?.length) url.searchParams.set("bidType", options.bidTypes.join(","));
  url.searchParams.set("pageSize", "100");
  const response = await fetch(url, { headers: { Accept: "text/html,application/xhtml+xml", "User-Agent": "Mozilla/5.0 (compatible; EumanIntelligence/1.0; +https://eumanai.com)" }, redirect: "follow", cache: "no-store" });
  if (!response.ok) throw new Error(`Bids & Tenders public search is temporarily unavailable (HTTP ${response.status}).`);
  const html = await response.text();
  const rows = [...html.matchAll(/<tr[^>]*class="[^"]*bt-row[^"]*"[^>]*>[\s\S]*?<\/tr>/gi)];
  return rows.map((match) => {
    const block = match[0];
    const title = cell(block, "bt-bid-name") || "Bids & Tenders opportunity";
    const status = cell(block, "bt-status") || "Open";
    const publishedDate = attr(block.match(/class="bt-date-primary[^>]*data-utc="([^"]+)"/i)?.[0] || "", "data-utc");
    const dates = [...block.matchAll(/class="bt-date-primary[^>]*data-utc="([^"]+)"/gi)].map((item) => item[1]);
    const organization = cell(block, "bt-cell--org");
    const noticeUrl = block.match(/<a[^>]+class="bt-view-btn"[^>]+href="([^"]+)"/i)?.[1] || "";
    const searchable = text(block).toLowerCase();
    const matched = terms.filter((term) => searchable.includes(term.toLowerCase())).length;
    const fitScore = Math.min(100, Math.round((matched / Math.max(terms.length, 1)) * 100));
    return {
      externalId: noticeUrl || title,
      title,
      url: noticeUrl,
      source: "bids-and-tenders" as const,
      referenceNumber: "",
      status,
      category: cell(block, "bt-cell--bid-type") || "Public bid opportunity",
      publishedDate: publishedDate || dates[0] || "",
      closingDate: dates[1] || "",
      organization,
      unspsc: "",
      gsin: "",
      description: organization,
      attachmentUrl: "",
      fitScore,
      preliminaryDecision: fitScore >= 35 ? "possible_fit" as const : "low_fit" as const,
    };
  }).filter((result) => {
    const locationMatch = !(options.geography || []).length || options.geography?.some((item) => `${result.title} ${result.organization} ${result.description}`.toLowerCase().includes(item.toLowerCase()));
    const bidTypeMatch = !(options.bidTypes || []).length || (options.bidTypes || []).some((type) => result.category.toLowerCase().includes(type.toLowerCase()));
    return locationMatch && bidTypeMatch && withinDates(result.publishedDate, options.publishedFrom, options.publishedTo) && withinDates(result.closingDate, options.closingFrom, options.closingTo) && withinWindow(result.publishedDate, options.publishedWindow, "past") && withinWindow(result.closingDate, options.closingWindow, "future");
  }).slice(0, 50);
}
