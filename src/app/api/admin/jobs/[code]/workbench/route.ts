export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import { verifyToken } from "@/lib/auth";
import { isPlatformAdminRole, isScopedStaffRole } from "@/lib/admin-auth";
import { Job } from "@/model/opportunity";

function normalizeCode(raw: string | undefined) {
  return (raw || "").trim().toUpperCase();
}

function getActor(req: NextRequest) {
  const token =
    req.cookies.get("admin_token")?.value || req.cookies.get("token")?.value || "";
  const payload = verifyToken(token);
  const role = String(payload?.role || "");
  if (!payload?.userId || (!isPlatformAdminRole(role) && !isScopedStaffRole(role))) {
    return null;
  }
  return { id: String(payload.userId), role, email: String(payload.email || "") };
}

function unauthorized() {
  return NextResponse.json(
    { ok: false, error: "Unauthorized" },
    { status: 401 }
  );
}

function defaultWorkbench() {
  return {
    columns: [
      { id: "opportunities", title: "Opportunities", order: 0 },
      { id: "todo", title: "To do", order: 1 },
      { id: "in-progress", title: "In progress", order: 2 },
      { id: "submitted", title: "Submitted", order: 3 },
      { id: "lost", title: "Lost", order: 4 },
      { id: "awarded", title: "Awarded", order: 5 },
    ],
    cards: [],
  };
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ code: string }> }
) {
  const actor = getActor(req);
  if (!actor) return unauthorized();

  await dbConnect();
  const { code: raw } = await ctx.params;
  const code = normalizeCode(raw);
  if (!code) {
    return NextResponse.json(
      { ok: false, error: "Missing code" },
      { status: 400 }
    );
  }

  const job = await Job.findOne({ code }, { workbench: 1, assignedUserId: 1 }).lean();
  if (!job) {
    return NextResponse.json(
      { ok: false, error: "Not found" },
      { status: 404 }
    );
  }

  if (
    !isPlatformAdminRole(actor.role) &&
    String((job as any).assignedUserId || "") !== actor.id
  ) {
    return NextResponse.json(
      { ok: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  return NextResponse.json({
    ok: true,
    workbench: (job as any).workbench || defaultWorkbench(),
  });
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ code: string }> }
) {
  const actor = getActor(req);
  if (!actor) return unauthorized();

  await dbConnect();
  const { code: raw } = await ctx.params;
  const code = normalizeCode(raw);
  if (!code) {
    return NextResponse.json(
      { ok: false, error: "Missing code" },
      { status: 400 }
    );
  }

  const job = await Job.findOne({ code }, { assignedUserId: 1 });
  if (!job) {
    return NextResponse.json(
      { ok: false, error: "Not found" },
      { status: 404 }
    );
  }

  if (
    !isPlatformAdminRole(actor.role) &&
    String((job as any).assignedUserId || "") !== actor.id
  ) {
    return NextResponse.json(
      { ok: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const columns = Array.isArray(body?.columns) ? body.columns : [];
  const cards = Array.isArray(body?.cards) ? body.cards : [];

  const sanitizedColumns = columns
    .map((column: any, index: number) => ({
      id: String(column?.id || "").trim(),
      title: String(column?.title || "").trim(),
      order: Number.isFinite(Number(column?.order)) ? Number(column.order) : index,
    }))
    .filter((column: any) => column.id && column.title);

  const allowedColumnIds = new Set(sanitizedColumns.map((column: any) => column.id));
  const priorityValues = new Set(["low", "medium", "high", "urgent"]);

  const sanitizedCards = cards
    .map((card: any, index: number) => {
      const assigneeEmails = Array.isArray(card?.assigneeEmails)
        ? card.assigneeEmails
            .map((entry: any) => String(entry || "").trim())
            .filter(Boolean)
        : [];
      const fallbackAssignee = String(card?.assigneeEmail || assigneeEmails[0] || "").trim();
      const priority = String(card?.priority || "").trim().toLowerCase();

      return {
        id: String(card?.id || "").trim(),
        title: String(card?.title || "").trim(),
        description: String(card?.description || "").trim(),
        columnId: String(card?.columnId || "").trim(),
        order: Number.isFinite(Number(card?.order)) ? Number(card.order) : index,
        creatorEmail: String(card?.creatorEmail || "").trim(),
        creatorName: String(card?.creatorName || "").trim(),
        creatorAvatarUrl: String(card?.creatorAvatarUrl || "").trim(),
        assigneeEmail: fallbackAssignee,
        assigneeEmails: assigneeEmails.length
          ? assigneeEmails
          : fallbackAssignee
            ? [fallbackAssignee]
            : [],
        dueDate: String(card?.dueDate || "").trim(),
        dueTime: String(card?.dueTime || "").trim(),
        priority: priorityValues.has(priority) ? priority : "",
        createdAt: String(card?.createdAt || "").trim(),
        links: Array.isArray(card?.links)
          ? card.links
              .map((entry: any) => String(entry || "").trim())
              .filter(Boolean)
          : [],
        documents: Array.isArray(card?.documents)
          ? card.documents
              .map((document: any) => ({
                name: String(document?.name || "").trim(),
                url: String(document?.url || "").trim(),
                publicId: String(document?.publicId || "").trim(),
                bytes: Number.isFinite(Number(document?.bytes))
                  ? Number(document.bytes)
                  : undefined,
                resourceType: String(document?.resourceType || "").trim(),
                uploadedAt: String(document?.uploadedAt || "").trim(),
              }))
              .filter((document: any) => document.name && document.url)
          : [],
        subtasks: Array.isArray(card?.subtasks)
          ? card.subtasks
              .map((subtask: any, subIndex: number) => ({
                id: String(subtask?.id || `sub-${index}-${subIndex}`).trim(),
                title: String(subtask?.title || "").trim(),
                done: Boolean(subtask?.done),
              }))
              .filter((subtask: any) => subtask.id && subtask.title)
          : [],
      };
    })
    .filter(
      (card: any) => card.id && card.title && card.columnId && allowedColumnIds.has(card.columnId)
    );

  const nextWorkbench = {
    columns: sanitizedColumns.length ? sanitizedColumns : defaultWorkbench().columns,
    cards: sanitizedCards,
  };

  const updated = await Job.findOneAndUpdate(
    { code },
    { $set: { workbench: nextWorkbench } },
    { new: true, projection: { workbench: 1 } }
  ).lean();

  return NextResponse.json({
    ok: true,
    workbench: (updated as any)?.workbench || nextWorkbench,
  });
}

