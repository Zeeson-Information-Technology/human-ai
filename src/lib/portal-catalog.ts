export const PORTAL_CATALOG = [
  {
    key: "canada-buys",
    name: "CanadaBuys",
    description: "Canadian federal procurement opportunities.",
    loginUrl: "https://canadabuys.canada.ca/",
  },
  {
    key: "sam-gov",
    name: "SAM.gov",
    description: "United States federal contract opportunities.",
    loginUrl: "https://sam.gov/",
  },
  {
    key: "find-a-tender",
    name: "Find a Tender",
    description: "UK public procurement notices.",
    loginUrl: "https://www.find-tender.service.gov.uk/",
  },
  {
    key: "contracts-finder",
    name: "Contracts Finder",
    description: "UK public sector contract opportunities.",
    loginUrl: "https://www.contractsfinder.service.gov.uk/",
  },
  {
    key: "ted",
    name: "TED (EU Tenders)",
    description: "European Union public procurement notices.",
    loginUrl: "https://ted.europa.eu/",
  },
  {
    key: "ontario-tenders",
    name: "Ontario Tenders Portal",
    description: "Ontario public procurement opportunities.",
    loginUrl: "https://ontariotenders.bravosolution.com/esop/guest/login.do",
  },
  {
    key: "merx",
    name: "MERX",
    description: "Canadian public and private tender listings.",
    loginUrl: "https://www.merx.com/",
  },
  {
    key: "bids-and-tenders",
    name: "Bids & Tenders",
    description: "Canadian public bid opportunities from participating buyers.",
    loginUrl: "https://opportunities.bidsandtenders.com/",
  },
] as const;

export function getPortalByKey(key: string) {
  return PORTAL_CATALOG.find((portal) => portal.key === key);
}
