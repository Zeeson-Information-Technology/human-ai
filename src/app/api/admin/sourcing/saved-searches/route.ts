import { NextResponse } from "next/server";
import { z } from "zod";
import { Types } from "mongoose";
import dbConnect from "@/lib/db-connect";
import SavedSourceSearch from "@/model/saved-source-search";
import { companyRootIdOf, isAdminAreaRole } from "@/lib/admin-auth";
import { getSessionUser } from "@/lib/auth-utils";

const SearchSchema = z.object({
  name: z.string().trim().min(1).max(80),
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
  buyerKeywords: z.array(z.string()).default([]),
  portalConnectionIds: z.array(z.string()).default([]),
  portalKeys: z.array(z.string()).default([]),
});

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  await dbConnect();
  const me = await getSessionUser();
  if (!me || !isAdminAreaRole(me.role)) return unauthorized();
  const rootId = companyRootIdOf(me);
  const searches = rootId ? await SavedSourceSearch.find({ ownerCompanyId: rootId }).sort({ name: 1 }).lean() : [];
  return NextResponse.json({ ok: true, searches: searches.map((search) => ({ ...search, id: String(search._id), portalConnectionIds: (search.portalConnectionIds || []).map(String) })) });
}

export async function POST(req: Request) {
  await dbConnect();
  const me = await getSessionUser();
  if (!me || me.role !== "admin") return unauthorized();
  const parsed = SearchSchema.safeParse(await req.json().catch(() => ({})));
  const rootId = companyRootIdOf(me);
  if (!parsed.success || !rootId || parsed.data.portalConnectionIds.some((id) => !Types.ObjectId.isValid(id))) {
    return NextResponse.json({ ok: false, error: "Add a name, valid criteria, and portal selections." }, { status: 400 });
  }
  const search = await SavedSourceSearch.create({
    ...parsed.data,
    ownerCompanyId: new Types.ObjectId(rootId),
    createdByUserId: new Types.ObjectId(me.id),
    portalConnectionIds: parsed.data.portalConnectionIds.map((id) => new Types.ObjectId(id)),
  });
  return NextResponse.json({ ok: true, search: { id: String(search._id), name: search.name } }, { status: 201 });
}

export async function DELETE(req: Request) {
  await dbConnect();
  const me = await getSessionUser();
  if (!me || me.role !== "admin") return unauthorized();
  const body = await req.json().catch(() => ({}));
  const rootId = companyRootIdOf(me);
  const id = String(body?.id || "");
  if (!rootId || !Types.ObjectId.isValid(id)) return NextResponse.json({ ok: false, error: "Invalid saved search." }, { status: 400 });
  await SavedSourceSearch.deleteOne({ _id: new Types.ObjectId(id), ownerCompanyId: new Types.ObjectId(rootId) });
  return NextResponse.json({ ok: true });
}
