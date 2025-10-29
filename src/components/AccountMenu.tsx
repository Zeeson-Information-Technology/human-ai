// src/components/AccountMenu.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function AccountMenu({
  user,
  role,
  onSignOut,
}: {
  user: { email?: string; name?: string; avatarUrl?: string } | null;
  role: "talent" | "company" | "admin";
  onSignOut?: () => void; // optional; for Admin you already have a server action
}) {
  const [open, setOpen] = useState(false);
  const initials =
    (user?.name || user?.email || "?")
      .split(/[.\s@]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "?";

  const settingsHref =
    role === "admin" ? "/admin/settings" : "/talent/settings";

  return (
    <div className="relative">
      <button
        className="flex h-9 w-9 items-center justify-center rounded-full border bg-white text-sm font-semibold"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {user?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt="Avatar"
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border bg-white p-2 shadow-xl"
          role="menu"
        >
          <div className="rounded-xl bg-gray-50 p-3 text-xs text-gray-700">
            Signed in as
            <div className="truncate font-medium text-gray-900">
              {user?.email || "—"}
            </div>
          </div>

          <Link
            href={settingsHref}
            className="mt-1 block rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>

          <a
            href="mailto:support@yourdomain.com"
            className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Contact support
          </a>

          {onSignOut ? (
            <button
              className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50"
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
              role="menuitem"
            >
              Sign out
            </button>
          ) : (
            // For server-action sign-out forms (like your Admin page), render nothing here
            <></>
          )}
        </div>
      )}
    </div>
  );
}
