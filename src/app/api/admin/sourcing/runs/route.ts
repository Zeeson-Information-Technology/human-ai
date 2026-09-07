import { NextResponse } from "next/server";
import { z } from "zod";
import { Types } from "mongoose";
import dbConnect from "@/lib/db-connect";
import SourceRun from "@/model/source-run";
import PortalConnection from "@/model/portal-connection";
import { companyRootIdOf, isAdminAreaRole } from "@/lib/admin-auth";
import { getSessionUser } from "@/lib/auth-utils";
import { searchCanadaBuys } from "@/lib/sourcing/canada-buys";
import { searchMerx } from "@/lib/sourcing/merx";
import { searchBidsAndTenders } from "@/lib/sourcing/bids-and-tenders";
import { searchFindATender } from "@/lib/sourcing/find-a-tender";
import { searchOntarioTenders } from "@/lib/sourcing/ontario-tenders";
import { searchContractsFinder } from "@/lib/sourcing/contracts-finder";
import { searchTed } from "@/lib/sourcing/ted";
import { searchSamGov } from "@/lib/sourcing/sam-gov";

const RunSchema = z.object({
  query: z.string().trim().default(""),
  keywords: z.array(z.string()).default([]),
  industryCodes: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  bidTypes: z.array(z.string()).default([]),
  procurementStages: z.array(z.string()).default([]),
  valueRanges: z.array(z.string()).default([]),
  commercialTools: z.array(z.string()).default([]),
  naicsCodes: z.array(z.string()).default([]),
  sectors: z.array(z.string()).default([]),
  statuses: z.array(z.string()).default([]),
  noticeTypes: z.array(z.string()).default([]),
  setAsides: z.array(z.string()).default([]),
  geography: z.array(z.string()).default([]),
  publishedFrom: z.string().optional(),
  publishedTo: z.string().optional(),
  closingFrom: z.string().optional(),
  closingTo: z.string().optional(),
  publishedWindow: z.string().optional(),
  closingWindow: z.string().optional(),
  portalConnectionIds: z.array(z.string()).default([]),
  portalKeys: z.array(z.string()).default([]),
  opportunityId: z.string().optional(),
  buyerKeywords: z.array(z.string()).default([]),
  deadlineFrom: z.string().optional(),
  deadlineTo: z.string().optional(),
});

export async function GET() {
  await dbConnect();
  const me = await getSessionUser();
  if (!me || !isAdminAreaRole(me.role)) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const rootId = companyRootIdOf(me);
  const runs = rootId
    ? await SourceRun.find({ ownerCompanyId: new Types.ObjectId(rootId) }).sort({ createdAt: -1 }).limit(20).lean()
    : [];
  return NextResponse.json({ ok: true, runs: runs.map((run) => ({ ...run, id: String(run._id) })) });
}

