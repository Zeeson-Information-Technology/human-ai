import DashboardShell from "@/components/dashboardBar";
import { notFound, redirect } from "next/navigation";
import { getAdminFromCookies } from "@/lib/admin-session";
import { getAdminNav } from "@/lib/admin-dashboard";
import dbConnect from "@/lib/db-connect";
import { getOperatorFromCookies } from "@/lib/get-operator";
import { isPlatformAdminRole } from "@/lib/admin-auth";
import { Opportunity } from "@/model/opportunity";
import ClientJobManager from "./ClientJobManager";

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

export default async function AdminJobDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams?: Promise<{ tab?: string }>;
}) {
  const admin = await getAdminFromCookies();
  if (!admin) redirect("/admin/login");
  const me = await getOperatorFromCookies();
  if (!me) redirect("/admin/login");

  const { code: rawCode = "" } = await params;
  const { tab: rawTab = "overview" } = (await searchParams) || {};
  const code = rawCode.trim();
  if (!code) notFound();

  const job = await getJobByCode(code);
  if (!job) notFound();
  if (
    !isPlatformAdminRole(me.role) &&
    String(job.assignedUserId || "") !== String(me.id)
  ) {
    redirect("/admin/opportunities");
  }

  const initialTab =
    rawTab === "overview" ||
    rawTab === "workbench" ||
    rawTab === "requests" ||
    rawTab === "reviews"
      ? rawTab
      : "overview";

  return (
    <DashboardShell
      user={{
        name: (me as any).name ?? me.email ?? "Admin",
        email: me.email,
        role: me.role as any,
      }}
      title="Opportunity"
      nav={getAdminNav(me.role)}
    >
    <div className="w-full min-w-0 px-4 py-2 text-white sm:px-5 lg:px-6">
      <div className="mb-4 flex min-w-0 flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <h1 className="min-w-0 text-xl font-bold leading-tight text-white sm:text-2xl lg:text-[2rem]">
          <span className="break-words">{job.title}</span>{" "}
          <span className="whitespace-nowrap text-white/55">| {job.code}</span>
        </h1>
        <a
          href="/admin/opportunities"
          className="w-full shrink-0 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-center text-sm text-white/85 transition hover:bg-white/10 hover:text-white md:w-auto"
        >
          Back to Opportunities
        </a>
      </div>

      <ClientJobManager
        initialJob={job}
        initialTab={initialTab}
        canEditWorkspace={me.role === "admin"}
        canManageAssignments={me.role === "admin"}
        currentUserEmail={me.email || ""}
      />
    </div>
    </DashboardShell>
  );
}

