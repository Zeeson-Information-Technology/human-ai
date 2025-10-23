// src/components/SettingsLayout.tsx
"use client";

import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

const TABS = [
  { key: "profile", label: "Profile / Resume" },
  { key: "communication", label: "Communication" },
  { key: "availability", label: "Availability" },
] as const;

export default function SettingsLayout({
  heading = "Settings",
  children,
}: {
  heading?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const tab = params.get("tab") || "profile";

  function setTab(key: string) {
    const q = new URLSearchParams(params);
    q.set("tab", key);
    router.replace(`${pathname}?${q.toString()}`);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{heading}</h1>
        <Link
          href="/"
          className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
        >
          Back
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full border px-3 py-1 text-sm ${
              tab === t.key
                ? "bg-black text-white"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border bg-white p-4">{children}</div>
    </div>
  );
}
