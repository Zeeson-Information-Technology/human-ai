const assert = require("node:assert");
const { searchCanadaBuys } = require("../src/lib/sourcing/canada-buys");
const { searchMerx } = require("../src/lib/sourcing/merx");
const { searchBidsAndTenders } = require("../src/lib/sourcing/bids-and-tenders");
const { searchFindATender } = require("../src/lib/sourcing/find-a-tender");
const { searchSamGov } = require("../src/lib/sourcing/sam-gov");

function response(body: string, contentType = "text/plain") {
  return {
    ok: true,
    status: 200,
    headers: { get: (name: string) => name.toLowerCase() === "content-type" ? contentType : null },
    text: async () => body,
    json: async () => JSON.parse(body),
  };
}

async function withFetch(body: string, assertion: (url: URL) => void, run: () => Promise<unknown>) {
  const previous = globalThis.fetch;
  let requestedUrl: URL | null = null;
  globalThis.fetch = (async (input: string | URL) => {
    requestedUrl = new URL(String(input));
    return response(body, requestedUrl.pathname.endsWith(".csv") ? "text/csv" : "application/json");
  }) as typeof fetch;
  try {
    const result = await run();
    assert(requestedUrl, "adapter should make one request");
    assertion(requestedUrl as URL);
    return result;
  } finally {
    globalThis.fetch = previous;
  }
}

async function main() {
  const emptyCsv = "referenceNumber-numeroReference,title-titre-eng\\n";
  await withFetch(emptyCsv, (url) => {
    assert.equal(url.hostname, "canadabuys.canada.ca");
    assert.equal(url.pathname.endsWith(".csv"), true);
  }, () => searchCanadaBuys("training"));

  await withFetch("<html></html>", (url) => {
    assert.equal(url.hostname, "www.merx.com");
    assert.equal(url.searchParams.get("keywords"), "training");
    assert.equal(url.searchParams.get("solSearchStatus"), "openSolicitationsTab");
  }, () => searchMerx("training"));

  await withFetch("<html></html>", (url) => {
    assert.equal(url.hostname, "opportunities.bidsandtenders.com");
    assert.equal(url.searchParams.get("q"), "training");
    assert.equal(url.searchParams.get("status"), "Open");
  }, () => searchBidsAndTenders("training"));

  await withFetch(JSON.stringify({ releases: [] }), (url) => {
    assert.equal(url.hostname, "www.find-tender.service.gov.uk");
    assert.equal(url.searchParams.get("stages"), "tender");
    assert.equal(url.searchParams.get("limit"), "100");
  }, () => searchFindATender("training"));

  const oldKey = process.env.SAM_GOV_API_KEY;
  process.env.SAM_GOV_API_KEY = "test-key";
  const samResult = await withFetch(JSON.stringify({ opportunitiesData: [] }), (url) => {
    assert.equal(url.hostname, "api.sam.gov");
    assert.equal(url.searchParams.get("api_key"), "test-key");
    assert.equal(url.searchParams.get("ncode"), "541611");
    assert.equal(url.searchParams.get("ptype"), "r");
    assert.equal(url.searchParams.get("typeOfSetAside"), "SBA");
    const from = new Date(url.searchParams.get("postedFrom") as string);
    const to = new Date(url.searchParams.get("postedTo") as string);
    assert(to.getTime() - from.getTime() <= 364 * 24 * 60 * 60 * 1000, "SAM posted range must be <= 364 days");
  }, () => searchSamGov("", {
    industryCodes: ["541611"],
    noticeTypes: ["r"],
    setAsides: ["SBA"],
    publishedFrom: "2020-01-01",
    publishedTo: "2026-09-04",
  }));
  assert.deepEqual(samResult, [], "empty SAM response should normalize to an empty result list");
  if (oldKey === undefined) delete process.env.SAM_GOV_API_KEY; else process.env.SAM_GOV_API_KEY = oldKey;
}

main().then(() => console.log("sourcing.test: OK")).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
