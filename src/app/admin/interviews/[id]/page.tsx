import DashboardShell from "@/components/dashboardBar";
import Link from "next/link";
import { Types } from "mongoose";
import { notFound, redirect } from "next/navigation";
import { getAdminFromCookies } from "@/lib/admin-session";
import { getAdminNav } from "@/lib/admin-dashboard";
import { isPlatformAdminRole } from "@/lib/admin-auth";
import dbConnect from "@/lib/db-connect";
import { getOperatorFromCookies } from "@/lib/get-operator";
import { Job } from "@/model/opportunity";
import Session from "@/model/session";

function fmt(dt?: string | Date | null) {
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
export default async function AdminInterviewDetail({
  params,
}: {
  params: { id: string };
}) {
  const admin = await getAdminFromCookies();
  if (!admin) redirect("/admin/login");

  const me = await getOperatorFromCookies();
  if (!me) {
    redirect("/admin/login");
  }

  const id = (params?.id || "").trim();
  if (!id || !Types.ObjectId.isValid(id)) notFound();

  await dbConnect();
  const doc = await Session.findById(id).lean();
  if (!doc) notFound();
  if (!isPlatformAdminRole(me.role)) {
    const workspace = doc.jobCode
      ? await Job.findOne(
          { code: doc.jobCode },
          { assignedUserId: 1 }
        ).lean()
      : null;
    if (!workspace || String((workspace as any).assignedUserId || "") !== String(me.id)) {
      redirect("/admin/interviews");
    }
  }

  const steps = Array.isArray(doc.steps) ? doc.steps : [];
  const base = process.env.APP_BASE_URL || "http://localhost:3000";

  const reportsRes = await fetch(`${base}/api/admin/reports/${id}`, {
    cache: "no-store",
  }).catch(() => null);
  const reports =
    reportsRes && reportsRes.ok
      ? await reportsRes.json().catch(() => ({}))
      : {};

  const snapsRes = await fetch(`${base}/api/admin/reports/${id}/snapshots`, {
    cache: "no-store",
  }).catch(() => null);
  const snaps =
    snapsRes && snapsRes.ok ? await snapsRes.json().catch(() => ({})) : {};

  return (
    <DashboardShell
      user={{
        name: (me as any).name ?? me.email ?? "Admin",
        email: me.email,
        role: me.role as any,
      }}
      title="Structured Review"
      nav={getAdminNav(me.role)}
    >
    <div className="mx-auto max-w-5xl px-4 py-2">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Structured Review</h1>
        <Link
          href="/admin/interviews"
          className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
        >
          Back
        </Link>
      </div>

      <div className="rounded-2xl border p-5">
        <div className="text-sm text-gray-600">
          {doc.jobTitle ? (
            <>
              Opportunity: <span className="font-medium">{doc.jobTitle}</span>
              {doc.company ? <> | {doc.company}</> : null}
              {doc.jobCode ? <> | {doc.jobCode}</> : null}
              {" | "}
            </>
          ) : null}
          Role: <span className="font-medium">{doc.roleName || "-"}</span> |
          Participant type:{" "}
          <span className="font-medium uppercase">
            {((doc as any).participantType || "participant") === "candidate"
              ? "participant"
              : (doc as any).participantType || "participant"}
          </span>{" "}
          |
          Language: <span className="font-medium">{doc.language}</span> |
          Status: <span className="font-medium uppercase">{doc.status}</span>
        </div>

        <div className="mt-2 text-sm text-gray-600">
          Started: {fmt(doc.startedAt)} | Finished: {fmt(doc.finishedAt)}
        </div>

        {doc.scorecard && (
          <div className="mt-4 rounded-xl border bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Scorecard</div>
            <div className="mt-1 text-lg font-semibold text-gray-800">
              Overall: {doc.scorecard.overallScore} / 100
            </div>
            <div className="text-sm text-gray-600">
              Verdict: {doc.scorecard.verdict}
            </div>
            {doc.scorecard.summary && (
              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">
                {doc.scorecard.summary}
              </p>
            )}
          </div>
        )}

        {doc.screeners && (
          <div className="mt-4 rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Qualification Responses</div>
              {doc.screenersSummary && (
                <div className="text-xs text-gray-600">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${
                      doc.screenersSummary.qualifies
                        ? "bg-emerald-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {doc.screenersSummary.qualifies ? "Qualified" : "Not qualified"}
                  </span>
                  <span className="ml-2">
                    {doc.screenersSummary.qualifyingPassed}/
                    {doc.screenersSummary.qualifyingTotal} qualifying passed
                  </span>
                </div>
              )}
            </div>

            {Array.isArray((doc as any).screeners?.legacy) &&
              (doc as any).screeners.legacy.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs text-gray-500">Legacy questions</div>
                  <div className="mt-2 grid gap-2">
                    {(doc as any).screeners.legacy.map((x: any, i: number) => (
                      <div key={i} className="rounded-lg border p-3 text-sm">
                        <div className="font-medium">{x.question}</div>
                        <div className="mt-1 whitespace-pre-wrap text-gray-700">
                          {x.answer || "-"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {Array.isArray((doc as any).screeners?.rules) &&
              (doc as any).screeners.rules.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs text-gray-500">Structured qualifiers</div>
                  <div className="mt-2 grid gap-2">
                    {(doc as any).screeners.rules.map((r: any, i: number) => (
                      <div key={i} className="rounded-lg border p-3 text-sm">
                        <div className="flex items-center justify-between">
                          <div className="mr-3 font-medium">{r.question}</div>
                          {r.qualifying && (
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                                r.pass === true
                                  ? "bg-emerald-600 text-white"
                                  : "bg-red-600 text-white"
                              }`}
                            >
                              {r.pass === true ? "Pass" : "Fail"}
                            </span>
                          )}
                        </div>
                        <div className="mt-1">
                          <span className="text-gray-500">Answer:</span>{" "}
                          <span className="text-gray-800">
                            {typeof r.answer === "boolean"
                              ? String(r.answer)
                              : String(r.answer ?? "-")}
                          </span>
                        </div>
                        {(typeof r.min === "number" ||
                          typeof r.max === "number" ||
                          r.qualifyWhen) && (
                          <div className="mt-1 text-xs text-gray-500">
                            {typeof r.min === "number"
                              ? `Min ${r.min}${r.unit ? ` ${r.unit}` : ""}`
                              : ""}
                            {typeof r.min === "number" &&
                            typeof r.max === "number"
                              ? " | "
                              : ""}
                            {typeof r.max === "number"
                              ? `Max ${r.max}${r.unit ? ` ${r.unit}` : ""}`
                              : ""}
                            {r.qualifyWhen && (
                              <span className="ml-1">
                                ({r.qualifyWhen}{" "}
                                {Array.isArray(r.qualifyValue)
                                  ? r.qualifyValue.join(", ")
                                  : String(r.qualifyValue ?? "")}
                                )
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}

        {doc.jdTextSnapshot && (
          <details className="mt-4 rounded-xl border p-4 text-sm">
            <summary className="cursor-pointer font-medium">
              Role brief snapshot
            </summary>
            <pre className="mt-2 whitespace-pre-wrap text-gray-800">
              {doc.jdTextSnapshot}
            </pre>
          </details>
        )}

        {Array.isArray(doc.focusAreasSnapshot) &&
          doc.focusAreasSnapshot.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {doc.focusAreasSnapshot.map((f: string) => (
                <span
                  key={f}
                  className="rounded-full border bg-white px-2 py-0.5 text-xs text-gray-600"
                >
                  {f}
                </span>
              ))}
            </div>
          )}
      </div>

      <h2 className="mt-8 text-lg font-semibold">Q&A</h2>
      <div className="mt-3 grid gap-3">
        {steps.map((s: any, i: number) => (
          <div key={`${s.qId}-${i}`} className="rounded-xl border p-4">
            <div className="text-sm text-gray-500">
              Question {i + 1}
              {s.startedAt ? ` | ${fmt(s.startedAt)}` : ""}
            </div>
            <p className="mt-1 font-medium">{s.qText}</p>

            {s.audioUrl && (
              <audio
                className="mt-3 w-full"
                src={s.audioUrl}
                controls
                preload="none"
              />
            )}
            {(s.transcript || s.answerText) && (
              <div className="mt-3 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm text-gray-800">
                {s.transcript || s.answerText}
              </div>
            )}
            <div className="mt-2 text-xs text-gray-500">
              Duration:{" "}
              {s.durationMs ? `${(s.durationMs / 1000).toFixed(1)}s` : "-"}
            </div>
          </div>
        ))}

        {steps.length === 0 && (
          <div className="rounded-xl border bg-gray-50 p-6 text-center text-sm text-gray-600">
            No steps recorded.
          </div>
        )}
      </div>

      <h2 className="mt-10 text-lg font-semibold">Artifacts</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border p-4">
          <div className="text-sm font-medium">Reports</div>
          <div className="mt-2 space-y-2 text-sm text-gray-700">
            {reports?.jsonUrl ? (
              <a className="underline" href={reports.jsonUrl} target="_blank">
                Summary JSON
              </a>
            ) : (
              <div className="text-gray-500">No JSON yet</div>
            )}
            {reports?.pdfUrl ? (
              <a
                className="block underline"
                href={reports.pdfUrl}
                target="_blank"
              >
                Summary PDF
              </a>
            ) : (
              <div className="text-gray-500">No PDF yet</div>
            )}
            {reports?.jsonUrl && <ReportPreview url={reports.jsonUrl} />}
          </div>
        </div>

        <div className="rounded-2xl border p-4">
          <div className="text-sm font-medium">Anti-cheat timeline</div>
          <div className="mt-2 max-h-64 overflow-auto text-sm text-gray-700">
            {Array.isArray((doc as any).antiCheatEvents) &&
            (doc as any).antiCheatEvents.length > 0 ? (
              <ul className="space-y-1">
                {(doc as any).antiCheatEvents.map((e: any, i: number) => (
                  <li key={i} className="text-xs text-gray-600">
                    <span className="text-gray-500">{fmt(e?.ts)}</span> |{" "}
                    <span className="font-medium">{e?.type}</span>
                    {e?.detail ? (
                      <span className="text-gray-500">: {e.detail}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500">No events</div>
            )}
          </div>
        </div>
      </div>

      {Array.isArray(snaps?.items) && snaps.items.length > 0 && (
        <div className="mt-4 rounded-2xl border p-4">
          <div className="text-sm font-medium">Snapshots</div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {snaps.items.map((it: any) => (
              <a key={it.key} href={it.url} target="_blank" className="block">
                <img
                  src={it.url}
                  alt="snapshot"
                  className="h-32 w-full rounded-lg border object-cover"
                />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
    </DashboardShell>
  );
}
async function ReportPreview({ url }: { url: string }) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    const text = JSON.stringify(json, null, 2);
    return (
      <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap rounded-lg border bg-gray-50 p-3 text-xs text-gray-800">
        {text}
      </pre>
    );
  } catch {
    return null;
  }
}
