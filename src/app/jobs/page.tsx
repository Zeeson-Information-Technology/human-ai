import Link from "next/link";

// Fetch jobs from the backend (public, only active jobs)
async function getOpenJobs() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/public/jobs`,
    {
      cache: "no-store",
    }
  );
  if (!res.ok) return [];
  const { jobs } = await res.json();
  return jobs || [];
}

export default async function JobsPage() {
  const jobs = await getOpenJobs();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Open Jobs</h1>
        {/* ✅ Back to Dashboard */}
        <Link
          href="/talent"
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <p className="mb-6 text-gray-600">
        Browse open roles and apply to start your AI interview.
      </p>

      <div className="grid gap-6">
        {jobs.length === 0 && (
          <div className="rounded-xl border bg-gray-50 p-6 text-center text-sm text-gray-600">
            No open jobs at the moment. Please check back soon.
          </div>
        )}

        {jobs.map((job: any) => (
          <div
            key={job.code}
            className="rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <div>
              <div className="font-semibold text-lg">{job.title}</div>
              <div className="text-sm text-gray-600">
                {job.company || "—"} • {job.languages.join(", ")} • Code:{" "}
                {job.code}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {job.jdText?.slice(0, 120)}...
              </div>
            </div>
            <Link
              href={`/jobs/apply?code=${job.code}`}
              className="rounded-xl bg-white px-4 py-2 text-black
              font-medium hover:opacity-90 cursor-pointer"
            >
              Apply / Start Interview
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
