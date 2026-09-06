import { NextResponse } from "next/server";
import { z } from "zod";
import { Types } from "mongoose";
import dbConnect from "@/lib/db-connect";
import PortalConnection from "@/model/portal-connection";
import { encryptPortalSecret } from "@/lib/portal-credentials";
import { getPortalByKey } from "@/lib/portal-catalog";
import { companyRootIdOf, isAdminAreaRole } from "@/lib/admin-auth";
import { getSessionUser } from "@/lib/auth-utils";

const ConnectionSchema = z.object({
  portalKey: z.string().trim().min(1),
  username: z.string().trim().min(1),
  password: z.string().min(1),
  notes: z.string().trim().optional(),
});

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  await dbConnect();
  const me = await getSessionUser();
  if (!me || !isAdminAreaRole(me.role)) return unauthorized();
  const rootId = companyRootIdOf(me);
  if (!rootId) return NextResponse.json({ ok: true, connections: [] });

  const rows = await PortalConnection.find({ ownerCompanyId: new Types.ObjectId(rootId) })
    .select("portalKey portalName loginUrl username status lastCheckedAt notes createdAt updatedAt")
    .sort({ portalName: 1 })
    .lean();

  return NextResponse.json({
    ok: true,
    connections: rows.map((row: any) => ({ ...row, id: String(row._id) })),
  });
}

export async function POST(req: Request) {
  await dbConnect();
  const me = await getSessionUser();
  if (!me || !isAdminAreaRole(me.role) || me.role !== "admin") return unauthorized();
  const parsed = ConnectionSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Portal, username, and password are required." }, { status: 400 });
  const portal = getPortalByKey(parsed.data.portalKey);
  const rootId = companyRootIdOf(me);
  if (!portal || !rootId) return NextResponse.json({ ok: false, error: "Invalid portal or company scope." }, { status: 400 });

  const connection = await PortalConnection.findOneAndUpdate(
    { ownerCompanyId: new Types.ObjectId(rootId), portalKey: portal.key },
    {
      $set: {
        createdByUserId: new Types.ObjectId(me.id),
        portalName: portal.name,
        loginUrl: portal.loginUrl,
        username: parsed.data.username,
        secretEncrypted: encryptPortalSecret(parsed.data.password),
        status: "ready",
        notes: parsed.data.notes || "",
      },
      $setOnInsert: { ownerCompanyId: new Types.ObjectId(rootId) },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).select("portalKey portalName loginUrl username status lastCheckedAt notes createdAt updatedAt").lean();

  return NextResponse.json({ ok: true, connection: { ...connection, id: String((connection as any)._id) } });
}

export async function DELETE(req: Request) {
  await dbConnect();
  const me = await getSessionUser();
  if (!me || me.role !== "admin") return unauthorized();
  const body = await req.json().catch(() => ({}));
  const id = String(body?.id || "");
  const rootId = companyRootIdOf(me);
  if (!Types.ObjectId.isValid(id) || !rootId) return NextResponse.json({ ok: false, error: "Invalid connection." }, { status: 400 });
  await PortalConnection.deleteOne({ _id: new Types.ObjectId(id), ownerCompanyId: new Types.ObjectId(rootId) });
  return NextResponse.json({ ok: true });
}
