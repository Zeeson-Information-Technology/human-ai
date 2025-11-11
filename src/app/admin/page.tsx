import dbConnect from "@/lib/db-connect";
import { Job } from "@/model/job";
import Session from "@/model/session";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminFromCookies } from "@/lib/admin-session";
import DashboardShell from "@/components/dashboardBar";
import { getOperatorFromCookies } from "@/lib/get-operator";
import { isAdminAreaRole } from "@/lib/admin-auth";
import { Types } from "mongoose";

// Dashboard summary counts
// - Admin: global
// - Company: sessions they created OR sessions for jobs they own
async function getStats(me?: { id?: string; role?: string }) {
  await dbConnect();
  const isAdmin = me?.role === "admin";
  if (isAdmin) {
    const [jobs, totalSessions, finishedSessions] = await Promise.all([
      Job.countDocuments({}),
      Session.countDocuments({}),
      Session.countDocuments({ status: "finished" }),
    ]);
    return {
      jobs,
      totalSessions,
      finishedSessions,
      runningSessions: Math.max(totalSessions - finishedSessions, 0),
    };
  }

  const meId = me?.id ? new Types.ObjectId(me.id) : null;
  if (!meId)
    return {
      jobs: 0,
      totalSessions: 0,
      finishedSessions: 0,
      runningSessions: 0,
    };

  const jobIds = (await Job.find({ ownerId: meId }).distinct(
    "_id"
  )) as unknown as Types.ObjectId[];
  const sessionFilter = {
    $or: [{ ownerId: meId }, { jobId: { $in: jobIds } }],
  } as any;

  const [jobs, totalSessions, finishedSessions] = await Promise.all([
    Job.countDocuments({ ownerId: meId }),
    Session.countDocuments(sessionFilter),
    Session.countDocuments({ ...sessionFilter, status: "finished" }),
  ]);

  return {
    jobs,
    totalSessions,
    finishedSessions,
    runningSessions: Math.max(totalSessions - finishedSessions, 0),
  };
}

export default async function AdminHomePage() {
  const admin = await getAdminFromCookies();
  if (!admin) redirect("/zuri/start/login?role=admin");

  const me = await getOperatorFromCookies();
  // Only allow admin area roles
  if (!me || !isAdminAreaRole(me.role))
    redirect("/zuri/start/login?role=admin");

  const stats = await getStats(me);

  return (
    <DashboardShell
      user={{
        name: me.email ?? "Admin",
        email: me.email,
        role: me.role as any,
      }}
      title="Admin"
      nav={[
        { href: "/admin", label: "Dashboard", exact: true },
        { href: "/admin/jobs", label: "Jobs" },
        { href: "/admin/interviews", label: "Interviews" },
        { href: "/admin/leads", label: "Leads" },
        { href: "/admin/settings", label: "Settings" },
      ]}
    >
      {/* === Existing admin tiles, unchanged === */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/jobs"
          className="rounded-2xl border p-4 hover:bg-gray-50 transition"
        >
          <div className="text-xs text-gray-500">Jobs</div>
          <div className="mt-1 text-2xl font-semibold">{stats.jobs}</div>
          <div className="mt-2 text-sm text-gray-600">
            Create and monitor interview JDs
          </div>
        </Link>

        <Link
          href="/admin/interviews"
          className="rounded-2xl border p-4 hover:bg-gray-50 transition"
        >
          <div className="text-xs text-gray-500">Interviews</div>
          <div className="mt-1 text-2xl font-semibold">
            {stats.totalSessions}
          </div>
          <div className="mt-2 text-sm text-gray-600">{`${stats.finishedSessions} finished | ${stats.runningSessions} running`}</div>
        </Link>

        <Link
          href="/admin/leads"
          className="rounded-2xl border p-4 hover:bg-gray-50 transition"
        >
          <div className="text-xs text-gray-500">Leads</div>
          <div className="mt-1 text-2xl font-semibold">View</div>
          <div className="mt-2 text-sm text-gray-600">
            Pilot requests and contact messages
          </div>
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border p-4">
        <div className="text-sm font-medium">Quick actions</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/zuri/start"
            className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
          >
            + New JD
          </Link>
          <Link
            href="/admin/interviews"
            className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Review interviews
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}
