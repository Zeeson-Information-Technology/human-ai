import Link from "next/link";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import WhyJoinUs from "@/components/careers/WhyJoinUs";
import HowItWorks from "@/components/careers/HowItWorks";
import Testimonials from "@/components/careers/Testimonials";
import FAQ from "@/components/careers/FAQ";

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
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? verifyToken(token) : null;

  return (
    <div className="pb-12">
      <Nav />

      {/* Hero */}
      <section className="pt-10 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl">
            Work with top Silicon Valley companies remotely
          </h1>

          <p className="mt-4 text-gray-700">
            Define your own rate, get bi-weekly pay, and long term engagements
          </p>
          <div className="mt-6">
            <Link
              href="/jobs#job-listings"
              className="rounded-xl bg-black px-6 py-3 text-white font-medium hover:opacity-90"
            >
              Get hired
            </Link>
          </div>
        </div>
      </section>

      <WhyJoinUs />
      <HowItWorks />
      <Testimonials />
      <FAQ />

      <div id="job-listings" className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Open Jobs</h1>
          {user && (
            <Link
              href="/talent"
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              ← Back to Dashboard
            </Link>
          )}
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
      <Footer />
    </div>
  );
}
