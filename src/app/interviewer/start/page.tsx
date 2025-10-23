// src/app/interviewer/start/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/use-session";
import { useEffect } from "react";

export default function InterviewerStartPage() {
  const router = useRouter();
  const { user, loading } = useSession();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin" || user.role === "company") {
        router.replace("/interviewer/start/admin"); // or "/admin"
      } else if (user.role === "talent") {
        router.replace("/talent");
      }
    }
  }, [user, loading, router]);

  if (loading) return null;

  const progress = 0.33; // Step progress (1 of 2)

  return (
    <div className="relative min-h-[80vh] overflow-hidden">
      {/* === Premium Background === */}
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

      {/* === Content Area === */}
      <div className="relative mx-auto flex min-h-[80vh] w-full max-w-5xl flex-col px-4 py-12 sm:px-6 lg:px-8">
        {/* --- Top Bar: Back + Progress --- */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/interviewer"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-sm text-gray-800 backdrop-blur hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-gray-100"
          >
            <span aria-hidden>←</span> Back
          </Link>

          <div className="w-48">
            <div className="mb-1 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
              <span>Step 1 of 2</span>
              <span>{Math.round(progress * 100)}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200/70 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-black dark:bg-white"
                style={{
                  width: `${Math.min(100, Math.max(0, progress * 100))}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* --- Floating Badges (moved below progress bar) --- */}
        <div className="mb-10 flex flex-wrap justify-center gap-2 sm:gap-3">
          <span className="floaty rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs text-gray-700 backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-gray-200">
            Human-in-the-loop
          </span>
          <span className="floaty rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs text-gray-700 backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-gray-200 [animation-delay:300ms]">
            Multilingual
          </span>
          <span className="floaty rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs text-gray-700 backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-gray-200 [animation-delay:600ms]">
            Bias-aware
          </span>
        </div>

        {/* --- Main Card --- */}
        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-black/10 bg-white/70 p-8 text-center shadow-2xl backdrop-blur dark:border-white/10 dark:bg-white/10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Zuri — AI Interviewer
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-gray-600 dark:text-gray-300">
            Create structured interviews in minutes. Invite candidates with a
            secure link. Zuri adapts questions, records answers, and returns
            audit-ready reports.
          </p>

          {/* CTA Grid */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {/* Create Job / Interview button */}
            <button
              className="inline-flex items-center justify-center 
      rounded-xl bg-black px-5 py-4 font-semibold text-white shadow-lg 
      shadow-black/10 transition hover:opacity-90 dark:bg-white 
      dark:text-black dark:shadow-white/10 cursor-pointer"
              onClick={() => {
                if (
                  !user ||
                  (user.role !== "admin" && user.role !== "company")
                ) {
                  router.push("/interviewer/start/login?role=company");
                } else if (user.role === "admin") {
                  router.push("/interviewer/start/admin");
                } else {
                  router.push("/interviewer/start/admin");
                }
              }}
            >
              {user?.role === "admin"
                ? "Admin: Create Job / Interview"
                : "Company: Create Job / Interview"}
            </button>

            {/* Talent Apply button */}
            <button
              className="inline-flex items-center justify-center rounded-xl 
      border border-black/10 bg-white px-5 py-4 font-semibold 
      text-gray-900 transition hover:bg-gray-50 dark:border-white/15 
      dark:bg-white/10 dark:text-gray-100 dark:hover:bg-white/20 cursor-pointer"
              onClick={() => {
                if (!user || user.role !== "talent") {
                  router.push("/interviewer/start/login?role=talent");
                } else {
                  router.push("/interviewer/start/jobs");
                }
              }}
            >
              Talent: Apply for Jobs
            </button>
          </div>

          {/* Footer Note */}
          <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
            Audio consent required. Data handled per policy. Need help?{" "}
            <a href="/contact" className="underline underline-offset-2">
              Contact us
            </a>
            .
          </div>
        </div>
      </div>
    </div>
  );
}
