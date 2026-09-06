import DashboardShell from "@/components/dashboardBar";
import OperationsCardMove from "@/components/admin/OperationsCardMove";
import OperationsColumnCreator from "@/components/admin/OperationsColumnCreator";
import OperationsTaskCreator from "@/components/admin/OperationsTaskCreator";
import OperationsColumnTitleEditor from "@/components/admin/OperationsColumnTitleEditor";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminFromCookies } from "@/lib/admin-session";
import { getAdminNav } from "@/lib/admin-dashboard";
import dbConnect from "@/lib/db-connect";
import { getOperatorFromCookies } from "@/lib/get-operator";
import { isPlatformAdminRole } from "@/lib/admin-auth";
import { Opportunity } from "@/model/opportunity";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SearchParams = {
  q?: string;
  assignee?: string;
  priority?: string;
  scope?: string;
};

type BoardCard = {
  id: string;
  title: string;
  description: string;
  columnId: string;
  columnTitle: string;
  order: number;
  priority: string;
  assigneeEmails: string[];
  dueDate: string;
  dueTime: string;
  opportunityCode: string;
  opportunityTitle: string;
  clientName: string;
  workbenchHref: string;
  opportunityHref: string;
  completedSubtasks: number;
  totalSubtasks: number;
  availableColumns: BoardColumn[];
};

type BoardColumn = {
  id: string;
  title: string;
  order: number;
};

type OpportunityOption = {
  code: string;
  title: string;
  clientName: string;
  defaultColumnId: string;
  columns: BoardColumn[];
};

function normalizedDateKey(value?: string) {
  return String(value || "").trim();
}

function dueLabel(dueDate?: string, dueTime?: string) {
  if (!dueDate) return "";
  return dueTime ? `${dueDate} ${dueTime}` : dueDate;
}

function priorityBadge(priority?: string) {
  switch (priority) {
    case "urgent":
      return "border-red-200 bg-red-50 text-red-700";
    case "high":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "medium":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "low":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    default:
      return "border-gray-200 bg-gray-50 text-gray-600";
  }
}

function defaultColumns(): BoardColumn[] {
  return [
    { id: "opportunities", title: "Opportunities", order: 0 },
    { id: "todo", title: "To do", order: 1 },
    { id: "in-progress", title: "In progress", order: 2 },
    { id: "submitted", title: "Submitted", order: 3 },
    { id: "lost", title: "Lost", order: 4 },
    { id: "awarded", title: "Awarded", order: 5 },
  ];
}

