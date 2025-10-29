// src/app/admin/jobs/[code]/page.tsx
import dbConnect from "@/lib/db-connect";
import { Job } from "@/model/job";
import { notFound } from "next/navigation";
import { getAdminFromCookies } from "@/lib/admin-session";
import ClientJobManager from "./ClientJobManager";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getJobByCode(code: string) {
  await dbConnect();
  const doc = await Job.findOne({ code }).lean();
  if (!doc) return null;
  return {
    id: String(doc._id),
    code: doc.code,
    title: doc.title,
    company: doc.company || "",
    roleName: doc.roleName || "",
    roleId: doc.roleId ? String(doc.roleId) : undefined,
    jdText: doc.jdText || "",
    languages: doc.languages || ["en"],
    focusAreas: doc.focusAreas || [],
    adminFocusNotes: doc.adminFocusNotes || "",
    screenerQuestions: doc.screenerQuestions || [],
    screenerRules: doc.screenerRules || [],
    location: doc.location || "remote",
    locationDetails: doc.locationDetails || "",
    employmentType: doc.employmentType || "full-time",
    seniority: doc.seniority || "mid",
    commImportance: doc.commImportance ?? 3,
    startDate: doc.startDate || "",
    skills: doc.skills || [],
    interviewType: doc.interviewType || "standard",
    salaryCurrency: doc.salaryCurrency,
    monthlySalaryMin: doc.monthlySalaryMin,
    monthlySalaryMax: doc.monthlySalaryMax,
    hoursPerWeek: doc.hoursPerWeek,
    active: !!doc.active,
    createdAt: doc.createdAt?.toISOString?.() || "",
    updatedAt: doc.updatedAt?.toISOString?.() || "",
  };
}

export default async function AdminJobDetailPage({
  params,
}: {
  params: { code: string };
}) {
  // 🔒 admin guard (middleware should already protect /admin/*)
  const admin = getAdminFromCookies();
  // if (!admin) redirect("/admin/login"); // optional

  const code = (params?.code || "").trim();
  if (!code) notFound();

  const job = await getJobByCode(code);
  if (!job) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="truncate text-2xl font-bold">
          {job.title} <span className="text-gray-500">• {job.code}</span>
        </h1>
        <a
          href="/admin/jobs"
          className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
        >
          Back to Jobs
        </a>
      </div>

      {/* Client manager mirrors the create flow, but prefilled and editable */}
      <ClientJobManager initialJob={job} />
    </div>
  );
}
