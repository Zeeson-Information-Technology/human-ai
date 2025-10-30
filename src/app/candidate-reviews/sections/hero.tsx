// src/app/candidate-reviews/sections/MinimalHero.tsx
"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative border-b">
      {/* subtle right-side glow like micro1 */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute right-[-18%] top-1/2 h-[170%] w-[90%] -translate-y-1/2 blur-3xl opacity-50"
          style={{
            background:
              "radial-gradient(60% 50% at 0% 50%, rgba(0,212,178,0.25) 0%, rgba(0,212,178,0.12) 35%, rgba(0,212,178,0) 70%)",
          }}
        />
        <div
          className="absolute right-[-2%] top-1/2 h-[120%] w-[55%] -translate-y-1/2 blur-2xl opacity-70"
          style={{
            background:
              "linear-gradient(270deg, rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.22) 40%, rgba(255,255,255,0) 75%)",
          }}
        />
        <div className="absolute right-[6%] top-[52%] h-[14px] w-[70%] -translate-y-1/2 rounded-full bg-gradient-to-l from-white/80 via-cyan-200/60 to-transparent blur-md opacity-65" />
      </div>

      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:py-24">
        <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs font-medium text-gray-700 backdrop-blur">
          Candidate experience • Human-in-the-loop
        </div>

        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl">
          World-class talent loves Euman AI
        </h1>

        <p className="mx-auto mt-3 max-w-2xl text-gray-700">
          Hear reviews from top professionals who’ve applied, interviewed with
          <span className="font-semibold"> Zuri</span>, and joined new roles
          with our help.
        </p>

        <div className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/jobs/apply"
            className="rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-700"
          >
            Apply as talent
          </Link>
        </div>
      </div>
    </section>
  );
}
