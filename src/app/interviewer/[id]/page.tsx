// Candidate interview runtime page
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
  params: { id: string };
  searchParams: { [k: string]: string | string[] | undefined };
}) {
  const id = (params?.id || "").trim();
  const token = (
    typeof searchParams?.t === "string" ? searchParams.t : ""
  ).trim();
  if (!id || !token) redirect("/interviewer/start");

  const session = await fetchSession(id, token);
  if (!session) redirect("/interviewer/start");

  // Build job context for the interviewer
  const jobContext: string = [
    session?.jdTextSnapshot,
    (session?.focusAreasSnapshot || []).join(", "),
  ]
    .filter(Boolean)
    .join("\n\nFocus: ");

  // Friendly first prompt
  const initialQuestion = `Hi ${
    session?.candidate?.name || "there"
  }. Thanks for joining. In 1–2 minutes, tell me about an experience that best prepares you for ${
    session?.roleName || "this role"
  }.`;

  // Company / brand to show across the preflight + live panes
  const companyName: string =
    session?.job?.company ||
    session?.company?.name ||
    session?.clientName ||
    session?.companyName ||
    session?.org?.name ||
    session?.employer?.name ||
    session?.tenant?.name ||
    "";

  return (
    <ClientInterview
      sessionId={String(session._id)}
      token={token}
      jobContext={jobContext}
      resumeSummary={""}
      initialQuestion={initialQuestion}
      companyName={companyName}
    />
  );
}
