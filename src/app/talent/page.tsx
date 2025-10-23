// src/app/talent/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/use-session";
import ResumeCard from "@/components/resumeCard";
import DashboardShell from "@/components/dashboardBar";

type TabKey =
  | "overview"
  | "applications"
  | "interviews"
  | "offers"
  | "contracts"
  | "payments";

type TalentOverviewResponse = {
  ok: boolean;
  user?: { id: string; name: string; email: string; role: string };
  summary?: {
    applicationsTotal: number;
    applicationsSubmitted: number;
    applicationsPast: number;
    interviewsUpcoming: number;
    interviewsPast: number;
    offers: number;
    contracts: number;
  };
  data?: {
    submittedApplications: any[];
    pastApplications: any[];
    upcomingInterviews: any[];
    pastInterviews: any[];
    offers: any[];
    contracts: any[];
    payments: any[];
  };
  error?: string;
};

export default function TalentDashboardPage() {
  const router = useRouter();
  const { user, loading } = useSession();
  const [tab, setTab] = useState<TabKey>("overview");
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [payload, setPayload] = useState<TalentOverviewResponse | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);

  useEffect(() => {
    // gate by role
    if (!loading) {
      if (!user) {
        router.replace("/interviewer/start/login?role=talent");
      } else if (user.role !== "talent") {
        router.replace("/admin"); // non-talent goes to admin area
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function run() {
      setBusy(true);
      setErr(null);
      try {
        const res = await fetch("/api/talent/overview", { cache: "no-store" });
        const j: TalentOverviewResponse = await res.json();
        if (!res.ok || !j.ok) {
          throw new Error(j.error || "Failed to load dashboard");
        }
        setPayload(j);
      } catch (e: any) {
        setErr(e.message || "Error");
      } finally {
        setBusy(false);
      }
    }
    if (!loading) run();
  }, [loading]);

  useEffect(() => {
    if (user && user.resume?.url) {
      setResumeUrl(user.resume.url);
      setResumeFileName(user.resume.fileName || null);
    }
  }, [user]);

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Upload to Cloudinary or your storage
    // ...existing upload logic...
    // After upload, update user profile via API
    // Example:
    // await fetch("/api/talent/update-resume", { method: "POST", body: ... });
    // Then update local state
    // setResumeUrl(uploadedUrl);
    // setResumeFileName(file.name);
  }

  if (loading || busy) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 h-8 w-48 rounded bg-gray-200" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl border bg-white p-4">
              <div className="h-6 w-24 rounded bg-gray-200" />
              <div className="mt-3 h-4 w-32 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-xl border bg-rose-50 p-4 text-rose-700">
          {err}
        </div>
      </div>
    );
  }

  const summary = payload?.summary!;
  const data = payload?.data!;

  return (
    <DashboardShell
      user={{ name: user?.name, email: user?.email, role: "talent" }}
      title={`Welcome back${
        payload?.user?.name ? `, ${payload.user.name}` : ""
      } 👋`}
      nav={[
        { href: "/talent", label: "Overview", exact: true },
        { href: "/jobs", label: "Explore Jobs" },
        { href: "/talent/profile", label: "Profile" },
        { href: "/settings", label: "Settings" }, // your multi-tab settings page
      ]}
      onSignOut={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        location.href = "/";
      }}
    >
      <div className="relative min-h-[80vh] overflow-hidden">
        {/* subtle bg */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(60rem 60rem at 10% 10%, rgba(59,130,246,0.08), transparent 45%)," +
              "radial-gradient(50rem 50rem at 90% 30%, rgba(16,185,129,0.08), transparent 45%)",
          }}
        />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-8">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              {/* <h1 className="text-2xl font-bold">
                Welcome back
                {payload?.user?.name ? `, ${payload.user.name}` : ""} 👋
              </h1> */}
              <p className="text-sm text-gray-600">
                Track your applications, interviews, and offers.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/talent/profile"
                className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
              >
                Update Profile
              </Link>
              <Link
                href="/jobs"
                className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
              >
                Explore Jobs
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex flex-wrap gap-2">
            {[
              { k: "overview", label: "Overview" },
              { k: "applications", label: "Applications" },
              { k: "interviews", label: "Interviews" },
              { k: "offers", label: "Offers" },
              { k: "contracts", label: "Contracts" },
              { k: "payments", label: "Payments" },
            ].map((t) => (
              <button
                key={t.k}
                onClick={() => setTab(t.k as TabKey)}
                className={`rounded-full border px-3 py-1 text-sm cursor-pointer ${
                  tab === t.k
                    ? "bg-black text-white"
                    : "bg-white text-gray-900 hover:bg-gray-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {tab === "overview" && (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <Stat
                  title="Applications"
                  value={summary.applicationsTotal}
                  hint={`${summary.applicationsSubmitted} active`}
                />
                <Stat
                  title="Upcoming interviews"
                  value={summary.interviewsUpcoming}
                />
                <Stat title="Past interviews" value={summary.interviewsPast} />
                <Stat title="Offers" value={summary.offers} />
                <Stat title="Contracts" value={summary.contracts} />
                <Stat title="Payments" value={(data.payments || []).length} />
              </div>

              <Section title="Submitted applications" className="mt-8">
                <GridOrEmpty
                  items={data.submittedApplications}
                  empty="No submitted applications yet."
                  render={(s) => <ApplicationCard key={s._id} s={s} />}
                />
              </Section>

              <Section title="Past applications" className="mt-6">
                <GridOrEmpty
                  items={data.pastApplications}
                  empty="No past applications."
                  render={(s) => <ApplicationCard key={s._id} s={s} />}
                />
              </Section>
            </>
          )}

          {tab === "applications" && (
            <div className="grid gap-8">
              <Section title="Submitted applications">
                <GridOrEmpty
                  items={data.submittedApplications}
                  empty="No submitted applications."
                  render={(s) => <ApplicationCard key={s._id} s={s} />}
                />
              </Section>
              <Section title="Past applications">
                <GridOrEmpty
                  items={data.pastApplications}
                  empty="No past applications."
                  render={(s) => <ApplicationCard key={s._id} s={s} past />}
                />
              </Section>
            </div>
          )}

          {tab === "interviews" && (
            <div className="grid gap-8">
              <Section title="Upcoming interviews">
                <GridOrEmpty
                  items={data.upcomingInterviews}
                  empty="No upcoming interviews."
                  render={(s) => <InterviewCard key={s._id} s={s} />}
                />
              </Section>
              <Section title="Past interviews">
                <GridOrEmpty
                  items={data.pastInterviews}
                  empty="No past interviews."
                  render={(s) => <InterviewCard key={s._id} s={s} past />}
                />
              </Section>
            </div>
          )}

          {tab === "offers" && (
            <Section title="Offers">
              <GridOrEmpty
                items={data.offers}
                empty="No offers yet."
                render={(o, i) => (
                  <div key={i} className="rounded-xl border bg-white p-4">
                    <div className="text-sm text-gray-600">No schema yet.</div>
                  </div>
                )}
              />
            </Section>
          )}

          {tab === "contracts" && (
            <Section title="Contracts">
              <GridOrEmpty
                items={data.contracts}
                empty="No contracts yet."
                render={(c, i) => (
                  <div key={i} className="rounded-xl border bg-white p-4">
                    <div className="text-sm text-gray-600">No schema yet.</div>
                  </div>
                )}
              />
            </Section>
          )}

          {tab === "payments" && (
            <Section title="Payments">
              <GridOrEmpty
                items={data.payments}
                empty="No payments yet."
                render={(p, i) => (
                  <div key={i} className="rounded-xl border bg-white p-4">
                    <div className="text-sm text-gray-600">No schema yet.</div>
                  </div>
                )}
              />
            </Section>
          )}

          <div className="mb-8 mt-8">
            <ResumeCard
              resumeUrl={resumeUrl}
              resumeFileName={resumeFileName}
              onUpload={handleResumeUpload}
            />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function Stat({
  title,
  value,
  hint,
}: {
  title: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="mt-1 text-2xl font-bold text-gray-400">{value}</div>
      {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
    </div>
  );
}

function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="mb-2 text-sm font-semibold">{title}</div>
      {children}
    </section>
  );
}

function GridOrEmpty<T>({
  items,
  empty,
  render,
}: {
  items: T[];
  empty: string;
  render: (item: T, index: number) => React.ReactNode;
}) {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-4 text-sm text-gray-600">
        {empty}
      </div>
    );
  }
  return (
    <div className="grid gap-3">{items.map((item, i) => render(item, i))}</div>
  );
}

function ApplicationCard({ s, past }: { s: any; past?: boolean }) {
  const job = s.job || {};

  // Treat these as "finished" states (won't show View/Continue)
  const finishedStatuses = new Set([
    "completed",
    "finished",
    "submitted",
    "closed",
    "rejected",
    "withdrawn",
    "hired",
  ]);
  const isFinished = finishedStatuses.has(String(s.status || "").toLowerCase());

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">
            <p className="text-gray-700">
              {job.title || s.jobTitle || "Untitled role"}
            </p>
          </div>
          <div className="text-xs text-gray-600">
            {job.salaryCurrency || s.salaryCurrency
              ? `${job.salaryCurrency || s.salaryCurrency}`
              : ""}{" "}
            {job.company || s.company || "—"} •{" "}
            {job.employmentType || s.employmentType || "—"}
          </div>
        </div>
        <div className="text-xs px-2 py-0.5 rounded-full border">
          {past ? "Past" : s.status || "—"}
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-600">
        Submitted on{" "}
        {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—"}
      </div>

      <div className="mt-3 flex gap-2">
        {/* Only allow continuing if not finished and token exists */}
        {!isFinished && s.token ? (
          <Link
            href={`/interview/${s.token}`}
            className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50 text-gray-500"
          >
            View / Continue
          </Link>
        ) : null}

        {/* Removed "Job Page" per requirement */}
      </div>
    </div>
  );
}

function InterviewCard({ s, past }: { s: any; past?: boolean }) {
  const job = s.job || {};
  const when = s.startedAt || s.finishedAt || s.updatedAt || s.createdAt;

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">
            {job.title || s.jobTitle || "Interview"}
          </div>
          <div className="text-xs text-gray-600">
            {job.company || s.company || "—"}
          </div>
        </div>
        <div className="text-xs px-2 py-0.5 rounded-full border">
          {past ? "Past" : "Upcoming"}
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-600">
        {when ? new Date(when).toLocaleString() : "—"}
      </div>

      <div className="mt-3 flex gap-2">
        {/* Candidates should not open past/finished interviews */}
        {!past && s.token ? (
          <Link
            href={`/interview/${s.token}`}
            className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
          >
            Open
          </Link>
        ) : null}
      </div>
    </div>
  );
}
