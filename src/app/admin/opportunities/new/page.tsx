"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import BrandLoader from "@/components/brand-loader";
import { useSession } from "@/lib/use-session";
import AdminStartForm from "@/app/zuri/start/admin/AdminStartForm";
import { getEffectivePermissions } from "@/lib/admin-auth";

export default function AdminOpportunityCreatePage() {
  const { user, loading } = useSession();
  const router = useRouter();
  const permissions = getEffectivePermissions(user as any);

  useEffect(() => {
    if (loading) return;
    const allowed =
      user &&
      (user.role === "admin" || permissions.canCreateOpportunity === true);
    if (!allowed) router.replace("/zuri/start");
  }, [user, loading, router, permissions.canCreateOpportunity]);

  const allowed =
    user &&
    (user.role === "admin" || permissions.canCreateOpportunity === true);

  if (loading || !allowed) return <BrandLoader />;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(60rem 60rem at 10% 10%, rgba(59,130,246,0.12), transparent 45%)," +
            "radial-gradient(50rem 50rem at 90% 30%, rgba(16,185,129,0.12), transparent 45%)," +
            "radial-gradient(40rem 40rem at 50% 120%, rgba(99,102,241,0.12), transparent 45%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.25] dark:opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(127,127,127,0.15) 1px, transparent 1px)," +
            "linear-gradient(to bottom, rgba(127,127,127,0.15) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(80rem 80rem at 50% 35%, rgba(0,0,0,1), rgba(0,0,0,0.05))",
          WebkitMaskImage:
            "radial-gradient(80rem 80rem at 50% 35%, rgba(0,0,0,1), rgba(0,0,0,0.05))",
        }}
      />
      <div aria-hidden className="bg-grain absolute inset-0" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-sm text-gray-800 backdrop-blur transition hover:bg-white cursor-pointer"
            >
              <span aria-hidden>&larr;</span> Back
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-sm text-gray-800 backdrop-blur transition hover:bg-white cursor-pointer"
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/opportunities")}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-sm text-gray-800 backdrop-blur transition hover:bg-white cursor-pointer"
            >
              Opportunities
            </button>
          </div>

          <div className="rounded-full border border-black/10 bg-white/80 px-3 py-1 text-sm text-gray-700 backdrop-blur">
            Opportunity setup
          </div>
        </div>

        <div className="flex-1">
          <AdminStartForm />
        </div>
      </div>
    </div>
  );
}
