export const dynamic = "force-dynamic";
export const revalidate = 0;

import DashboardShell from "@/components/dashboardBar";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminFromCookies } from "@/lib/admin-session";
import dbConnect from "@/lib/db-connect";
import { getAdminNav } from "@/lib/admin-dashboard";
import { getOperatorFromCookies } from "@/lib/get-operator";
import { getEffectivePermissions, isPlatformAdminRole } from "@/lib/admin-auth";
import { Opportunity } from "@/model/opportunity";

async function getJobs(operator: { id: string; role?: string }) {
  await dbConnect();
  const query = isPlatformAdminRole(operator.role)
    ? {}
    : { assignedUserId: operator.id };
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

async function toggleActive(id: string) {
  "use server";
  await dbConnect();
  const opportunity = await Opportunity.findById(id);
  if (!opportunity) return;
  opportunity.active = !opportunity.active;
  await opportunity.save();
  revalidatePath("/admin/jobs");
}

function previewJD(text: string, max = 160) {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max)}...` : clean;
}

export default async function AdminJobsPage() {
  const admin = await getAdminFromCookies();
  if (!admin) redirect("/admin/login");

  const me = await getOperatorFromCookies();
  if (!me) {
    redirect("/admin/login");
  }
  const permissions = getEffectivePermissions(me);

  const jobs = await getJobs(me);

  return (
    <DashboardShell
      user={{
        name: (me as any).name ?? me.email ?? "Admin",
        email: me.email,
        role: me.role as any,
      }}
      title={isPlatformAdminRole(me.role) ? "Opportunities" : "My Opportunities"}
      nav={getAdminNav(me.role)}
    >
    <div className="mx-auto max-w-6xl px-4 py-2">
      <div className="mb-2">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
          aria-label="Back to dashboard"
        >
          &larr; Back
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Opportunities</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/leads"
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Inquiries
          </Link>
          <Link
            href="/admin/interviews"
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Participant Reviews
          </Link>
          <Link
            href="/admin/operations"
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Operations Board
          </Link>
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
            className="rounded-2xl border border-black/10 bg-white/70 p-5 shadow-lg backdrop-blur"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={`/admin/jobs/${job.code}`}
                  className="block truncate text-lg font-semibold hover:underline"
                >
                  {job.title}
                </Link>
                <div className="mt-0.5 text-sm text-gray-600">
                  {job.company || "-"}
                  {job.buyerOrganization ? ` | Buyer: ${job.buyerOrganization}` : ""}
                  {" | "}Code: <span className="font-mono"> {job.code}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                  <span>
                    Status: {job.active ? "Open" : "Archived"}
                  </span>
                  {job.submissionDeadline ? (
                    <span>Deadline: {job.submissionDeadline}</span>
                  ) : null}
                  {job.marketFocus ? <span>Market: {job.marketFocus}</span> : null}
                </div>
                {job.assignedUserEmail && (
                  <div className="mt-1 text-xs text-gray-500">
                    Assigned to: {job.assignedUserEmail}
                  </div>
                )}
              </div>

              {me.role === "admin" && (
                <form
                  action={async () => {
                    "use server";
                    await toggleActive(job.id);
                  }}
                >
                  <button
                    type="submit"
                    className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold ${
                      job.active
                        ? "bg-emerald-600 text-white"
                        : "bg-black text-white"
                    }`}
                    title={
                      job.active
                        ? "Archive this opportunity"
                        : "Reopen this opportunity"
                    }
                  >
                    {job.active ? "Archive opportunity" : "Reopen opportunity"}
                  </button>
                </form>
              )}
            </div>

            <p className="mt-3 line-clamp-3 text-sm text-gray-700">
              {previewJD(job.jdText)}
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <Link
                href={`/admin/jobs/${job.code}`}
                className="rounded-lg border px-3 py-1 hover:bg-gray-50"
              >
                Open opportunity
              </Link>
              <Link
                href={`/admin/jobs/${job.code}?tab=reviews`}
                className="rounded-lg border px-3 py-1 hover:bg-gray-50"
              >
                Participant reviews
              </Link>
              <Link
                href={`/admin/jobs/${job.code}?tab=requests`}
                className="rounded-lg border px-3 py-1 hover:bg-gray-50"
              >
                Participant requests
              </Link>
              <Link
                href={`/admin/jobs/${job.code}/workbench`}
                className="rounded-lg border px-3 py-1 hover:bg-gray-50"
              >
                Workbench
              </Link>
              {me.role === "admin" && (
                <Link
                  href={`/admin/opportunities/new?code=${job.code}`}
                  className="rounded-lg border px-3 py-1 hover:bg-gray-50"
                >
                  Edit setup
                </Link>
              )}
            </div>
          </div>
        ))}

        {jobs.length === 0 && (
          <div className="rounded-2xl border bg-gray-50 p-8 text-center text-sm text-gray-600">
            No opportunities yet. Click <span className="font-semibold">Create opportunity</span> to start.
          </div>
        )}
      </div>
    </div>
    </DashboardShell>
  );
}


