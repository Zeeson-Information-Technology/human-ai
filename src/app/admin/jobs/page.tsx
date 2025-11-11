export const dynamic = "force-dynamic";
export const revalidate = 0;

import dbConnect from "@/lib/db-connect";
import { Job } from "@/model/job";
import { getOperatorFromCookies } from "@/lib/get-operator";
import Link from "next/link";
import { revalidatePath } from "next/cache";

// Server loader (no fetch)
async function getJobs() {
  await dbConnect();
  const me = await getOperatorFromCookies();
  const isAdmin = me?.role === "admin";
  const ownerFilter = !isAdmin && me?.id ? { ownerId: new (await import("mongoose")).Types.ObjectId(me.id) } : {};
  const docs = await Job.find(ownerFilter as any).sort({ createdAt: -1 }).lean();
  return docs.map((d: any) => ({
    id: String(d._id),
    title: d.title,
    company: d.company || "",
    code: d.code,
    active: !!d.active,
    languages: d.languages || [],
    createdAt: new Date(d.createdAt).toISOString(),
    jdText: d.jdText || "",
  }));
}

// Server action: toggle active
async function toggleActive(id: string) {
  "use server";
  await dbConnect();
  const job = await Job.findById(id);
  if (!job) return;
  job.active = !job.active;
  await job.save();
  revalidatePath("/admin/jobs");
}

function previewJD(text: string, max = 160) {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max) + "…" : clean;
}

export default async function AdminJobsPage() {
  const jobs = await getJobs();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-2">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
          aria-label="Back to Admin Dashboard"
        >
          ← Back
        </Link>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <Link
          href="/zuri/start/admin"
          className="rounded-xl bg-white px-4 py-2 font-medium text-black hover:opacity-90"
        >
          Create Job
        </Link>
      </div>

      <div className="mt-6 grid gap-4">
        {jobs.map((j) => (
          <div
            key={j.id}
            className="rounded-2xl border border-black/10 bg-white/70 p-5 shadow-lg backdrop-blur
                       dark:border-white/10 dark:bg-white/10"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {/* Click the title to open the job workspace */}
                <Link
                  href={`/admin/jobs/${j.code}`}
                  className="block truncate text-lg font-semibold hover:underline"
                >
                  {j.title}
                </Link>
                <div className="mt-0.5 text-sm text-gray-600 dark:text-gray-300">
                  {j.company || "—"} • {j.languages.join(", ") || "—"} • Code:{" "}
                  <span className="font-mono">{j.code}</span>
                </div>
              </div>
              <form
                action={async () => {
                  "use server";
                  await toggleActive(j.id);
                }}
              >
                <button
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    j.active
                      ? "bg-emerald-600 text-white"
                      : "bg-black text-white"
                  }`}
                >
                  {j.active ? "Active" : "Activate"}
                </button>
              </form>
            </div>

            {/* JD preview */}
            <p className="mt-3 line-clamp-3 text-sm text-gray-700 dark:text-gray-200">
              {previewJD(j.jdText)}
            </p>

            {/* Actions */}
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <Link
                href={`/admin/jobs/${j.code}`}
                className="rounded-lg border px-3 py-1 hover:bg-gray-50 dark:hover:bg-gray-800/60"
              >
                Open workspace
              </Link>
              <Link
                href={`/admin/jobs/${j.code}?tab=candidates`}
                className="rounded-lg border px-3 py-1 hover:bg-gray-50 dark:hover:bg-gray-800/60"
              >
                Candidates
              </Link>
              <Link
                href={`/admin/jobs/${j.code}?tab=invite`}
                className="rounded-lg border px-3 py-1 hover:bg-gray-50 dark:hover:bg-gray-800/60"
              >
                Invite
              </Link>
              <Link
                href={`/zuri/start/admin?code=${j.code}`}
                className="rounded-lg border px-3 py-1 hover:bg-gray-50 dark:hover:bg-gray-800/60"
              >
                Edit
              </Link>
              <a
                href={`/jobs/apply?code=${j.code}`}
                target="_blank"
                rel="noopener"
                className="rounded-lg border px-3 py-1 hover:bg-gray-50 dark:hover:bg-gray-800/60"
              >
                Public link
              </a>
            </div>
          </div>
        ))}

        {jobs.length === 0 && (
          <div className="rounded-2xl border bg-gray-50 p-8 text-center text-sm text-gray-600 dark:bg-gray-800/50 dark:text-gray-300">
            No jobs yet — click{" "}
            <span className="font-semibold">Create Job</span> to start.
          </div>
        )}
      </div>
    </div>
  );
}
