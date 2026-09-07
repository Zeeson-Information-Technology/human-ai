const CANADA_BUYS_OPEN_DATA =
  "https://canadabuys.canada.ca/opendata/pub/openTenderNotice-ouvertAvisAppelOffres.csv";

export type CanadaBuysResult = {
  externalId: string;
  title: string;
  url: string;
  source: "canada-buys";
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

type CanadaBuysSearchOptions = {
  keywords?: string[];
  industryCodes?: string[];
  sectors?: string[];
  statuses?: string[];
  noticeTypes?: string[];
  setAsides?: string[];
  geography?: string[];
  publishedFrom?: string;
  publishedTo?: string;
  closingFrom?: string;
  closingTo?: string;
  publishedWindow?: string;
  closingWindow?: string;
};

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];
    if (character === '"') {
      if (quoted && next === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (field || row.length) {
    row.push(field);
    if (row.some((value) => value.trim())) rows.push(row);
  }
  return rows;
}

function normalize(value: unknown) {
  return String(value || "").replace(/^\uFEFF/, "").trim();
}

function parseDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function withinWindow(value: string, window: string, mode: "past" | "future") {
  if (!window) return true;
  const date = parseDate(value);
  if (!date) return false;
  const now = new Date();
  const daysByWindow: Record<string, number> = {
    "24h": 1,
    "1d": 1,
    "2d": 2,
    "3d": 3,
    "7d": 7,
    "14d": 14,
    "30d": 30,
    "90d": 90,
    today: 1,
  };
  const days = daysByWindow[window] || 30;
  if (mode === "past") {
    const lower = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return date >= lower && date <= now;
  }
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

function withinDates(value: string, from?: string, to?: string) {
  const date = parseDate(value);
  if (!date) return !from && !to;
  if (from && date < new Date(`${from}T00:00:00`)) return false;
  if (to && date > new Date(`${to}T23:59:59`)) return false;
  return true;
}

export async function searchCanadaBuys(
  query: string,
  options: CanadaBuysSearchOptions = {}
): Promise<CanadaBuysResult[]> {
  const response = await fetch(CANADA_BUYS_OPEN_DATA, {
    headers: {
      Accept: "text/csv, text/plain;q=0.9, */*;q=0.8",
      "Accept-Language": "en-CA,en;q=0.8",
      "User-Agent": "Mozilla/5.0 (compatible; EumanIntelligence/1.0; +https://eumanai.com)",
    },
    redirect: "follow",
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(
      `CanadaBuys public data is temporarily unavailable (HTTP ${response.status}). Retry shortly or open the notice directly on CanadaBuys.`
    );
  }

  const rows = parseCsv(await response.text());
  const headers = rows.shift()?.map(normalize) || [];
  const records = rows.map((values) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => { record[header] = normalize(values[index]); });
    return record;
  });

  const queryTerms = [query, ...(options.keywords || [])]
    .join(" ")
    .toLowerCase()
    .match(/[a-z0-9]{3,}/g) || [];
  const codeTerms = options.industryCodes || [];
  const sectorCodes = (options.sectors || []).map((sector) => {
    if (sector === "Services") return "SRV";
    if (sector === "Goods") return "GD";
    if (sector === "Construction") return "CNST";
    return "SRVTGD";
  });
  const geographyTerms = options.geography || [];
  const requestedStatuses = (options.statuses || []).map((status) => status.toLowerCase());

  return records
    .filter((record) => {
      const status = record["tenderStatus-appelOffresStatut-eng"].toLowerCase();
      const category = record["procurementCategory-categorieApprovisionnement"];
      // CanadaBuys publishes useful search terms across several optional columns.
      // Search the complete normalized record so phrases such as CMS can match
      // notice metadata even when they are not in the title or description.
      const searchable = Object.values(record).join(" ");
      const setAsideText = [record["procurementMethod-methodeApprovisionnement-eng"], record["limitedTenderingReason-raisonAppelOffresLimite-eng"], record["tradeAgreements-accordsCommerciaux-eng"]].join(" ");
      return (
        hasAny(searchable, queryTerms) &&
        hasAny(searchable, codeTerms) &&
        hasAny(searchable, geographyTerms) &&
        (!requestedStatuses.length || requestedStatuses.some((wanted) => status.includes(wanted))) &&
        hasAny(record["noticeType-avisType-eng"], options.noticeTypes || []) &&
        hasAny(setAsideText, options.setAsides || []) &&
        (!sectorCodes.length || sectorCodes.some((code) => category.includes(code))) &&
        withinDates(record["publicationDate-datePublication"], options.publishedFrom, options.publishedTo) &&
        withinDates(record["tenderClosingDate-appelOffresDateCloture"], options.closingFrom, options.closingTo) &&
        withinWindow(record["publicationDate-datePublication"], options.publishedWindow || "", "past") &&
        withinWindow(record["tenderClosingDate-appelOffresDateCloture"], options.closingWindow || "", "future")
      );
    })
    .slice(0, 50)
    .map((record) => {
      const title = record["title-titre-eng"] || "CanadaBuys tender opportunity";
      const description = record["tenderDescription-descriptionAppelOffres-eng"];
      const searchable = Object.values(record).join(" ").toLowerCase();
      const matches = queryTerms.filter((term) => searchable.includes(term)).length;
      const fitScore = Math.min(100, Math.round((matches / Math.max(queryTerms.length, 1)) * 100));
      return {
        externalId: record["referenceNumber-numeroReference"] || record["solicitationNumber-numeroSollicitation"],
        title,
        url: record["noticeURL-URLavis-eng"],
        source: "canada-buys" as const,
        referenceNumber: record["referenceNumber-numeroReference"],
        status: record["tenderStatus-appelOffresStatut-eng"],
        category: record["procurementCategory-categorieApprovisionnement"],
        publishedDate: record["publicationDate-datePublication"],
        closingDate: record["tenderClosingDate-appelOffresDateCloture"],
        organization: record["contractingEntityName-nomEntitContractante-eng"],
        unspsc: record["unspsc"],
        gsin: record["gsin-nibs"],
        description,
        attachmentUrl: record["attachment-piecesJointes-eng"],
        fitScore,
        preliminaryDecision: fitScore >= 35 ? "possible_fit" : "low_fit",
      };
    });
}
