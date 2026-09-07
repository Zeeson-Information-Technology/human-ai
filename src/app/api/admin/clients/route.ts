import { NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/db-connect";
import Client from "@/model/client";
import { getSessionUser } from "@/lib/auth-utils";
import {
  companyRootIdOf,
  getEffectivePermissions,
  isAdminAreaRole,
} from "@/lib/admin-auth";
import { Types } from "mongoose";

const CreateClientSchema = z.object({
  name: z.string().trim().min(1),
  primaryContactName: z.string().trim().optional(),
  primaryContactEmail: z.string().trim().email().optional().or(z.literal("")),
  notes: z.string().trim().optional(),
});

export async function GET() {
  await dbConnect();
  const me = await getSessionUser();
  if (!me || !isAdminAreaRole(me.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const rootId = companyRootIdOf(me);
  if (!rootId) {
    return NextResponse.json({ ok: true, clients: [] });
  }

  const clients = await Client.find(
    { ownerCompanyId: new Types.ObjectId(rootId) },
    {
      name: 1,
      primaryContactName: 1,
      primaryContactEmail: 1,
      createdAt: 1,
    }
  )
    .collation({ locale: "en", strength: 2 })
    .sort({ name: 1 })
    .lean();

  return NextResponse.json({
    ok: true,
    clients: clients.map((client: any) => ({
      id: String(client._id),
      name: client.name || "",
      primaryContactName: client.primaryContactName || "",
      primaryContactEmail: client.primaryContactEmail || "",
      createdAt: client.createdAt,
    })),
  });
}

export async function POST(req: Request) {
  await dbConnect();
  const me = await getSessionUser();
  if (!me || !isAdminAreaRole(me.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const permissions = getEffectivePermissions(me);
  if (!(me.role === "admin" || me.role === "company" || permissions.canCreateOpportunity)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const parsed = CreateClientSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  }

  const rootId = companyRootIdOf(me);
  if (!rootId) {
    return NextResponse.json({ ok: false, error: "No company scope found" }, { status: 400 });
  }

  const { name, primaryContactName, primaryContactEmail, notes } = parsed.data;

  const existing = await Client.findOne({
    ownerCompanyId: new Types.ObjectId(rootId),
    name,
  })
    .collation({ locale: "en", strength: 2 })
    .lean();

  if (existing) {
    return NextResponse.json({
      ok: true,
      client: {
        id: String((existing as any)._id),
        name: (existing as any).name || "",
        primaryContactName: (existing as any).primaryContactName || "",
        primaryContactEmail: (existing as any).primaryContactEmail || "",
      },
      reused: true,
    });
  }

  const client = await Client.create({
    name,
    primaryContactName: primaryContactName || "",
    primaryContactEmail: primaryContactEmail || "",
    notes: notes || "",
    ownerCompanyId: new Types.ObjectId(rootId),
    createdByUserId: new Types.ObjectId(me.id),
  });

  return NextResponse.json({
    ok: true,
    client: {
      id: String(client._id),
      name: client.name || "",
      primaryContactName: client.primaryContactName || "",
      primaryContactEmail: client.primaryContactEmail || "",
    },
  });
}
