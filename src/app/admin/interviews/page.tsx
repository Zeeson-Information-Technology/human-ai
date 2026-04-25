import DashboardShell from "@/components/dashboardBar";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminFromCookies } from "@/lib/admin-session";
import dbConnect from "@/lib/db-connect";
import { getAdminNav } from "@/lib/admin-dashboard";
import { isPlatformAdminRole } from "@/lib/admin-auth";
import { getOperatorFromCookies } from "@/lib/get-operator";
import { Job } from "@/model/opportunity";
import Session from "@/model/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SearchParams = { status?: string; q?: string };

function fmt(dt?: string | Date) {
  if (!dt) return "-";
  const d = typeof dt === "string" ? new Date(dt) : dt;
  try {
    return new Intl.DateTimeFormat("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return new Date(d).toLocaleString();
  }
}

async function getSessions(
  { status, q }: SearchParams,
  operator: { id: string; role?: string }
) {
  await dbConnect();

  const match: any = {};
  if (status && status !== "all") match.status = status;

  if (q) {
    const rx = new RegExp(q, "i");
    match.$or = [
      { jobCode: rx },
      { jobTitle: rx },
      { roleName: rx },
      { company: rx },
      { "candidate.name": rx },
      { "candidate.email": rx },
    ];
  }

  if (!isPlatformAdminRole(operator.role)) {
    const assignedJobs = await Job.find(
      { assignedUserId: operator.id },
      { code: 1 }
    ).lean();
    match.jobCode = {
      $in: assignedJobs.map((job: any) => job.code).filter(Boolean),
    };
  }

  const docs = await Session.find(match)
    .sort({ createdAt: -1 })
    .limit(150)
    .lean();

  const filteredDocs =
    status && status !== "all"
      ? docs.filter((d: any) => d.status === status)
      : docs;

  return filteredDocs.map((d: any) => ({
    id: String(d._id),
    ownerId: d.ownerId ? String(d.ownerId) : "",
    status: d.status as string,
    participantType:
      d.participantType && d.participantType !== "candidate"
        ? d.participantType
        : "participant",
    jobCode: d.jobCode || "",
    jobTitle: d.jobTitle || "",
    company: d.company || "",
    roleName: d.roleName || "",
    language: d.language || "en",
    participantName: d.candidate?.name || "",
    participantEmail: d.candidate?.email || "",
    startedAt: d.startedAt ? new Date(d.startedAt).toISOString() : "",
    score: d.scorecard?.overallScore ?? null,
    stepsCount: Array.isArray(d.steps) ? d.steps.length : 0,
  }));
}

export default async function AdminInterviewsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const admin = await getAdminFromCookies();
  if (!admin) redirect("/admin/login");

  const me = await getOperatorFromCookies();
  if (!me) {
    redirect("/admin/login");
  }

  const params = (await searchParams) || {};

  const status = (params.status || "all") as
    | "all"
    | "running"
    | "finished"
    | "cancelled"
    | "pending";
  const q = params.q?.trim() || "";

  const sessions = await getSessions({ status, q }, me);

  const total = sessions.length;
  const finished = sessions.filter((s) => s.status === "finished").length;
  const running = sessions.filter((s) => s.status === "running").length;

  return (
    <DashboardShell
      user={{
        name: (me as any).name ?? me.email ?? "Admin",
        email: me.email,
        role: me.role as any,
      }}
      title={isPlatformAdminRole(me.role) ? "Structured Reviews" : "My Reviews"}
      nav={getAdminNav(me.role)}
    >
    <div className="mx-auto max-w-6xl px-4 py-2">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Structured Reviews</h1>
        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/admin"
            className="rounded-lg border px-3 py-1 hover:bg-gray-50"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/leads"
            className="rounded-lg border px-3 py-1 hover:bg-gray-50"
          >
            Inquiries
          </Link>
          <Link
            href="/admin/jobs"
            className="rounded-lg border px-3 py-1 hover:bg-gray-50"
          >
            Opportunities
          </Link>
        </div>
      </div>
      <form
        className="mt-4 flex flex-wrap items-center gap-3"
        action="/admin/interviews"
        method="GET"
      >
        <div className="relative">
          <select
            name="status"
            defaultValue={status}
            className="appearance-none rounded-lg border border-gray-300 px-3 py-2 pr-9 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10"
          >
            <option value="all">All statuses</option>
            <option value="running">Running</option>
            <option value="finished">Finished</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <svg
            aria-hidden
            className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z" />
          </svg>
        </div>

        <input
          name="q"
          defaultValue={q}
          placeholder="Search by participant, email, opportunity, or code..."
          className="min-w-[280px] flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/10"
        />

        <button
          type="submit"
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Apply
        </button>

        <Link
          href="/admin/interviews"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
        >
          Reset
        </Link>
      </form>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600">
        <span>Total: {total}</span>
        <span>| Running: {running}</span>
        <span>| Finished: {finished}</span>
      </div>

      <div className="mt-6 grid gap-3">
        {sessions.map((s) => (
          <Link
            key={s.id}
            href={`/admin/interviews/${s.id}`}
            className="block rounded-2xl border p-4 hover:bg-gray-50"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-semibold">
                  {s.jobTitle || s.roleName || "Participant review"}{" "}
                  <span className="text-gray-500">
                    {s.company ? ` | ${s.company}` : ""}
                    {s.jobCode ? ` | ${s.jobCode}` : ""}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                  <span>
                    {s.participantName || "Participant"} &lt;
                    {s.participantEmail || "-"}&gt;
                  </span>
                  <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-wide">
                    {s.participantType}
                  </span>
                  <span>Lang: {s.language}</span>
                  <span>Steps: {s.stepsCount}</span>
                  <span className="text-gray-400">Owner: {s.ownerId || "-"}</span>
                  {s.status === "finished" && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
                      Report
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right text-sm">
                <div
                  className={`inline-flex items-center rounded-full px-2 py-0.5 ${
                    s.status === "finished"
                      ? "bg-emerald-600 text-white"
                      : s.status === "running"
                        ? "bg-black text-white"
                        : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {s.status}
                </div>
                <div className="mt-1 text-gray-600">
                  {s.status === "finished"
                    ? `Score: ${s.score ?? "-"}`
                    : fmt(s.startedAt)}
                </div>
              </div>
            </div>
          </Link>
        ))}

        {sessions.length === 0 && (
          <div className="rounded-xl border bg-gray-50 p-6 text-center text-sm text-gray-600">
            No participant reviews found yet.
          </div>
        )}
      </div>
    </div>
    </DashboardShell>
  );
}
