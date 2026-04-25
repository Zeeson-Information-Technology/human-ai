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
  const opportunityCode = String(body?.opportunityCode || "")
    .trim()
    .toUpperCase();
  const cardId = String(body?.cardId || "").trim();
  const columnId = String(body?.columnId || "").trim();

  if (!opportunityCode || !cardId || !columnId) {
    return NextResponse.json(
      { ok: false, error: "Opportunity, card, and column are required." },
      { status: 400 }
    );
  }

  await dbConnect();

  const query = isPlatformAdminRole(actor.role)
    ? { code: opportunityCode }
    : { code: opportunityCode, assignedUserId: actor.id };

  const opportunity = await Opportunity.findOne(query);
  if (!opportunity) {
    return NextResponse.json({ ok: false, error: "Opportunity not found." }, { status: 404 });
  }

  const workbench = (opportunity as any).workbench || { columns: [], cards: [] };
  const columns = Array.isArray(workbench.columns) ? workbench.columns : [];
  const cards = Array.isArray(workbench.cards) ? workbench.cards : [];

  if (!columns.some((column: any) => String(column?.id || "").trim() === columnId)) {
    return NextResponse.json({ ok: false, error: "Target column not found." }, { status: 400 });
  }

  const cardIndex = cards.findIndex((card: any) => String(card?.id || "").trim() === cardId);
  if (cardIndex === -1) {
    return NextResponse.json({ ok: false, error: "Task not found." }, { status: 404 });
  }

  const card = cards[cardIndex];
  const nextCards = cards.map((entry: any) => ({ ...entry }));
  const targetOrder =
    nextCards
      .filter((entry: any) => String(entry?.columnId || "").trim() === columnId)
      .reduce((max: number, entry: any) => {
        const order = Number(entry?.order);
        return Number.isFinite(order) ? Math.max(max, order) : max;
      }, -1) + 1;

  nextCards[cardIndex] = {
    ...card,
    columnId,
    order: targetOrder,
  };

  (opportunity as any).workbench = {
    columns,
    cards: nextCards,
  };

  await opportunity.save();

  return NextResponse.json({
    ok: true,
    card: {
      id: cardId,
      columnId,
      order: targetOrder,
    },
  });
}

export async function POST(req: NextRequest) {
  const actor = getActor(req);
  if (!actor) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const opportunityCode = String(body?.opportunityCode || "")
    .trim()
    .toUpperCase();
  const columnId = String(body?.columnId || "").trim();
  const title = String(body?.title || "").trim();
  const description = String(body?.description || "").trim();
  const dueDate = String(body?.dueDate || "").trim();
  const dueTime = String(body?.dueTime || "").trim();
  const priority = String(body?.priority || "").trim().toLowerCase();
  const assigneeEmails = Array.isArray(body?.assigneeEmails)
    ? body.assigneeEmails
        .map((entry: unknown) => String(entry || "").trim())
        .filter(Boolean)
    : [];

  if (!opportunityCode || !columnId || !title) {
    return NextResponse.json(
      { ok: false, error: "Opportunity, column, and title are required." },
      { status: 400 }
    );
  }

  await dbConnect();

  const query = isPlatformAdminRole(actor.role)
    ? { code: opportunityCode }
    : { code: opportunityCode, assignedUserId: actor.id };

  const opportunity = await Opportunity.findOne(query);
  if (!opportunity) {
    return NextResponse.json({ ok: false, error: "Opportunity not found." }, { status: 404 });
  }

  const workbench = (opportunity as any).workbench || { columns: [], cards: [] };
  const columns = Array.isArray(workbench.columns) ? workbench.columns : [];
  const cards = Array.isArray(workbench.cards) ? workbench.cards : [];

  if (!columns.some((column: any) => String(column?.id || "").trim() === columnId)) {
    return NextResponse.json({ ok: false, error: "Target column not found." }, { status: 400 });
  }

  const targetOrder =
    cards
      .filter((entry: any) => String(entry?.columnId || "").trim() === columnId)
      .reduce((max: number, entry: any) => {
        const order = Number(entry?.order);
        return Number.isFinite(order) ? Math.max(max, order) : max;
      }, -1) + 1;

  const normalizedPriority = ["low", "medium", "high", "urgent"].includes(priority)
    ? priority
    : "";
  const createdAt = new Date().toLocaleDateString();
  const uniqueAssignees = Array.from(new Set(assigneeEmails));
  const cardId = `card-${Math.random().toString(36).slice(2, 10)}`;

  const nextCard = {
    id: cardId,
    title,
    description,
    columnId,
    order: targetOrder,
    creatorEmail: actor.email,
    creatorName: actor.email,
    creatorAvatarUrl: "",
    assigneeEmail: uniqueAssignees[0] || String((opportunity as any).assignedUserEmail || ""),
    assigneeEmails: uniqueAssignees.length
      ? uniqueAssignees
      : String((opportunity as any).assignedUserEmail || "").trim()
        ? [String((opportunity as any).assignedUserEmail).trim()]
        : [],
    dueDate,
    dueTime,
    priority: normalizedPriority,
    createdAt,
    links: [],
    documents: [],
    subtasks: [],
  };

  (opportunity as any).workbench = {
    columns,
    cards: [...cards, nextCard],
  };

  await opportunity.save();

  return NextResponse.json({
    ok: true,
    card: nextCard,
  });
}
