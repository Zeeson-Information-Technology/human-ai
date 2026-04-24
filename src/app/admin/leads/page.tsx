import dbConnect from "@/lib/db-connect";
import { getAdminFromCookies } from "@/lib/admin-session";
import { getEffectivePermissions, isPlatformAdminRole } from "@/lib/admin-auth";
import { getOperatorFromCookies } from "@/lib/get-operator";
import Inquiry from "@/model/inquiry";
import User from "@/model/user";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

type LeadStatus = "new" | "in_review" | "replied" | "closed";

type InquiryDoc = {
  _id: unknown;
  name: string;
  email: string;
  company: string;
  message?: string;
  handled?: boolean;
  status?: LeadStatus;
  notes?: string;
  lastContactAt?: Date | string | number | null;
  assignedUserId?: unknown;
  assignedUserEmail?: string;
  assignedAt?: Date | string | number | null;
  workspaceCode?: string;
  workspaceTitle?: string;
  convertedAt?: Date | string | number | null;
  createdAt: Date | string | number;
};

type Lead = {
  id: string;
  name: string;
  email: string;
  company: string;
  message: string;
  handled: boolean;
  status: LeadStatus;
  notes: string;
  lastContactAt: string;
  assignedUserId: string;
  assignedUserEmail: string;
  assignedAt: string;
  workspaceCode: string;
  workspaceTitle: string;
  convertedAt: string;
  createdAt: string;
};

type TeamMember = {
  id: string;
  email: string;
  role: string;
};

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "in_review", label: "In review" },
  { value: "replied", label: "Replied" },
  { value: "closed", label: "Closed" },
];

function fmtDate(iso?: string) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "-";
  }
}

function statusBadge(status: LeadStatus) {
  switch (status) {
    case "new":
      return "bg-slate-900 text-white";
    case "in_review":
      return "bg-amber-500 text-white";
    case "replied":
      return "bg-emerald-600 text-white";
    case "closed":
      return "bg-gray-200 text-gray-800";
    default:
      return "bg-slate-900 text-white";
  }
}

async function getLeads(operator: {
  id: string;
  role?: string;
}): Promise<Lead[]> {
  await dbConnect();
  const query = isPlatformAdminRole(operator.role)
    ? {}
    : { assignedUserId: operator.id };
  const docs = (await Inquiry.find(query).sort({ createdAt: -1 }).lean()) as
    unknown as InquiryDoc[];

  return docs.map((doc) => {
    const status =
      doc.status ?? (doc.handled ? ("closed" as LeadStatus) : "new");
    return {
      id: String(doc._id),
      name: doc.name,
      email: doc.email,
      company: doc.company,
      message: doc.message ?? "",
      handled: Boolean(doc.handled),
      status,
      notes: doc.notes ?? "",
      lastContactAt: doc.lastContactAt
        ? new Date(doc.lastContactAt).toISOString()
        : "",
      assignedUserId: doc.assignedUserId ? String(doc.assignedUserId) : "",
      assignedUserEmail: doc.assignedUserEmail ?? "",
      assignedAt: doc.assignedAt ? new Date(doc.assignedAt).toISOString() : "",
      workspaceCode: doc.workspaceCode ?? "",
      workspaceTitle: doc.workspaceTitle ?? "",
      convertedAt: doc.convertedAt
        ? new Date(doc.convertedAt).toISOString()
        : "",
      createdAt: new Date(doc.createdAt).toISOString(),
    };
  });
}

async function getAssignableUsers(): Promise<TeamMember[]> {
  await dbConnect();
  const docs = await User.find(
    { role: { $in: ["staff", "recruiter", "manager"] } },
    { email: 1, role: 1 }
  )
    .sort({ email: 1 })
    .lean();
  return docs.map((doc: any) => ({
    id: String(doc._id),
    email: doc.email || "",
    role:
      doc.role === "recruiter" || doc.role === "manager" ? "staff" : doc.role,
  }));
}

async function updateLead(formData: FormData) {
  "use server";

  const operator = await getOperatorFromCookies();
  if (!operator) return;

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as LeadStatus;
  const notes = String(formData.get("notes") || "").trim();
  const markContacted = String(formData.get("markContacted") || "") === "true";
  const assignedUserId = String(formData.get("assignedUserId") || "").trim();

  if (!id) return;
  if (!STATUS_OPTIONS.some((option) => option.value === status)) return;

  await dbConnect();
  const doc = await Inquiry.findById(id);
  if (!doc) return;
  if (
    !isPlatformAdminRole(operator.role) &&
    String(doc.assignedUserId || "") !== String(operator.id)
  ) {
    return;
  }

  doc.status = status;
  doc.handled = status === "closed";
  doc.notes = notes;
  if (isPlatformAdminRole(operator.role)) {
    const assignedUser = assignedUserId
      ? await User.findById(assignedUserId, { email: 1 }).lean()
      : null;
    doc.assignedUserId = assignedUserId || undefined;
    doc.assignedUserEmail = (assignedUser as any)?.email || "";
    doc.assignedAt = assignedUserId ? new Date() : undefined;
  }
  if (markContacted) {
    doc.lastContactAt = new Date();
  }
  await doc.save();
  revalidatePath("/admin/leads");
}

