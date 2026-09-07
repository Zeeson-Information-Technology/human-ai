import DashboardShell from "@/components/dashboardBar";
import { getAdminFromCookies } from "@/lib/admin-session";
import { getAdminNav } from "@/lib/admin-dashboard";
import { getOperatorFromCookies } from "@/lib/get-operator";
import { redirect } from "next/navigation";
import Link from "next/link";
import ClientsPanel from "./ClientsPanel";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminClientsPage() {
  const admin = await getAdminFromCookies();
  if (!admin) redirect("/admin/login");

  const me = await getOperatorFromCookies();
  if (!me) redirect("/admin/login");

  return (
    <DashboardShell
      user={{
        name: (me as any).name ?? me.email ?? "Admin",
        email: me.email,
        role: me.role as any,
      }}
      title="Clients"
      nav={getAdminNav(me.role)}
    >
      <div className="mx-auto max-w-6xl px-4 py-2 text-white">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="mt-3 text-2xl font-bold text-white">Clients</h1>
            <p className="mt-1 max-w-2xl text-sm text-white/65">
              Keep client records here so they can be selected when creating or
              updating opportunities in the pipeline.
            </p>
          </div>

          <Link
            href="/admin/opportunities/new"
            className="rounded-xl bg-white px-4 py-2 font-medium text-black hover:opacity-90"
          >
            Create opportunity
          </Link>
        </div>

        <ClientsPanel />
      </div>
    </DashboardShell>
  );
}
