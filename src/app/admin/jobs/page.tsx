export const dynamic = "force-dynamic";
export const revalidate = 0;

import DashboardShell from "@/components/dashboardBar";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminFromCookies } from "@/lib/admin-session";
import dbConnect from "@/lib/db-connect";
import { getAdminNav } from "@/lib/admin-dashboard";
import { getOperatorFromCookies } from "@/lib/get-operator";
import { getEffectivePermissions, isPlatformAdminRole } from "@/lib/admin-auth";
import { Opportunity } from "@/model/opportunity";
import OpportunityActions from "@/components/admin/OpportunityActions";

async function getJobs(operator: { id: string; role?: string }, archivedOnly = false) {
  await dbConnect();
  const query = {
    ...(isPlatformAdminRole(operator.role) ? {} : { assignedUserId: operator.id }),
    ...(archivedOnly ? { active: false } : {}),
  };
  const docs = await Opportunity.find(query).sort({ createdAt: -1 }).lean();

  return docs.map((d: any) => ({
    id: String(d._id),
    title: d.title,
    company: d.clientName || d.company || "",
    buyerOrganization: d.buyerOrganization || "",
    submissionDeadline: d.submissionDeadline || "",
    marketFocus: d.marketFocus || "",
    code: d.code,
    active: !!d.active,
    assignedUserEmail: d.assignedUserEmail || "",
    jdText: d.jdText || "",
  }));
}

function previewJD(text: string, max = 160) {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max)}...` : clean;
}

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams?: Promise<{ view?: string }>;
}) {
  const admin = await getAdminFromCookies();
  if (!admin) redirect("/admin/login");

  const me = await getOperatorFromCookies();
  if (!me) {
    redirect("/admin/login");
  }
  const archivedOnly = (await searchParams)?.view === "archived";
  const permissions = getEffectivePermissions(me);

  const jobs = await getJobs(me, archivedOnly);

  return (
    <DashboardShell
      user={{
        name: (me as any).name ?? me.email ?? "Admin",
        email: me.email,
        role: me.role as any,
      }}
      title={archivedOnly ? "Archived Opportunities" : isPlatformAdminRole(me.role) ? "Opportunities" : "My Opportunities"}
      nav={getAdminNav(me.role)}
    >
    <div className="mx-auto max-w-6xl px-4 py-2 text-white">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-white">{archivedOnly ? "Archived opportunities" : "Opportunities"}</h1>
        <div className="flex flex-wrap items-center gap-2">
          {(isPlatformAdminRole(me.role) || permissions.canCreateOpportunity) && (
            <Link
              href="/admin/opportunities/new"
              className="rounded-xl bg-white px-4 py-2 font-medium text-black hover:opacity-90"
            >
              Create opportunity
            </Link>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="relative z-0 rounded-2xl border border-white/10 bg-white/[0.07] p-5 shadow-lg backdrop-blur [&:has(details[open])]:z-30"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={`/admin/opportunities/${job.code}`}
                  className="block max-w-full truncate pr-2 text-lg font-semibold text-white hover:underline"
                >
                  {job.title}
                </Link>
                <div className="mt-0.5 text-sm text-white/65">
                  {job.company || "-"}
                  {job.buyerOrganization ? ` | Buyer: ${job.buyerOrganization}` : ""}
                  {" | "}Code: <span className="font-mono"> {job.code}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/55">
                  <span>
                    Status: {job.active ? "Open" : "Archived"}
                  </span>
                  {job.submissionDeadline ? (
                    <span>Deadline: {job.submissionDeadline}</span>
                  ) : null}
                  {job.marketFocus ? <span>Market: {job.marketFocus}</span> : null}
                </div>
                {job.assignedUserEmail && (
                  <div className="mt-1 text-xs text-white/55">
                    Assigned to: {job.assignedUserEmail}
                  </div>
                )}
              </div>

              <OpportunityActions code={job.code} active={job.active} canArchive={me.role === "admin"} />

            </div>

            <p className="mt-3 line-clamp-3 text-sm text-white/75">
              {previewJD(job.jdText)}
            </p>

          </div>
        ))}

        {jobs.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-8 text-center text-sm text-white/65">
            No opportunities yet. Click <span className="font-semibold">Create opportunity</span> to start.
          </div>
        )}
      </div>
    </div>
    </DashboardShell>
  );
}


