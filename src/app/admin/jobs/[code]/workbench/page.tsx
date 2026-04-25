import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import DashboardShell from "@/components/dashboardBar";
import { getAdminFromCookies } from "@/lib/admin-session";
import { getAdminNav } from "@/lib/admin-dashboard";
import dbConnect from "@/lib/db-connect";
import { getOperatorFromCookies } from "@/lib/get-operator";
import { isPlatformAdminRole } from "@/lib/admin-auth";
import { Opportunity } from "@/model/opportunity";
import ClientJobManager from "../ClientJobManager";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function extractNoteValue(notes: string | undefined, label: string) {
  if (!notes) return "";
  const line = notes
    .split("\n")
    .find((entry) => entry.toLowerCase().startsWith(`${label.toLowerCase()}:`));
  return line ? line.slice(line.indexOf(":") + 1).trim() : "";
}

async function getJobByCode(code: string) {
  await dbConnect();
  const doc = await Opportunity.findOne({ code }).lean();
  if (!doc) return null;

  const notes = doc.adminFocusNotes || "";
  const derivedClientContact = extractNoteValue(notes, "Client rep");

  return {
    id: String(doc._id),
    code: doc.code,
    title: doc.title,
    company: doc.company || "",
    clientName: doc.clientName || doc.company || "",
    clientContactName: doc.clientContactName || derivedClientContact || "",
    clientContactEmail: doc.clientContactEmail || "",
    buyerOrganization:
      doc.buyerOrganization || extractNoteValue(notes, "Buyer / issuing authority"),
    solicitationNumber:
      doc.solicitationNumber || extractNoteValue(notes, "Solicitation number"),
    opportunitySource: doc.opportunitySource || extractNoteValue(notes, "Source"),
    submissionDeadline:
      doc.submissionDeadline || extractNoteValue(notes, "Submission deadline"),
    marketFocus: doc.marketFocus || extractNoteValue(notes, "Market focus"),
    roleName: doc.roleName || "",
    jdText: doc.jdText || "",
    focusAreas: doc.focusAreas || [],
    adminFocusNotes: doc.adminFocusNotes || "",
    documents: doc.documents || [],
    active: !!doc.active,
    createdAt: doc.createdAt?.toISOString?.() || "",
    assignedUserId: doc.assignedUserId ? String(doc.assignedUserId) : "",
    assignedUserEmail: doc.assignedUserEmail || "",
    workbench: doc.workbench || undefined,
  };
}

export default async function OpportunityWorkbenchPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const admin = await getAdminFromCookies();
  if (!admin) redirect("/admin/login");

  const me = await getOperatorFromCookies();
  if (!me) redirect("/admin/login");

  const { code: rawCode = "" } = await params;
  const code = rawCode.trim();
  if (!code) notFound();

  const job = await getJobByCode(code);
  if (!job) notFound();

  if (
    !isPlatformAdminRole(me.role) &&
    String(job.assignedUserId || "") !== String(me.id)
  ) {
    redirect("/admin/jobs");
  }

  return (
    <DashboardShell
      user={{
        name: (me as any).name ?? me.email ?? "Admin",
        email: me.email,
        role: me.role as any,
      }}
      title="Dedicated Workbench"
      nav={getAdminNav(me.role)}
    >
    <div className="mx-auto flex min-h-full max-w-7xl flex-col px-4 py-2 text-white sm:px-5 lg:px-6">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55 sm:text-xs">
            Dedicated workbench
          </div>
          <h1 className="mt-1 text-xl font-bold leading-tight text-white sm:text-2xl lg:text-[2rem]">
            <span className="break-words">{job.title}</span>{" "}
            <span className="whitespace-nowrap text-white/55">| {job.code}</span>
          </h1>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Link
            href={`/admin/jobs/${job.code}`}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-center text-sm text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            Back
          </Link>
          <Link
            href="/admin/jobs"
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-center text-sm text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            Opportunities
          </Link>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <ClientJobManager
          initialJob={job}
          initialTab="workbench"
          canEditWorkspace={me.role === "admin"}
          canManageAssignments={me.role === "admin"}
          workbenchOnly
          currentUserEmail={me.email || ""}
        />
      </div>
    </div>
    </DashboardShell>
  );
}