async function logout() {
  "use server";
  const jar = await cookies();
  jar.set("admin_token", "", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
  });
  jar.set("token", "", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
  });
  redirect("/admin/login");
}

export default async function AdminLeadsPage() {
  const admin = await getAdminFromCookies();
  if (!admin) redirect("/admin/login");
  const operator = await getOperatorFromCookies();
  if (!operator) redirect("/admin/login");
  const permissions = getEffectivePermissions(operator);
  if (!permissions.canManageInquiries) redirect("/admin");

  const isAdmin = isPlatformAdminRole(operator.role);
  const [leads, teamMembers] = await Promise.all([
    getLeads(operator),
    isAdmin ? getAssignableUsers() : Promise.resolve([]),
  ]);

  const counts = {
    total: leads.length,
    new: leads.filter((lead) => lead.status === "new").length,
    inReview: leads.filter((lead) => lead.status === "in_review").length,
    replied: leads.filter((lead) => lead.status === "replied").length,
    closed: leads.filter((lead) => lead.status === "closed").length,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Proposal Inquiries</h1>
          <p className="mt-1 text-sm text-gray-600">
            {isAdmin ? "Full intake queue" : "Assigned intake queue"} | Total:{" "}
            {counts.total} | New: {counts.new} | In review: {counts.inReview} |
            {" "}Replied: {counts.replied} | Closed: {counts.closed}
          </p>
          {isAdmin && (
            <p className="mt-1 text-sm text-gray-600">
              Use this page when an opportunity starts from the website. For direct sales or client conversations, create the opportunity from the dashboard instead.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
          >
            Dashboard
          </Link>
          {isAdmin && (
            <>
              <Link
                href="/admin/opportunities/new"
                className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
              >
                Create opportunity directly
              </Link>
            </>
          )}
          <form action={logout}>
            <button className="cursor-pointer rounded-lg border px-3 py-1 text-sm hover:bg-gray-50">
              Sign out
            </button>
          </form>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {leads.length === 0 && (
          <div className="rounded-2xl border bg-gray-50 p-8 text-center text-sm text-gray-600">
            {isAdmin
              ? "No proposal inquiries yet. New website or app contact requests will appear here."
              : "No assigned inquiries yet. When an admin assigns intake work to you, it will appear here."}
          </div>
        )}

        {leads.map((lead) => (
          <form
            key={lead.id}
            action={updateLead}
            className="rounded-2xl border p-4 shadow-sm"
          >
            <input type="hidden" name="id" value={lead.id} />

            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-semibold">{lead.company}</div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusBadge(
                      lead.status
                    )}`}
                  >
                    {STATUS_OPTIONS.find((option) => option.value === lead.status)
                      ?.label || lead.status}
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  {lead.name} &lt;{lead.email}&gt; | {fmtDate(lead.createdAt)}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Last contact: {fmtDate(lead.lastContactAt)}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Assigned to: {lead.assignedUserEmail || "Unassigned"}
                  {lead.assignedAt ? ` | ${fmtDate(lead.assignedAt)}` : ""}
                </div>
                {lead.workspaceCode && (
                  <div className="mt-1 text-xs text-gray-500">
                    Opportunity: {lead.workspaceTitle || "Opportunity"} |{" "}
                    {lead.workspaceCode} | Converted: {fmtDate(lead.convertedAt)}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {isAdmin && (
                  <select
                    name="assignedUserId"
                    defaultValue={lead.assignedUserId}
                    className="rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="">Assign to staff...</option>
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.email}
                      </option>
                    ))}
                  </select>
                )}
                <select
                  name="status"
                  defaultValue={lead.status}
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="cursor-pointer rounded-lg bg-black px-3 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  Save
                </button>
                <button
                  type="submit"
                  name="markContacted"
                  value="true"
                  className="cursor-pointer rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                >
                  Mark contacted
                </button>
                {lead.workspaceCode ? (
                  <Link
                    href={`/admin/jobs/${lead.workspaceCode}`}
                    className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    Open opportunity
                  </Link>
                ) : isAdmin ? (
                  <Link
                    href={`/admin/opportunities/new?inquiry=${lead.id}`}
                    className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    Create opportunity
                  </Link>
                ) : null}
                {isAdmin && (
                  <button
                    type="submit"
                    className="cursor-pointer rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    Apply assignee
                  </button>
                )}
              </div>
            </div>

            <p className="mt-4 whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-sm text-gray-800">
              {lead.message}
            </p>

            <div className="mt-4">
              <label
                htmlFor={`notes-${lead.id}`}
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Notes
              </label>
              <textarea
                id={`notes-${lead.id}`}
                name="notes"
                defaultValue={lead.notes}
                placeholder="Add internal notes, response plan, owner handoff, or follow-up detail."
                className="min-h-[110px] w-full rounded-xl border p-3 text-sm"
              />
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}

