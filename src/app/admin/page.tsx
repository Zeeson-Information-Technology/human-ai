import DashboardShell from "@/components/dashboardBar";
import TeamInvitePanel from "@/components/admin/TeamInvitePanel";
import { getAdminFromCookies } from "@/lib/admin-session";
import dbConnect from "@/lib/db-connect";
import { getEffectivePermissions, isPlatformAdminRole } from "@/lib/admin-auth";
import { getOperatorFromCookies } from "@/lib/get-operator";
import { getAdminNav } from "@/lib/admin-dashboard";
import Inquiry from "@/model/inquiry";
import { Opportunity } from "@/model/opportunity";
import Session from "@/model/session";
import Link from "next/link";
import { redirect } from "next/navigation";

async function getStats(operator: { id: string; role?: string }) {
  await dbConnect();

  const adminScope = isPlatformAdminRole(operator.role);
  const opportunityQuery = adminScope ? {} : { assignedUserId: operator.id };
  const inquiryQuery = adminScope ? {} : { assignedUserId: operator.id };

  const assignedOpportunities = await Opportunity.find(opportunityQuery, {
    code: 1,
    workbench: 1,
    active: 1,
  })
    .lean()
    .then((rows: any[]) => rows.filter(Boolean));

  const assignedOpportunityCodes = assignedOpportunities
    .map((row: any) => row.code)
    .filter(Boolean);

  const sessionQuery = adminScope
    ? {}
    : { jobCode: { $in: assignedOpportunityCodes } };

  const activeOpportunities = assignedOpportunities.filter(
    (row: any) => row.active !== false
  );
  const workbenchCards = activeOpportunities.flatMap(
    (row: any) => row.workbench?.cards || []
  );
  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);
  const overdueTasks = workbenchCards.filter((card: any) => {
    const dueDate = String(card?.dueDate || "").trim();
    return dueDate && dueDate < todayKey;
  }).length;
  const dueTodayTasks = workbenchCards.filter(
    (card: any) => String(card?.dueDate || "").trim() === todayKey
  ).length;

  const [opportunities, totalSessions, finishedSessions, inquiries, newInquiries] =
    await Promise.all([
      Opportunity.countDocuments(opportunityQuery),
      Session.countDocuments(sessionQuery),
      Session.countDocuments({ ...sessionQuery, status: "finished" }),
      Inquiry.countDocuments(inquiryQuery),
      Inquiry.countDocuments({ ...inquiryQuery, status: "new" }),
    ]);

  return {
    jobs: opportunities,
    totalSessions,
    finishedSessions,
    runningSessions: Math.max(totalSessions - finishedSessions, 0),
    inquiries,
    newInquiries,
    workbenchTasks: workbenchCards.length,
    overdueTasks,
    dueTodayTasks,
  };
}

export default async function AdminHomePage() {
  const admin = await getAdminFromCookies();
  if (!admin) redirect("/admin/login");

  const me = await getOperatorFromCookies();
  if (!me) redirect("/admin/login");
  const isAdmin = isPlatformAdminRole(me.role);
  const permissions = getEffectivePermissions(me);

  const stats = await getStats(me);
  const nav = getAdminNav(me.role);

  return (
    <DashboardShell
      user={{
        name: (me as any).name ?? me.email ?? "Admin",
        email: me.email,
        role: me.role as any,
      }}
      title={isAdmin ? "Proposal Operations" : "My Work"}
      nav={nav}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {permissions.canManageInquiries ? (
          <Link
            href="/admin/leads"
            className="rounded-2xl border p-4 transition hover:bg-gray-50"
          >
            <div className="text-xs text-gray-500">
              {isAdmin ? "Inquiries" : "My inquiries"}
            </div>
            <div className="mt-1 text-2xl font-semibold">{stats.inquiries}</div>
            <div className="mt-2 text-sm text-gray-600">
              {isAdmin
                ? `${stats.newInquiries} new contact requests waiting for review`
                : `${stats.newInquiries} assigned items still marked new`}
            </div>
          </Link>
        ) : (
          <div className="rounded-2xl border p-4 opacity-75">
            <div className="text-xs text-gray-500">Inquiries</div>
            <div className="mt-1 text-2xl font-semibold">Locked</div>
            <div className="mt-2 text-sm text-gray-600">
              Inquiry access has not been enabled for this team member.
            </div>
          </div>
        )}

        <Link
          href="/admin/jobs"
          className="rounded-2xl border p-4 transition hover:bg-gray-50"
        >
          <div className="text-xs text-gray-500">
            {isAdmin ? "Opportunities" : "My opportunities"}
          </div>
          <div className="mt-1 text-2xl font-semibold">{stats.jobs}</div>
          <div className="mt-2 text-sm text-gray-600">
            {isAdmin
              ? "Proposal or review opportunities currently in the system"
              : "Assigned opportunities you are currently responsible for"}
          </div>
        </Link>

        <Link
          href="/admin/interviews"
          className="rounded-2xl border p-4 transition hover:bg-gray-50"
        >
          <div className="text-xs text-gray-500">
            {isAdmin ? "Participant Reviews" : "My reviews"}
          </div>
          <div className="mt-1 text-2xl font-semibold">
            {stats.totalSessions}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {`${stats.finishedSessions} completed | ${stats.runningSessions} active`}
          </div>
        </Link>

        <Link
          href="/admin/operations"
          className="rounded-2xl border p-4 transition hover:bg-gray-50"
        >
          <div className="text-xs text-gray-500">Operations Board</div>
          <div className="mt-1 text-2xl font-semibold">
            {stats.workbenchTasks}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {`${stats.overdueTasks} overdue | ${stats.dueTodayTasks} due today`}
          </div>
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border p-4">
        <div className="text-sm font-medium">Quick actions</div>
        <div className="mt-1 text-sm text-gray-600">
          {isAdmin
            ? "Create and manage opportunities, review inquiries, and keep structured response work moving."
            : "Open assigned work quickly and keep intake, opportunities, and participant reviews moving."}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(isAdmin || permissions.canCreateOpportunity) && (
            <Link
              href="/admin/opportunities/new"
              className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
            >
              Create opportunity
            </Link>
          )}
          {permissions.canManageInquiries && (
            <Link
              href="/admin/leads"
              className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
            >
              {isAdmin ? "Review inquiries" : "My inquiries"}
            </Link>
          )}
          <Link
            href="/admin/interviews"
            className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
          >
            {isAdmin ? "Review participant sessions" : "My participant reviews"}
          </Link>
          <Link
            href="/admin/jobs"
            className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
          >
            {isAdmin ? "View opportunities" : "My opportunities"}
          </Link>
          <Link
            href="/admin/operations"
            className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Open operations board
          </Link>
        </div>
      </div>

      {isAdmin ? <TeamInvitePanel /> : null}
    </DashboardShell>
  );
}


