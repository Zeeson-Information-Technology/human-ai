import Link from "next/link";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboardBar";
import { getAdminFromCookies } from "@/lib/admin-session";
import { getOperatorFromCookies } from "@/lib/get-operator";
import { getAdminNav } from "@/lib/admin-dashboard";
import SavedCriteriaList from "./SavedCriteriaList";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SavedCriteriaPage() {
  const admin = await getAdminFromCookies();
  if (!admin) redirect("/admin/login");
  const me = await getOperatorFromCookies();
  if (!me || me.role !== "admin") redirect("/admin/login");

  return (
    <DashboardShell
      user={{ name: (me as { name?: string }).name ?? me.email ?? "Admin", email: me.email, role: me.role }}
      title="Saved criteria"
      nav={getAdminNav(me.role)}
    >
      <main className="mx-auto min-w-0 max-w-6xl text-white">
        <div className="mb-6 flex min-w-0 flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Link href="/admin/sourcing" className="text-sm text-white/65 transition hover:text-white">&larr; Back to opportunity sourcing</Link>
            <h1 className="mt-3 break-words text-2xl font-semibold tracking-tight sm:text-3xl">Saved criteria</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">Reuse complete portal and filter criteria for this business without rebuilding each search.</p>
          </div>
        </div>
        <SavedCriteriaList />
      </main>
    </DashboardShell>
  );
}
