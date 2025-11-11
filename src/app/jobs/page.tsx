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
    { cache: "no-store" }
  );
  if (!res.ok) return [] as any[];
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
      <section className="pt-24 md:pt-32 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-6xl">
            Find your next role across Africa and the world
          </h1>

          <p className="mt-4 text-gray-700">
            Discover opportunities with trusted companies. Apply in minutes,
            complete a simple screening, and get timely updates. Remote and
            on‑site roles — fair, transparent, and people‑first.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/jobs#job-listings"
              className="inline-flex items-center 
              justify-center rounded-2xl px-6 py-3 text-white 
              font-semibold bg-gradient-to-r from-emerald-600 
              via-teal-600 to-sky-600 shadow-lg 
              shadow-emerald-500/20 hover:shadow-emerald-600/30 
              hover:opacity-95 transition-transform hover:-translate-y-0.5 
              min-w-[220px] md:min-w-[260px]"
              aria-label="Get hired: browse open roles"
            >
              Get hired
            </Link>
            <Link
              href="/zuri/start/login?role=talent"
              className="rounded-xl border px-6 py-3 
              font-medium hover:bg-gray-50"
            >
              Create your profile
            </Link>
          </div>
        </div>
      </section>

      {/* Value sections */}
      <WhyJoinUs />
      <HowItWorks />
      <Testimonials />
      <FAQ />

      {/* Listings */}
      <div id="job-listings" className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Open Jobs</h2>
          {user && (
            <Link
              href="/talent"
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Back to dashboard
            </Link>
          )}
        </div>

        <p className="mb-6 text-gray-600">
          Browse active roles and apply to start your screening.
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
                  {job.company || "-"} -{" "}
                  {Array.isArray(job.languages) ? job.languages.join(", ") : ""}{" "}
                  - Code: {job.code}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {(job.jdText || "").slice(0, 140)}
                  {(job.jdText || "").length > 140 ? "..." : ""}
                </div>
              </div>
              <Link
                href={`/jobs/apply?code=${encodeURIComponent(job.code)}`}
                className="rounded-xl bg-white px-4 py-2 text-black font-medium hover:opacity-90 cursor-pointer"
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