async function getOperationsBoard(
  operator: { id: string; role?: string; email?: string },
  filters: SearchParams
) {
  await dbConnect();

  const query = isPlatformAdminRole(operator.role)
    ? { active: true }
    : { active: true, assignedUserId: operator.id };

  const docs = await Opportunity.find(
    query,
    {
      code: 1,
      title: 1,
      clientName: 1,
      company: 1,
      workbench: 1,
      assignedUserEmail: 1,
    }
  )
    .sort({ createdAt: -1 })
    .lean();

  const columnsMap = new Map<string, BoardColumn>();
  const cards: BoardCard[] = [];

  for (const doc of docs as any[]) {
    const opportunityCode = String(doc.code || "");
    const opportunityTitle = String(doc.title || "Opportunity");
    const clientName = String(doc.clientName || doc.company || "");
    const workbench = doc.workbench || { columns: [], cards: [] };
    const columns = Array.isArray(workbench.columns) ? workbench.columns : [];
    const cardItems = Array.isArray(workbench.cards) ? workbench.cards : [];

    for (const column of columns) {
      const id = String(column?.id || "").trim();
      if (!id) continue;
      const current = columnsMap.get(id);
      const nextOrder = Number.isFinite(Number(column?.order))
        ? Number(column.order)
        : columnsMap.size;
      if (!current || nextOrder < current.order) {
        columnsMap.set(id, {
          id,
          title: String(column?.title || id).trim(),
          order: nextOrder,
        });
      }
    }

    for (const card of cardItems) {
      const columnId = String(card?.columnId || "").trim();
      const assigneeEmails = Array.isArray(card?.assigneeEmails)
        ? card.assigneeEmails
            .map((entry: any) => String(entry || "").trim())
            .filter(Boolean)
        : String(card?.assigneeEmail || "").trim()
          ? [String(card.assigneeEmail).trim()]
          : [];
      const subtasks = Array.isArray(card?.subtasks) ? card.subtasks : [];
      const completedSubtasks = subtasks.filter((item: any) => item?.done).length;
      const totalSubtasks = subtasks.length;

      cards.push({
        id: String(card?.id || ""),
        title: String(card?.title || "").trim(),
        description: String(card?.description || "").trim(),
        columnId,
        columnTitle: columnsMap.get(columnId)?.title || columnId || "Unsorted",
        order: Number.isFinite(Number(card?.order)) ? Number(card.order) : 0,
        priority: String(card?.priority || "").trim(),
        assigneeEmails,
        dueDate: String(card?.dueDate || "").trim(),
        dueTime: String(card?.dueTime || "").trim(),
        opportunityCode,
        opportunityTitle,
        clientName,
        workbenchHref: `/admin/opportunities/${opportunityCode}/workbench`,
        opportunityHref: `/admin/opportunities/${opportunityCode}`,
        completedSubtasks,
        totalSubtasks,
        availableColumns: columns
          .map((column: any, index: number) => ({
            id: String(column?.id || "").trim(),
            title: String(column?.title || "").trim(),
            order: Number.isFinite(Number(column?.order))
              ? Number(column.order)
              : index,
          }))
          .filter((column: BoardColumn) => column.id && column.title)
          .sort((a: BoardColumn, b: BoardColumn) => a.order - b.order),
      });
    }
  }

  const q = String(filters.q || "").trim().toLowerCase();
  const assigneeFilter = String(filters.assignee || "").trim().toLowerCase();
  const priorityFilter = String(filters.priority || "").trim().toLowerCase();
  const scope = String(filters.scope || "all").trim().toLowerCase();
  const myEmail = String(operator.email || "").trim().toLowerCase();
  const today = new Date().toISOString().slice(0, 10);

  const filteredCards = cards.filter((card) => {
    const searchable = [
      card.title,
      card.description,
      card.opportunityTitle,
      card.opportunityCode,
      card.clientName,
      ...card.assigneeEmails,
    ]
      .join(" ")
      .toLowerCase();

    if (q && !searchable.includes(q)) return false;
    if (assigneeFilter === "assigned" && card.assigneeEmails.length === 0) return false;
    if (assigneeFilter === "unassigned" && card.assigneeEmails.length > 0) return false;
    if (
      assigneeFilter === "mine" &&
      (!myEmail || !card.assigneeEmails.some((email) => email.toLowerCase() === myEmail))
    ) {
      return false;
    }
    if (
      assigneeFilter &&
      !["mine", "assigned", "unassigned"].includes(assigneeFilter) &&
      !card.assigneeEmails.some((email) => email.toLowerCase() === assigneeFilter)
    ) {
      return false;
    }
    if (priorityFilter && priorityFilter !== "all" && card.priority !== priorityFilter) {
      return false;
    }

    const dueDate = normalizedDateKey(card.dueDate);
    if (scope === "overdue" && (!dueDate || dueDate >= today)) return false;
    if (scope === "today" && dueDate !== today) return false;
    if (scope === "upcoming" && (!dueDate || dueDate <= today)) return false;

    return true;
  });

  const columns = Array.from(columnsMap.values()).sort((a, b) => a.order - b.order);

  const summary = {
    totalCards: filteredCards.length,
    overdue: filteredCards.filter((card) => {
      const dueDate = normalizedDateKey(card.dueDate);
      return dueDate && dueDate < today;
    }).length,
    dueToday: filteredCards.filter(
      (card) => normalizedDateKey(card.dueDate) === today
    ).length,
    unassigned: filteredCards.filter((card) => card.assigneeEmails.length === 0).length,
    activeOpportunities: new Set(filteredCards.map((card) => card.opportunityCode)).size,
  };

  const assignees = Array.from(
    new Set(filteredCards.flatMap((card) => card.assigneeEmails).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  return {
    columns: columns.length ? columns : defaultColumns(),
    cards: filteredCards,
    summary,
    assignees,
    opportunities: (docs as any[]).map((doc) => {
      const workbench = doc.workbench || { columns: [], cards: [] };
      const columns = Array.isArray(workbench.columns) ? workbench.columns : [];
      const availableColumns = columns
        .map((column: any, index: number) => ({
          id: String(column?.id || "").trim(),
          title: String(column?.title || "").trim(),
          order: Number.isFinite(Number(column?.order)) ? Number(column.order) : index,
        }))
        .filter((column: BoardColumn) => column.id && column.title)
        .sort((a: BoardColumn, b: BoardColumn) => a.order - b.order);
      const defaultColumnId =
        availableColumns.find((column: BoardColumn) => column.id === "todo")?.id ||
        availableColumns[0]?.id ||
        "todo";

      return {
        code: String(doc.code || ""),
        title: String(doc.title || "Opportunity"),
        clientName: String(doc.clientName || doc.company || ""),
        defaultColumnId,
        columns: availableColumns.length ? availableColumns : defaultColumns(),
      };
    }) as OpportunityOption[],
  };
}

export default async function AdminOperationsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const admin = await getAdminFromCookies();
  if (!admin) redirect("/admin/login");

  const me = await getOperatorFromCookies();
  if (!me) redirect("/admin/login");

  const params = (await searchParams) || {};
  const { columns, cards, summary, assignees, opportunities } = await getOperationsBoard(
    me,
    params
  );

  const q = String(params.q || "");
  const assignee = String(params.assignee || "");
  const priority = String(params.priority || "all");
  const scope = String(params.scope || "all");

  const cardsByColumn = new Map<string, BoardCard[]>();
  for (const column of columns) cardsByColumn.set(column.id, []);
  for (const card of cards) {
    const list = cardsByColumn.get(card.columnId) || [];
    list.push(card);
    cardsByColumn.set(card.columnId, list);
  }

  return (
    <DashboardShell
      user={{
        name: (me as any).name ?? me.email ?? "Admin",
        email: me.email,
        role: me.role as any,
      }}
      title="Operations Board"
      nav={getAdminNav(me.role)}
    >
    <div className="mx-auto max-w-7xl px-4 py-2 text-white">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Operations Board</h1>
          <p className="mt-1 max-w-3xl text-sm text-white/70">
            Review ongoing tasks across all active opportunities without opening
            each workbench one by one. Tasks still belong to their opportunity,
            but the team can use this board for weekly reviews and daily coordination.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <OperationsTaskCreator opportunities={opportunities} label="Add task" />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Open tasks", String(summary.totalCards)],
          ["Overdue", String(summary.overdue)],
          ["Due today", String(summary.dueToday)],
          ["Unassigned", String(summary.unassigned)],
          ["Active opportunities", String(summary.activeOpportunities)],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-sm"
          >
            <div className="text-xs text-white/55">{label}</div>
            <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
          </div>
        ))}
      </div>

      <form
        action="/admin/operations"
        method="GET"
        className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-sm lg:grid-cols-[minmax(0,1.5fr)_180px_180px_180px_auto]"
      >
        <input
          name="q"
          defaultValue={q}
          placeholder="Search task, opportunity, client, code, or assignee..."
          className="rounded-xl border border-white/10 bg-[#0b0f14] px-3 py-2 text-sm text-white placeholder:text-white/35"
        />

        <select
          name="assignee"
          defaultValue={assignee}
          className="rounded-xl border border-white/10 bg-[#0b0f14] px-3 py-2 text-sm text-white"
        >
          <option value="">All assignees</option>
          <option value="mine">Assigned to me</option>
          <option value="assigned">Assigned</option>
          <option value="unassigned">Unassigned</option>
          {assignees.map((email) => (
            <option key={email} value={email}>
              {email}
            </option>
          ))}
        </select>

        <select
          name="priority"
          defaultValue={priority}
          className="rounded-xl border border-white/10 bg-[#0b0f14] px-3 py-2 text-sm text-white"
        >
          <option value="all">All priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          name="scope"
          defaultValue={scope}
          className="rounded-xl border border-white/10 bg-[#0b0f14] px-3 py-2 text-sm text-white"
        >
          <option value="all">All due dates</option>
          <option value="overdue">Overdue</option>
          <option value="today">Due today</option>
          <option value="upcoming">Upcoming</option>
        </select>

        <div className="flex gap-2">
          <button
            type="submit"
            className="cursor-pointer rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Apply
          </button>
          <Link
            href="/admin/operations"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            Reset
          </Link>
        </div>
      </form>

      <div className="mt-4">
        <OperationsColumnCreator />
      </div>

      <div className="mt-6 overflow-x-auto pb-2">
        <div className="flex min-h-[62vh] min-w-max gap-4">
          {columns.map((column) => {
            const columnCards = (cardsByColumn.get(column.id) || []).sort((a, b) => {
              const orderCompare = a.order - b.order;
              if (orderCompare !== 0) return orderCompare;
              const dueCompare = normalizedDateKey(a.dueDate).localeCompare(
                normalizedDateKey(b.dueDate)
              );
              if (normalizedDateKey(a.dueDate) && normalizedDateKey(b.dueDate) && dueCompare !== 0) {
                return dueCompare;
              }
              return a.title.localeCompare(b.title);
            });

            return (
              <div
                key={column.id}
                className="flex w-[320px] flex-col rounded-3xl border border-white/10 bg-white/[0.06] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <OperationsColumnTitleEditor
                    columnId={column.id}
                    title={column.title}
                  />
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-white/50">
                      {columnCards.length} {columnCards.length === 1 ? "task" : "tasks"}
                    </div>
                    <OperationsTaskCreator
                      opportunities={opportunities}
                      initialColumnId={column.id}
                      label={`Add task to ${column.title}`}
                      variant="column"
                    />
                  </div>
                </div>

                <div className="mt-4 flex-1 space-y-3">
                  {columnCards.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-4 text-sm text-white/55">
                      No tasks in this column for the current filter.
                    </div>
                  )}

                  {columnCards.map((card) => (
                    <div
                      key={`${card.opportunityCode}-${card.id}`}
                      className="rounded-2xl border border-white/10 bg-[#0e1319] p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-white">
                            {card.title}
                          </div>
                          <div className="mt-1 text-xs text-white/55">
                            {card.clientName || "Client not set"} | {card.opportunityCode}
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${priorityBadge(
                            card.priority
                          )}`}
                        >
                          {card.priority || "normal"}
                        </span>
                      </div>

                      {card.description && (
                        <p className="mt-3 line-clamp-3 text-sm text-white/72">
                          {card.description}
                        </p>
                      )}

                      <div className="mt-3 space-y-2 text-xs text-white/60">
                        <div className="truncate">
                          Opportunity: {card.opportunityTitle}
                        </div>
                        {card.assigneeEmails.length > 0 && (
                          <div className="truncate">
                            Assignee: {card.assigneeEmails.join(", ")}
                          </div>
                        )}
                        {card.dueDate && (
                          <div>Due: {dueLabel(card.dueDate, card.dueTime)}</div>
                        )}
                        {card.totalSubtasks > 0 && (
                          <div>
                            Subtasks: {card.completedSubtasks}/{card.totalSubtasks}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        <Link
                          href={card.workbenchHref}
                          className="rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-white/85 transition hover:bg-white/10 hover:text-white"
                        >
                          Open workbench
                        </Link>
                        <Link
                          href={card.opportunityHref}
                          className="rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-white/85 transition hover:bg-white/10 hover:text-white"
                        >
                          Open opportunity
                        </Link>
                      </div>

                      <OperationsCardMove
                        opportunityCode={card.opportunityCode}
                        cardId={card.id}
                        columnId={card.columnId}
                        columns={card.availableColumns}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </DashboardShell>
  );
}
