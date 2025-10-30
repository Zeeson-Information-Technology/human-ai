"use client";

import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="border-t">
      <div className="mx-auto max-w-5xl px-4 py-12 text-center">
        <h2 className="text-2xl font-bold">Ready to interview?</h2>
        <p className="mx-auto mt-2 max-w-2xl text-gray-700">
          Create a profile and apply to roles that match your strengths. Fair,
          structured interviews — no guesswork.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/jobs/apply"
            className="rounded-xl bg-black px-5 py-3 font-medium text-white hover:opacity-90"
          >
            Apply as talent
          </Link>
          <Link
            href="/zuri"
            className="rounded-xl border px-5 py-3 font-medium hover:bg-gray-50"
          >
            Learn about our AI recruiter
          </Link>
        </div>
        <p className="mt-3 text-sm text-gray-600">
          Euman AI • hello@eumanai.com
        </p>
      </div>
    </section>
  );
}
