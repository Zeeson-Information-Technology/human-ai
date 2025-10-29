"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/use-session";
import DashboardShell from "@/components/dashboardBar";
import Link from "next/link";
import { useMemo } from "react";

const TABS = [
  { key: "profile", label: "Profile & Resume" },
  { key: "communication", label: "Communication" },
  { key: "availability", label: "Availability" },
] as const;

export default function SettingsPage() {
  const { user, loading } = useSession();
  const search = useSearchParams();
  const router = useRouter();

  const active = (search.get("tab") ||
    "profile") as (typeof TABS)[number]["key"];

  const nav = useMemo(
    () =>
      user?.role === "admin"
        ? [
            { href: "/admin", label: "Dashboard" },
            { href: "/admin/jobs", label: "Jobs" },
            { href: "/admin/interviews", label: "Interviews" },
            { href: "/settings", label: "Settings", exact: true },
          ]
        : [
            { href: "/talent", label: "Overview" },
            { href: "/jobs", label: "Explore Jobs" },
            { href: "/settings", label: "Settings", exact: true },
          ],
    [user?.role]
  );

  if (loading) return null;

  return (
    <DashboardShell
      user={{
        name: user?.name,
        email: user?.email,
        role: (user?.role as any) || "talent",
      }}
      title="Settings"
      nav={nav}
      onSignOut={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        location.href = "/";
      }}
    >
      {/* Sub-tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const href = `/settings?tab=${t.key}`;
          const current = active === t.key;
          return (
            <Link
              key={t.key}
              href={href}
              className={`rounded-full border px-3 py-1 text-sm ${
                current
                  ? "bg-black text-white"
                  : "bg-white text-gray-900 hover:bg-gray-50"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* Panels */}
      {active === "profile" && (
        <div className="grid gap-4">
          {/* Profile photo uploader (future) */}
          <div className="rounded-xl border p-4">
            <div className="text-sm font-semibold mb-2">Profile</div>
            <div className="text-xs text-gray-500">
              Name, photo (coming soon)
            </div>
          </div>

          {/* Resume (reuse your ResumeCard or link to /talent/profile for talents) */}
          <div className="rounded-xl border p-4">
            <div className="text-sm font-semibold mb-2">Resume</div>
            {String(user?.role||"") === "talent" ? (
              <Link
                href="/talent/profile"
                className="underline text-emerald-700 text-sm"
              >
                Manage your resume →
              </Link>
            ) : (
              <div className="text-xs text-gray-500">
                Not applicable for admin/company.
              </div>
            )}
          </div>
        </div>
      )}

      {active === "communication" && (
        <div className="rounded-xl border p-4">
          <div className="text-sm font-semibold mb-2">Communication</div>
          <div className="text-xs text-gray-500">
            Open to jobs, email, phone, WhatsApp, etc. (wire up your POST
            endpoints here)
          </div>
        </div>
      )}

      {active === "availability" && (
        <div className="rounded-xl border p-4">
          <div className="text-sm font-semibold mb-2">Availability</div>
          <div className="text-xs text-gray-500">
            Timezone, weekly hours, days, work window. (wire up your POST
            endpoints here)
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
