import { redirect } from "next/navigation";
import ClientInterview from "./ClientInterview";

async function fetchSession(id: string, token: string) {
  const base = process.env.APP_BASE_URL || "http://localhost:3000";
  const url = `${base}/api/zuri/sessions/${encodeURIComponent(
    id
  )}?t=${encodeURIComponent(token)}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    const j = await res.json();
    if (!res.ok || !j.ok) return null;
    return j.session as any;
  } catch {
    return null;
  }
}

export default async function InterviewRunPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>; // dY`^ Promise
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>; // dY`^ Promise
}) {
  const { id } = await params; // dY`^ await
  const sp = await searchParams; // dY`^ await
  const token = (typeof sp?.t === "string" ? sp.t : "").trim();

  if (!id || !token) redirect("/zuri/start");

  const session = await fetchSession(id, token);
  if (!session) redirect("/zuri/start");

  if (session.status === "finished") {
    const finishedAt =
      session.finishedAt && typeof session.finishedAt === "string"
        ? new Date(session.finishedAt)
        : session.finishedAt instanceof Date
        ? session.finishedAt
        : null;

    const finishedLabel = finishedAt
      ? finishedAt.toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : null;

    return (
      <main className="min-h-[100svh] w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-950/70 shadow-xl p-8 text-center space-y-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-6 w-6"
            >
              <path
                fill="currentColor"
                d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm4.3 8.3-4.5 4.5a1 1 0 0 1-1.4 0l-2.5-2.5a1 1 0 0 1 1.4-1.4l1.8 1.79 3.8-3.79a1 1 0 0 1 1.4 1.41Z"
              />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">
              Interview already completed
            </h1>
            <p className="text-sm text-slate-300">
              Our records show that you&apos;ve already completed this interview
              for the invited role
              {finishedLabel ? ` on ${finishedLabel}` : ""}. You don&apos;t
              need to do anything else.
            </p>
          </div>
          <p className="text-xs text-slate-500">
            If you believe this is a mistake, please contact your recruiter or
            reply to the invitation email so the team can review your status.
          </p>
          <div className="flex justify-center pt-2">
            <a
              href="/jobs"
              className="inline-flex items-center justify-center rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-white transition-colors"
            >
              Browse other roles
            </a>
          </div>
        </div>
      </main>
    );
  }

  const jobContext: string = [
    session?.jdTextSnapshot,
    (session?.focusAreasSnapshot || []).join(", "),
  ]
    .filter(Boolean)
    .join("\n\nFocus: ");

  const initialQuestion = `Hi ${
    session?.candidate?.name || "there"
  }. Thanks for joining. In 1-2 minutes, tell me about an experience that best prepares you for ${
    session?.roleName || "this role"
  }.`;

  let companyName: string =
    session?.job?.company ||
    session?.company?.name ||
    session?.clientName ||
    session?.companyName ||
    session?.org?.name ||
    session?.employer?.name ||
    session?.tenant?.name ||
    "";

  // Fallback: fetch company from Job by jobCode if still empty
  if (!companyName && session?.jobCode) {
    try {
      const base = process.env.APP_BASE_URL || "http://localhost:3000";
      const jobRes = await fetch(
        `${base}/api/public/jobs/${encodeURIComponent(session.jobCode)}`,
        { cache: "no-store" }
      );
      if (jobRes.ok) {
        const { job } = await jobRes.json();
        if (job?.company) companyName = String(job.company);
      }
    } catch {}
  }

  // Enhanced prompt and primary skill for micro1-like flow
  const candidateName = session?.candidate?.name || "there";
  const companyName2: string = companyName;
  const initialQuestion2 = `Hi ${candidateName}, my name is Zuri. I'm an AI interviewer at ${
    companyName2 || "the company"
  }. How's your day going so far?`;
  const primarySkill: string =
    (Array.isArray(session?.job?.languages) && session.job.languages[0]) ||
    (Array.isArray(session?.focusAreasSnapshot) &&
      session.focusAreasSnapshot[0]) ||
    "";

  return (
    <ClientInterview
      sessionId={String(session._id)}
      token={token}
      jobContext={jobContext}
      resumeSummary=""
      initialQuestion={initialQuestion2}
      companyName={companyName2}
      primarySkill={primarySkill}
    />
  );
}
/* eslint-disable @typescript-eslint/no-explicit-any */
