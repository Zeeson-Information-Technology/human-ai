import DashboardShell from "@/components/dashboardBar";
import TeamInvitePanel from "@/components/admin/TeamInvitePanel";
import { getAdminFromCookies } from "@/lib/admin-session";
import dbConnect from "@/lib/db-connect";
import { getEffectivePermissions, isPlatformAdminRole } from "@/lib/admin-auth";
import { getOperatorFromCookies } from "@/lib/get-operator";
import { getAdminNav } from "@/lib/admin-dashboard";
import Client from "@/model/client";
import Inquiry from "@/model/inquiry";
import { Opportunity } from "@/model/opportunity";
import Session from "@/model/session";
import { companyRootIdOf } from "@/lib/admin-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

async function getStats(operator: { id: string; role?: string }) {
  await dbConnect();

  const adminScope = isPlatformAdminRole(operator.role);
  const rootId = companyRootIdOf(operator as any);
  const opportunityQuery = adminScope ? {} : { assignedUserId: operator.id };
  const inquiryQuery = adminScope ? {} : { assignedUserId: operator.id };
  const clientQuery = rootId ? { ownerCompanyId: rootId } : {};

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

  const [opportunities, totalSessions, finishedSessions, inquiries, newInquiries, clients] =
    await Promise.all([
      Opportunity.countDocuments(opportunityQuery),
      Session.countDocuments(sessionQuery),
      Session.countDocuments({ ...sessionQuery, status: "finished" }),
      Inquiry.countDocuments(inquiryQuery),
      Inquiry.countDocuments({ ...inquiryQuery, status: "new" }),
      Client.countDocuments(clientQuery),
    ]);

  return {
    jobs: opportunities,
    totalSessions,
    finishedSessions,
    runningSessions: Math.max(totalSessions - finishedSessions, 0),
    inquiries,
    newInquiries,
    clients,
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
            className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 transition hover:bg-white/[0.1]"
          >
            <div className="text-xs text-white/55">
              {isAdmin ? "Inquiries" : "My inquiries"}
            </div>
            <div className="mt-1 text-2xl font-semibold text-white">{stats.inquiries}</div>
            <div className="mt-2 text-sm text-white/65">
              {isAdmin
                ? `${stats.newInquiries} new contact requests waiting for review`
                : `${stats.newInquiries} assigned items still marked new`}
            </div>
          </Link>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 opacity-75">
            <div className="text-xs text-white/55">Inquiries</div>
            <div className="mt-1 text-2xl font-semibold text-white">Locked</div>
            <div className="mt-2 text-sm text-white/65">
              Inquiry access has not been enabled for this team member.
            </div>
          </div>
        )}

        <Link
          href="/admin/clients"
          className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 transition hover:bg-white/[0.1]"
        >
          <div className="text-xs text-white/55">Clients</div>
          <div className="mt-1 text-2xl font-semibold text-white">{stats.clients}</div>
          <div className="mt-2 text-sm text-white/65">
            Client records available for opportunity selection
          </div>
        </Link>

        <Link
          href="/admin/opportunities"
          className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 transition hover:bg-white/[0.1]"
        >
          <div className="text-xs text-white/55">
            {isAdmin ? "Opportunities" : "My opportunities"}
          </div>
          <div className="mt-1 text-2xl font-semibold text-white">{stats.jobs}</div>
          <div className="mt-2 text-sm text-white/65">
            {isAdmin
              ? "Proposal or review opportunities currently in the system"
              : "Assigned opportunities you are currently responsible for"}
          </div>
        </Link>

        <Link
          href="/admin/interviews"
          className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 transition hover:bg-white/[0.1]"
        >
          <div className="text-xs text-white/55">
            {isAdmin ? "Participant Reviews" : "My reviews"}
          </div>
          <div className="mt-1 text-2xl font-semibold text-white">
            {stats.totalSessions}
          </div>
          <div className="mt-2 text-sm text-white/65">
            {`${stats.finishedSessions} completed | ${stats.runningSessions} active`}
          </div>
        </Link>

        <Link
          href="/admin/operations"
          className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 transition hover:bg-white/[0.1]"
        >
          <div className="text-xs text-white/55">Operations Board</div>
          <div className="mt-1 text-2xl font-semibold text-white">
            {stats.workbenchTasks}
          </div>
          <div className="mt-2 text-sm text-white/65">
            {`${stats.overdueTasks} overdue | ${stats.dueTodayTasks} due today`}
          </div>
        </Link>

        {isAdmin ? (
          <Link
            href="/admin/sourcing"
            className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 transition hover:bg-white/[0.1]"
          >
            <div className="text-xs text-white/55">Opportunity Sourcing</div>
            <div className="mt-1 text-2xl font-semibold text-white">AI</div>
            <div className="mt-2 text-sm text-white/65">
              Connect portals and prepare human-reviewed pursuit decisions
            </div>
          </Link>
        ) : null}
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
        <div className="text-sm font-medium text-white">Quick actions</div>
        <div className="mt-1 text-sm text-white/65">
          {isAdmin
            ? "Create and manage opportunities, review inquiries, and keep structured response work moving."
            : "Open assigned work quickly and keep intake, opportunities, and participant reviews moving."}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(isAdmin || permissions.canCreateOpportunity) && (
            <Link
              href="/admin/opportunities/new"
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/85 transition hover:bg-white/10 hover:text-white"
            >
              Create opportunity
            </Link>
          )}
          <Link
            href="/admin/clients"
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            Manage clients
          </Link>
          {permissions.canManageInquiries && (
            <Link
              href="/admin/leads"
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/85 transition hover:bg-white/10 hover:text-white"
            >
              {isAdmin ? "Review inquiries" : "My inquiries"}
            </Link>
          )}
          <Link
            href="/admin/interviews"
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            {isAdmin ? "Review participant sessions" : "My participant reviews"}
          </Link>
          <Link
          href="/admin/opportunities"
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            {isAdmin ? "View opportunities" : "My opportunities"}
          </Link>
          <Link
            href="/admin/operations"
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            Open operations board
          </Link>
          {isAdmin ? (
            <Link
              href="/admin/sourcing"
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/85 transition hover:bg-white/10 hover:text-white"
            >
              Configure opportunity sourcing
            </Link>
          ) : null}
        </div>
      </div>

      {isAdmin ? <TeamInvitePanel /> : null}
    </DashboardShell>
  );
}


