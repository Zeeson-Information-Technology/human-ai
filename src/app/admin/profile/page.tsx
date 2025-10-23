// src/app/admin/profile/page.tsx
import Link from "next/link";
import DashboardShell from "@/components/dashboardBar";
import { redirect } from "next/navigation";
import { getAdminFromCookies } from "@/lib/admin-session";
import dbConnect from "@/lib/db-connect";
import User from "@/model/user";
import { getSessionUser } from "@/lib/auth-utils";
import AdminProfileClient from "./adminProfileClient";

export default async function AdminProfilePage() {
  const admin = getAdminFromCookies();
  if (!admin) redirect("/interviewer/start/login?role=client");

  // IMPORTANT: load the SAME user record your update route updates
  await dbConnect();

  // Try session user first (this is what your /api/admin/update-profile uses)
  const me = await getSessionUser().catch(() => null);

  let userDoc = null as any;
  if (me?.id) {
    userDoc = await User.findById(me.id, {
      name: 1,
      email: 1,
      phone: 1,
    }).lean();
  } else if (admin.email) {
    // Fallback by email if no session id is available
    userDoc = await User.findOne(
      { email: admin.email },
      { name: 1, email: 1, phone: 1 }
    ).lean();
  }

  const initial = {
    name: userDoc?.name || admin.name || "Admin",
    email: userDoc?.email || admin.email || "",
    phone: userDoc?.phone || "",
  };

  return (
    <DashboardShell
      user={{ name: initial.name, email: initial.email, role: "admin" }}
      title="Admin Profile"
      nav={[
        { href: "/admin", label: "Dashboard", exact: true },
        { href: "/admin/jobs", label: "Jobs" },
        { href: "/admin/interviews", label: "Interviews" },
        { href: "/admin/leads", label: "Leads" },
        { href: "/admin/settings", label: "Settings" },
        // (No Profile in top nav so footer shortcut can appear once)
      ]}
    >
      <div className="max-w-md">
        <div className="mb-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-sm text-gray-800 backdrop-blur hover:bg-gray-50"
          >
            <span aria-hidden>←</span> Back to admin dashboard
          </Link>
        </div>

        <h2 className="text-xl font-bold mb-4">Profile Settings</h2>

        <div className="mb-4 rounded-xl border bg-white p-4 text-sm text-gray-700 space-y-1">
          <div>
            <span className="text-gray-500">Name:</span> {initial.name || "—"}
          </div>
          <div>
            <span className="text-gray-500">Email:</span> {initial.email || "—"}
          </div>
        </div>

        <AdminProfileClient initial={initial} />
      </div>
    </DashboardShell>
  );
}
