import Link from "next/link";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboardBar";
import { getAdminFromCookies } from "@/lib/admin-session";
import { getOperatorFromCookies } from "@/lib/get-operator";
import { getAdminNav } from "@/lib/admin-dashboard";
import { isPlatformAdminRole } from "@/lib/admin-auth";
import SourcingPanel from "./SourcingPanel";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OpportunitySourcingPage() {
  const admin = await getAdminFromCookies();
  if (!admin) redirect("/admin/login");
  const me = await getOperatorFromCookies();
  if (!me) redirect("/admin/login");

  return (
    <DashboardShell
      user={{ name: (me as { name?: string }).name ?? me.email ?? "Admin", email: me.email, role: (me.role || "admin") as "admin" | "company" | "staff" | "recruiter" | "manager" | "talent" }}
      title="Opportunity Sourcing"
      nav={getAdminNav(me.role)}
    >
      <div className="mx-auto min-w-0 max-w-6xl text-white">
        <div className="mb-6 flex min-w-0 flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Link href="/admin" className="text-sm text-white/65 hover:text-white">&larr; Back to dashboard</Link>
            <h1 className="mt-3 break-words text-2xl font-semibold tracking-tight sm:text-3xl">Opportunity Sourcing</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/65">
              Connect the procurement portals your team uses, define what to look for, and keep the final pursuit decision with a human reviewer.
            </p>
          </div>
        </div>
        {!isPlatformAdminRole(me.role) ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 text-sm text-white/70">
            Portal connections and sourcing runs are currently managed by an admin. Ask an admin to configure a portal or enable sourcing access for your role.
          </div>
        ) : <SourcingPanel />}
      </div>
    </DashboardShell>
  );
}
