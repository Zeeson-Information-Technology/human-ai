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
