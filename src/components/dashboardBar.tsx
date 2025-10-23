"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import UploadableAvatar from "@/components/UploadableAvatar";

type UserLite = {
  name?: string;
  email?: string;
  role: "admin" | "company" | "talent";
};

type NavItem = {
  href: string;
  label: string;
  exact?: boolean;
};

export default function DashboardShell({
  user,
  title,
  nav,
  children,
  footer,
  onSignOut,
}: {
  user: UserLite;
  title?: string;
  nav: NavItem[];
  children: React.ReactNode;
  footer?: React.ReactNode;
  onSignOut?: () => void | Promise<void>;
}) {
  const pathname = usePathname();

  const initials = useMemo(() => {
    const n = (user?.name || user?.email || "?").trim();
    const parts = n.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return n[0]?.toUpperCase() || "?";
  }, [user?.name, user?.email]);

  const isActive = (item: NavItem) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(item.href + "/");

  // Helpers to avoid duplicates in footer
  const hasItem = (pred: (n: NavItem) => boolean) => nav?.some(pred) ?? false;
  const labelEq = (a?: string, b?: string) =>
    (a || "").trim().toLowerCase() === (b || "").trim().toLowerCase();

  // Role-aware profile/settings destinations
  const profileHref =
    user.role === "talent"
      ? "/talent/profile"
      : user.role === "company"
      ? "/company/profile"
      : "/admin/profile";

  const settingsHref =
    user.role === "admin"
      ? "/admin/settings"
      : user.role === "company"
      ? "/company/settings"
      : "/settings";

  // Robust duplicate detection: match by href, label, or “endsWith('/settings')”
  const hasProfile = hasItem(
    (n) =>
      n.href === profileHref ||
      labelEq(n.label, "Profile") ||
      n.href.endsWith("/profile")
  );

  const hasSettings = hasItem(
    (n) =>
      n.href === settingsHref ||
      labelEq(n.label, "Settings") ||
      n.href.endsWith("/settings")
  );

  // Only show in footer if not already present in top nav
  const shouldShowFooterProfile = !hasProfile;
  const shouldShowFooterSettings =
    (user.role === "company" || user.role === "admin") && !hasSettings;

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* premium background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(80rem 80rem at -10% -10%, rgba(59,130,246,0.15), transparent 40%)," +
            "radial-gradient(80rem 80rem at 110% 10%, rgba(16,185,129,0.12), transparent 45%)," +
            "radial-gradient(100rem 60rem at 50% 120%, rgba(255,255,255,0.08), transparent 40%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md lg:sticky lg:top-6 self-start">
            {/* Profile */}
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <UploadableAvatar
                name={user?.name}
                email={user?.email}
                url={(user as any)?.avatar?.url}
                size={40}
                onChanged={() => {
                  location.reload();
                }}
              />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-white">
                  {user?.name || "—"}
                </div>
                <div className="truncate text-xs text-white/70">
                  {user?.email || "—"}
                </div>
                <div className="mt-0.5 text-[10px] uppercase tracking-wide text-white/40">
                  {user?.role}
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="mt-4 grid gap-1">
              {nav.map((item) => {
                const active = isActive(item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "rounded-lg px-3 py-2 text-sm transition",
                      active
                        ? "bg-white text-black"
                        : "text-white/85 hover:bg-white/10",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Footer actions */}
            <div className="mt-6 border-t border-white/10 pt-4 grid gap-2">
              <Link
                href="/support"
                className="rounded-lg px-3 py-2 text-sm text-white/85 hover:bg-white/10"
              >
                Contact support
              </Link>

              {shouldShowFooterProfile && (
                <Link
                  href={profileHref}
                  className="rounded-lg px-3 py-2 text-sm text-white/85 hover:bg-white/10"
                >
                  Profile
                </Link>
              )}

              {shouldShowFooterSettings && (
                <Link
                  href={settingsHref}
                  className="rounded-lg px-3 py-2 text-sm text-white/85 hover:bg-white/10"
                >
                  Settings
                </Link>
              )}

              <button
                onClick={async () => {
                  if (onSignOut) await onSignOut();
                  else {
                    await fetch("/api/auth/logout", { method: "POST" });
                    location.href = "/";
                  }
                }}
                className="text-left rounded-lg px-3 py-2 text-sm 
                text-rose-300 hover:bg-rose-100/10 cursor-pointer"
              >
                Sign out
              </button>
            </div>

            {footer ? <div className="mt-4">{footer}</div> : null}
          </aside>

          {/* Main */}
          <main className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            {title ? <h1 className="mb-4 text-xl font-bold">{title}</h1> : null}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
