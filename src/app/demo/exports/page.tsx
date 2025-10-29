// src/app/demo/exports/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Demo Exports — eumanai",
  description: "Download CSVs from demo contributions.",
  robots: { index: false, follow: false }, // operator-only feel for MVP
};

export default function DemoExports() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-gray-700">
            Operator tools
          </div>
          <h1 className="mt-3 text-3xl font-bold">Demo Exports</h1>
          <p className="mt-2 text-gray-600">
            Download datasets collected from the interactive demos.
          </p>
        </div>

        <div className="mt-8 grid gap-4">
          {/* Audio samples export */}
          <div className="rounded-2xl border p-5 shadow-sm">
            <div className="font-semibold">
              eumanai Voice Lab — Audio samples
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Voice recordings + written translations (CSV).
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Link
                href="/api/audio/export"
                prefetch={false}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                Download CSV
              </Link>
              <Link
                href="/api/audio/export?lang=Yoruba"
                prefetch={false}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                Yoruba only
              </Link>
              <Link
                href="/api/audio/export?lang=Hausa"
                prefetch={false}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                Hausa only
              </Link>
            </div>
            <p className="mt-2 text-[11px] text-gray-500">
              Tip: Use <code>?lang=Igbo</code> or a date range like{" "}
              <code>?from=2025-01-01&amp;to=2025-12-31</code>.
            </p>
          </div>

          {/* Text annotations export */}
          <div className="rounded-2xl border p-5 shadow-sm">
            <div className="font-semibold">Text annotations</div>
            <p className="mt-1 text-sm text-gray-600">
              QA / Intent decisions (CSV or JSONL).
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Link
                href="/api/text/export"
                prefetch={false}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                Download CSV
              </Link>
              <Link
                href="/api/text/export?format=jsonl"
                prefetch={false}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                Download JSONL
              </Link>
              <Link
                href="/api/text/export?task=Translation%20QA"
                prefetch={false}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                Translation QA only
              </Link>
            </div>
            <p className="mt-2 text-[11px] text-gray-500">
              Params: <code>taskId</code>, <code>task</code>, <code>label</code>
              , <code>from</code>, <code>to</code>, <code>format=jsonl</code>.
            </p>
          </div>

          {/* Image annotations export */}
          <div className="rounded-2xl border p-5 shadow-sm">
            <div className="font-semibold">Image annotations</div>
            <p className="mt-1 text-sm text-gray-600">
              Bounding boxes from receipt/Doc OCR (CSV or JSONL).
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Link
                href="/api/image/export"
                prefetch={false}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                Download CSV
              </Link>
              <Link
                href="/api/image/export?format=jsonl"
                prefetch={false}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                Download JSONL
              </Link>
              <Link
                href="/api/image/export?label=Total"
                prefetch={false}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                Only label: Total
              </Link>
            </div>
            <p className="mt-2 text-[11px] text-gray-500">
              Params: <code>sampleId</code>, <code>label</code>,{" "}
              <code>from</code>, <code>to</code>, <code>format=jsonl</code>.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            ← Back to demos
          </Link>
        </div>
      </div>
    </div>
  );
}
