import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import { verifyToken } from "@/lib/auth";
import { isPlatformAdminRole, isScopedStaffRole } from "@/lib/admin-auth";
import { Opportunity } from "@/model/opportunity";

function getActor(req: NextRequest) {
  const token =
    req.cookies.get("admin_token")?.value || req.cookies.get("token")?.value || "";
  const payload = verifyToken(token);
  const role = String(payload?.role || "");
  if (!payload?.userId || (!isPlatformAdminRole(role) && !isScopedStaffRole(role))) {
    return null;
  }
  return {
    id: String(payload.userId),
    role,
    email: String(payload.email || ""),
  };
}

export async function PATCH(req: NextRequest) {
  const actor = getActor(req);
  if (!actor) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const columnId = String(body?.columnId || "").trim();
  const title = String(body?.title || "").trim();

  if (!columnId || !title) {
    return NextResponse.json(
      { ok: false, error: "Column id and title are required." },
      { status: 400 }
    );
  }

  await dbConnect();

  const query = isPlatformAdminRole(actor.role)
    ? { active: true, "workbench.columns.id": columnId }
    : {
        active: true,
        assignedUserId: actor.id,
        "workbench.columns.id": columnId,
      };

  const matches = await Opportunity.countDocuments(query);
  if (!matches) {
    return NextResponse.json({
      ok: true,
      updatedCount: 0,
    });
  }

  const result = await Opportunity.updateMany(
    query,
    {
      $set: {
        "workbench.columns.$[column].title": title,
      },
    },
    {
      arrayFilters: [{ "column.id": columnId }],
    }
  );

  return NextResponse.json({
    ok: true,
    matchedCount: typeof result.matchedCount === "number" ? result.matchedCount : matches,
    updatedCount:
      typeof result.modifiedCount === "number" ? result.modifiedCount : matches,
  });
}

function makeColumnId(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return base || `column-${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST(req: NextRequest) {
  const actor = getActor(req);
  if (!actor) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const title = String(body?.title || "").trim();

  if (!title) {
    return NextResponse.json(
      { ok: false, error: "Column title is required." },
      { status: 400 }
    );
  }

  await dbConnect();

  const query = isPlatformAdminRole(actor.role)
    ? { active: true }
    : {
        active: true,
        assignedUserId: actor.id,
      };

  const opportunities = await Opportunity.find(query, { workbench: 1 });
  if (!opportunities.length) {
    return NextResponse.json({ ok: false, error: "No active opportunities found." }, { status: 404 });
  }

  const desiredId = makeColumnId(title);
  const hasConflict = opportunities.some((opportunity: any) => {
    const columns = Array.isArray(opportunity?.workbench?.columns)
      ? opportunity.workbench.columns
      : [];
    return columns.some((column: any) => String(column?.id || "").trim() === desiredId);
  });
  const columnId = hasConflict
    ? `${desiredId}-${Math.random().toString(36).slice(2, 6)}`
    : desiredId;

  await Promise.all(
    opportunities.map(async (opportunity: any) => {
      const workbench = opportunity.workbench || { columns: [], cards: [] };
      const columns = Array.isArray(workbench.columns) ? [...workbench.columns] : [];
      const nextOrder =
        columns.reduce((max: number, column: any) => {
          const order = Number(column?.order);
          return Number.isFinite(order) ? Math.max(max, order) : max;
        }, -1) + 1;

      opportunity.workbench = {
        ...workbench,
        columns: [
          ...columns,
          {
            id: columnId,
            title,
            order: nextOrder,
          },
        ],
      };
      await opportunity.save();
    })
  );

  return NextResponse.json({
    ok: true,
    column: {
      id: columnId,
      title,
    },
    updatedCount: opportunities.length,
  });
}