export async function POST(req: Request) {
  await dbConnect();
  const me = await getSessionUser();
  if (!me || me.role !== "admin") return NextResponse.json({ ok: false, error: "Only admins can start sourcing runs." }, { status: 403 });
  const parsed = RunSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Check the search criteria and portal selection." }, { status: 400 });
  const hasCriteria = Boolean(
    parsed.data.query ||
    parsed.data.keywords.length ||
    parsed.data.industryCodes.length ||
    parsed.data.categories.length ||
    parsed.data.naicsCodes.length ||
    parsed.data.procurementStages.length ||
    parsed.data.valueRanges.length ||
    parsed.data.commercialTools.length ||
    parsed.data.sectors.length ||
    parsed.data.statuses.length ||
    parsed.data.noticeTypes.length ||
    parsed.data.setAsides.length ||
    parsed.data.geography.length ||
    parsed.data.publishedFrom || parsed.data.publishedTo ||
    parsed.data.closingFrom || parsed.data.closingTo ||
    parsed.data.publishedWindow || parsed.data.closingWindow
  );
  if (!hasCriteria) return NextResponse.json({ ok: false, error: "Add at least one search criterion, such as a date, code, location, status, or keyword." }, { status: 400 });
  const rootId = companyRootIdOf(me);
  if (!rootId || (parsed.data.portalConnectionIds.length === 0 && parsed.data.portalKeys.length === 0) || parsed.data.portalConnectionIds.some((id) => !Types.ObjectId.isValid(id))) return NextResponse.json({ ok: false, error: "Choose at least one portal." }, { status: 400 });
  const connections = await PortalConnection.countDocuments({
    _id: { $in: parsed.data.portalConnectionIds.map((id) => new Types.ObjectId(id)) },
    ownerCompanyId: new Types.ObjectId(rootId),
    status: "ready",
  });
  if (connections !== parsed.data.portalConnectionIds.length) return NextResponse.json({ ok: false, error: "One or more portal connections are not ready." }, { status: 400 });

  if (process.env.NODE_ENV !== "production") {
    console.info("[sourcing] normalized search payload", {
      ...parsed.data,
      portalConnectionIds: parsed.data.portalConnectionIds,
    });
  }

  let results: unknown[] = [];
  let status: "queued" | "completed" | "failed" = "queued";
  let decision: "pending" | "needs_human_review" = "pending";
  let decisionReason = "Queued for the portal worker.";
  const portalErrors: string[] = [];
  const portalResponses: Array<{ portal: string; status: "completed" | "failed"; resultCount: number; error?: string }> = [];
  if (parsed.data.portalKeys.includes("canada-buys")) {
    try {
      const beforeCanadaBuys = results.length;
      results = [...results, ...(await searchCanadaBuys(parsed.data.query, {
        keywords: parsed.data.keywords,
        industryCodes: parsed.data.industryCodes,
        sectors: parsed.data.sectors,
        statuses: parsed.data.statuses,
        noticeTypes: parsed.data.noticeTypes,
        setAsides: parsed.data.setAsides,
        geography: parsed.data.geography,
        publishedFrom: parsed.data.publishedFrom,
        publishedTo: parsed.data.publishedTo,
        closingFrom: parsed.data.closingFrom,
        closingTo: parsed.data.closingTo,
        publishedWindow: parsed.data.publishedWindow,
        closingWindow: parsed.data.closingWindow,
      }))];
      status = "completed";
      decision = "needs_human_review";
      decisionReason = "CanadaBuys results were collected and scored preliminarily. An admin must review the source notice before creating an opportunity.";
      portalResponses.push({ portal: "canada-buys", status: "completed", resultCount: results.length - beforeCanadaBuys });
    } catch (error: unknown) {
      status = "failed";
      const message = error instanceof Error ? error.message : "search failed.";
      portalErrors.push(`CanadaBuys: ${message}`);
      portalResponses.push({ portal: "canada-buys", status: "failed", resultCount: 0, error: message });
    }
  }
  if (parsed.data.portalKeys.includes("merx")) {
    try {
      const merxPayload = {
        categories: parsed.data.categories,
        keywords: parsed.data.keywords,
        geography: parsed.data.geography,
        statuses: parsed.data.statuses,
        publishedFrom: parsed.data.publishedFrom,
        publishedTo: parsed.data.publishedTo,
        closingFrom: parsed.data.closingFrom,
        closingTo: parsed.data.closingTo,
        publishedWindow: parsed.data.publishedWindow,
        closingWindow: parsed.data.closingWindow,
      };
      if (process.env.NODE_ENV !== "production") console.info("[sourcing] MERX request", { query: parsed.data.query, ...merxPayload });
      const merxResults = await searchMerx(parsed.data.query, merxPayload);
      results = [...results, ...merxResults];
      if (process.env.NODE_ENV !== "production") console.info("[sourcing] MERX response", { resultCount: merxResults.length });
      status = "completed";
      decision = "needs_human_review";
      decisionReason = "MERX public results were collected and scored preliminarily. An admin must review the source notice before creating an opportunity.";
      portalResponses.push({ portal: "merx", status: "completed", resultCount: merxResults.length });
    } catch (error: unknown) {
      status = "failed";
      const message = error instanceof Error ? error.message : "search failed.";
      portalErrors.push(`MERX: ${message}`);
      portalResponses.push({ portal: "merx", status: "failed", resultCount: 0, error: message });
    }
  }
  if (parsed.data.portalKeys.includes("bids-and-tenders")) {
    try {
      const beforeBidsAndTenders = results.length;
      results = [...results, ...(await searchBidsAndTenders(parsed.data.query, {
        keywords: parsed.data.keywords,
        bidTypes: parsed.data.bidTypes,
        geography: parsed.data.geography,
        statuses: parsed.data.statuses,
        publishedFrom: parsed.data.publishedFrom,
        publishedTo: parsed.data.publishedTo,
        closingFrom: parsed.data.closingFrom,
        closingTo: parsed.data.closingTo,
        publishedWindow: parsed.data.publishedWindow,
        closingWindow: parsed.data.closingWindow,
      }))];
      status = "completed";
      decision = "needs_human_review";
      decisionReason = "Bids & Tenders public results were collected and scored preliminarily. An admin must review the source notice before creating an opportunity.";
      portalResponses.push({ portal: "bids-and-tenders", status: "completed", resultCount: results.length - beforeBidsAndTenders });
    } catch (error: unknown) {
      status = "failed";
      const message = error instanceof Error ? error.message : "search failed.";
      portalErrors.push(`Bids & Tenders: ${message}`);
      portalResponses.push({ portal: "bids-and-tenders", status: "failed", resultCount: 0, error: message });
    }
  }
  if (parsed.data.portalKeys.includes("find-a-tender")) {
    try {
      const beforeFindATender = results.length;
      results = [...results, ...(await searchFindATender(parsed.data.query, {
        keywords: parsed.data.keywords,
        industryCodes: parsed.data.industryCodes,
        geography: parsed.data.geography,
        statuses: parsed.data.statuses,
        noticeTypes: parsed.data.noticeTypes,
        procurementStages: parsed.data.procurementStages,
        valueRanges: parsed.data.valueRanges,
        commercialTools: parsed.data.commercialTools,
        publishedFrom: parsed.data.publishedFrom,
        publishedTo: parsed.data.publishedTo,
        closingFrom: parsed.data.closingFrom,
        closingTo: parsed.data.closingTo,
        publishedWindow: parsed.data.publishedWindow,
        closingWindow: parsed.data.closingWindow,
      }))];
      status = "completed";
      decision = "needs_human_review";
      decisionReason = "Find a Tender public results were collected and scored preliminarily. An admin must review the source notice before creating an opportunity.";
      portalResponses.push({ portal: "find-a-tender", status: "completed", resultCount: results.length - beforeFindATender });
    } catch (error: unknown) {
      status = "failed";
      const message = error instanceof Error ? error.message : "search failed.";
      portalErrors.push(`Find a Tender: ${message}`);
      portalResponses.push({ portal: "find-a-tender", status: "failed", resultCount: 0, error: message });
    }
  }
  if (parsed.data.portalKeys.includes("contracts-finder")) {
    try {
      const beforeContractsFinder = results.length;
      results = [...results, ...(await searchContractsFinder(parsed.data.query, {
        keywords: parsed.data.keywords, industryCodes: parsed.data.industryCodes, geography: parsed.data.geography,
        statuses: parsed.data.statuses, publishedFrom: parsed.data.publishedFrom, publishedTo: parsed.data.publishedTo,
        closingFrom: parsed.data.closingFrom, closingTo: parsed.data.closingTo, publishedWindow: parsed.data.publishedWindow,
        closingWindow: parsed.data.closingWindow,
      }))];
      status = "completed"; decision = "needs_human_review";
      decisionReason = "Contracts Finder public results were collected and scored preliminarily. An admin must review the source notice before creating an opportunity.";
      portalResponses.push({ portal: "contracts-finder", status: "completed", resultCount: results.length - beforeContractsFinder });
    } catch (error: unknown) {
      status = "failed"; const message = error instanceof Error ? error.message : "search failed.";
      portalErrors.push(`Contracts Finder: ${message}`); portalResponses.push({ portal: "contracts-finder", status: "failed", resultCount: 0, error: message });
    }
  }
  if (parsed.data.portalKeys.includes("ted")) {
    try {
      const beforeTed = results.length;
      results = [...results, ...(await searchTed(parsed.data.query, {
        keywords: parsed.data.keywords, industryCodes: parsed.data.industryCodes, geography: parsed.data.geography,
        statuses: parsed.data.statuses, noticeTypes: parsed.data.noticeTypes, publishedFrom: parsed.data.publishedFrom,
        publishedTo: parsed.data.publishedTo, closingFrom: parsed.data.closingFrom, closingTo: parsed.data.closingTo,
        publishedWindow: parsed.data.publishedWindow, closingWindow: parsed.data.closingWindow,
      }))];
      status = "completed"; decision = "needs_human_review";
      decisionReason = "TED public results were collected and scored preliminarily. An admin must review the source notice before creating an opportunity.";
      portalResponses.push({ portal: "ted", status: "completed", resultCount: results.length - beforeTed });
    } catch (error: unknown) {
      status = "failed"; const message = error instanceof Error ? error.message : "search failed.";
      portalErrors.push(`TED: ${message}`); portalResponses.push({ portal: "ted", status: "failed", resultCount: 0, error: message });
    }
  }
  if (parsed.data.portalKeys.includes("ontario-tenders")) {
    try {
      const beforeOntario = results.length;
      results = [...results, ...(await searchOntarioTenders(parsed.data.query, {
        keywords: parsed.data.keywords,
        buyerKeywords: parsed.data.buyerKeywords,
        industryCodes: parsed.data.industryCodes,
        categories: parsed.data.categories,
        bidTypes: parsed.data.bidTypes,
        noticeTypes: parsed.data.noticeTypes,
        publishedFrom: parsed.data.publishedFrom,
        publishedTo: parsed.data.publishedTo,
        closingFrom: parsed.data.closingFrom,
        closingTo: parsed.data.closingTo,
      }))];
      status = "completed";
      decision = "needs_human_review";
      decisionReason = "Ontario Tenders Portal results were collected and scored preliminarily. An admin must review the source notice before creating an opportunity.";
      portalResponses.push({ portal: "ontario-tenders", status: "completed", resultCount: results.length - beforeOntario });
    } catch (error: unknown) {
      status = "failed";
      const message = error instanceof Error ? error.message : "search failed.";
      portalErrors.push(`Ontario Tenders Portal: ${message}`);
      portalResponses.push({ portal: "ontario-tenders", status: "failed", resultCount: 0, error: message });
    }
  }
  if (parsed.data.portalKeys.includes("sam-gov")) {
    try {
      const beforeSamGov = results.length;
      results = [...results, ...(await searchSamGov(parsed.data.query, {
        keywords: parsed.data.keywords,
        industryCodes: parsed.data.naicsCodes,
        classificationCodes: parsed.data.industryCodes,
        geography: parsed.data.geography,
        statuses: parsed.data.statuses,
        noticeTypes: parsed.data.noticeTypes,
        setAsides: parsed.data.setAsides,
        publishedFrom: parsed.data.publishedFrom,
        publishedTo: parsed.data.publishedTo,
        closingFrom: parsed.data.closingFrom,
        closingTo: parsed.data.closingTo,
        publishedWindow: parsed.data.publishedWindow,
        closingWindow: parsed.data.closingWindow,
      }))];
      status = "completed";
      decision = "needs_human_review";
      decisionReason = "SAM.gov results were collected and scored preliminarily. An admin must review the source notice before creating an opportunity.";
      portalResponses.push({ portal: "sam-gov", status: "completed", resultCount: results.length - beforeSamGov });
    } catch (error: unknown) {
      status = "failed";
      const message = error instanceof Error ? error.message : "search failed.";
      portalErrors.push(`SAM.gov: ${message}`);
      portalResponses.push({ portal: "sam-gov", status: "failed", resultCount: 0, error: message });
    }
  }

  if (results.length > 0) {
    status = "completed";
    decision = "needs_human_review";
    decisionReason = portalErrors.length
      ? `Results were collected, but some portals could not be searched. ${portalErrors.join(" ")}`
      : "Portal results were collected and scored preliminarily. An admin must review the source notice before creating an opportunity.";
  } else if (portalErrors.length) {
    status = "failed";
    decisionReason = portalErrors.join(" ");
  } else if (status === "completed") {
    decisionReason = "Search completed, but no opportunities matched the selected criteria.";
  }

  const run = await SourceRun.create({
    ...parsed.data,
    ownerCompanyId: new Types.ObjectId(rootId),
    createdByUserId: new Types.ObjectId(me.id),
    opportunityId: parsed.data.opportunityId && Types.ObjectId.isValid(parsed.data.opportunityId) ? new Types.ObjectId(parsed.data.opportunityId) : undefined,
    portalConnectionIds: parsed.data.portalConnectionIds.map((id) => new Types.ObjectId(id)),
    portalKeys: parsed.data.portalKeys,
    status,
    decision,
    decisionReason,
    resultCount: results.length,
    results,
    portalResponses,
    completedAt: status === "completed" || status === "failed" ? new Date() : undefined,
  });

  return NextResponse.json({
    ok: true,
    run: {
      id: String(run._id),
      status: run.status,
      decision: run.decision,
      resultCount: run.resultCount,
      decisionReason: run.decisionReason,
      results: run.results,
      portalResponses,
    },
  }, { status: 201 });
}

export async function DELETE(req: Request) {
  await dbConnect();
  const me = await getSessionUser();
  if (!me || me.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Only admins can delete sourcing reviews." }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const id = String(body?.id || "");
  const rootId = companyRootIdOf(me);
  if (!rootId || !Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid sourcing review." }, { status: 400 });
  }
  await SourceRun.deleteOne({ _id: new Types.ObjectId(id), ownerCompanyId: new Types.ObjectId(rootId) });
  return NextResponse.json({ ok: true });
}
