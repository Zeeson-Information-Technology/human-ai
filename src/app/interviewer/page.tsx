// src/app/interviewer/page.tsx
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Zuri — AI Interviewer by Equatoria",
  description:
    "Multilingual, accent-fair AI interviewer. English plus local languages (Yorùbá, Hausa, Igbo, Pidgin). Structured rubrics, calibrated scorecards, clips, and transcripts.",
};

export default function ZuriPage() {
  return (
    <div className="pb-12">
      <Nav />

      {/* Hero: text left, Zuri visual right */}
      <section className="relative border-b overflow-visible">
        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-8 py-14 sm:grid-cols-2 sm:gap-10 sm:py-20">
            {/* Left: copy */}
            <div className="relative isolate">
              <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs font-medium text-gray-700 backdrop-blur">
                Beta • Multilingual • Accent-fair
              </div>

              <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl">
                Zuri — The multilingual, accent-fair AI interviewer
              </h1>
              <div className="mt-2 h-[3px] w-24 rounded-full bg-gradient-to-r from-emerald-400/70 to-cyan-400/20" />

              <p className="mt-4 max-w-xl text-gray-700">
                Structured interviews in English and local languages (Yorùbá,
                Hausa, Igbo, Pidgin). Zuri scores what candidates say—not how
                they sound—and delivers calibrated scorecards with clips and
                transcripts.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/interviewer/start"
                  className="rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-700"
                >
                  Start an interview
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-medium text-gray-900 border border-gray-200 shadow-sm hover:bg-gray-50 hover:shadow transition"
                >
                  See interactive demos
                  <svg
                    className="h-4 w-4 text-gray-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M7 4l6 6-6 6" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Right: visual */}
            <div className="relative overflow-visible">
              {/* keep glow strictly on the right so left text stays crisp */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-10 -z-10 rounded-[28px] blur-2xl opacity-80 sm:left-1/2"
                style={{
                  background:
                    "radial-gradient(65% 55% at 65% 50%, rgba(226,254,255,0.85) 0%, rgba(226,254,255,0.30) 45%, rgba(226,254,255,0) 75%)",
                }}
              />
              <ZuriPortraitPNG />
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b">
        <div className="mx-auto max-w-5xl px-4 py-6 text-center">
          <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Built by Equatoria — Africa-native • Enterprise-grade •
            Human-in-the-loop
          </div>
        </div>
      </section>

      {/* Pilot targets (results strip) */}
      <section className="border-b">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { h: "50–70%", s: "Faster screening cycles" },
              { h: "Higher quality", s: "At interview round 2" },
              { h: "Lower cost", s: "Per qualified candidate" },
            ].map((i) => (
              <div
                key={i.s}
                className="rounded-2xl border p-5 text-center shadow-sm"
              >
                <div className="text-2xl font-extrabold">{i.h}</div>
                <div className="mt-1 text-sm text-gray-600">{i.s}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-gray-500">
            Targets, not guarantees. We’ll prove impact in your data during the
            pilot.
          </p>
        </div>
      </section>

      {/* Before / With Zuri */}
      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border p-6">
            <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Before Zuri
            </div>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              <li>• Hours lost to repetitive screens</li>
              <li>• Inconsistent notes, subjective outcomes</li>
              <li>• CV inflation; weak signal verification</li>
            </ul>
          </div>
          <div className="rounded-2xl border p-6">
            <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
              With Zuri
            </div>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-700">
              <li>Share role, skills, and rubric</li>
              <li>Zuri interviews with dynamic follow-ups</li>
              <li>Ranked candidates with scorecards, clips & transcripts</li>
              <li>Export to ATS or escalate to a human panel</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Why Zuri */}
      <section className="mx-auto max-w-5xl px-4 py-10 border-t">
        <h2 className="text-2xl font-bold">Why Zuri</h2>
        <p className="mt-2 text-gray-700">
          Replace scattered screens and subjective notes with structured,
          bias-aware interviews.
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {[
            {
              t: "Multilingual & accent-fair",
              s: "Scores content, not accent. Africa-native lexicons.",
            },
            {
              t: "Rubrics & scorecards",
              s: "Calibrated criteria for consistent, defendable decisions.",
            },
            {
              t: "Clips & transcripts",
              s: "Consent, redaction options, secure storage.",
            },
            {
              t: "Bias guardrails",
              s: "Standardized flows + QC reduce drift and noise.",
            },
            {
              t: "Operator controls",
              s: "Pause, escalate, or request follow-ups instantly.",
            },
            {
              t: "Easy handoff",
              s: "Datasheets, CSV/JSON exports, signed attestations.",
            },
          ].map((i) => (
            <div
              key={i.t}
              className="group relative overflow-hidden rounded-2xl border p-6 shadow-sm transition hover:-translate-y-0.5"
            >
              <div className="pointer-events-none absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-cyan-400 via-emerald-400 to-slate-900 opacity-80" />
              <h3 className="font-semibold">{i.t}</h3>
              <p className="mt-2 text-sm text-gray-600">{i.s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-4 py-10 border-t">
        <h2 className="text-2xl font-bold">How Zuri works</h2>
        <ol className="mt-4 grid list-decimal gap-6 pl-5 sm:grid-cols-3">
          {[
            { t: "Define the role", s: "Skills, seniority, rubric." },
            {
              t: "Zuri interviews",
              s: "English + local languages as required.",
            },
            {
              t: "Review & decide",
              s: "Scorecards, key clips, transcripts, exports.",
            },
          ].map((i, idx) => (
            <li key={idx} className="relative rounded-2xl border p-6">
              <div className="text-xs text-gray-500">Step {idx + 1}</div>
              <div className="font-semibold">{i.t}</div>
              <p className="mt-1 text-sm text-gray-600">{i.s}</p>
              <div className="pointer-events-none absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-slate-900 via-emerald-400 to-cyan-400 opacity-60" />
            </li>
          ))}
        </ol>
        <div className="mt-6">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 font-medium text-white shadow-xl ring-1 ring-black/10 hover:bg-gray-900 hover:shadow-2xl transition"
          >
            Start a 1–2 week pilot
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 4l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Language coverage */}
      <section className="mx-auto max-w-5xl px-4 py-10 border-t">
        <h2 className="text-2xl font-bold">Language coverage</h2>
        <p className="mt-2 text-gray-700">
          Nigeria-first, expanding across Africa.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            "English",
            "Yorùbá",
            "Hausa",
            "Igbo",
            "Pidgin",
            "Swahili (roadmap)",
            "Amharic (roadmap)",
          ].map((l) => (
            <span
              key={l}
              className="rounded-full border bg-white px-3 py-1 text-sm text-gray-800"
            >
              {l}
            </span>
          ))}
        </div>
      </section>

      {/* Security & fairness */}
      <section className="mx-auto max-w-5xl px-4 py-10 border-t">
        <h2 className="text-2xl font-bold">Security & fairness</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-3">
          {[
            { t: "Security", s: "VPC/VPN, KMS, RBAC, audit logs." },
            { t: "Compliance", s: "GDPR/CCPA-ready, DPAs, PII minimization." },
            {
              t: "Ethical labor",
              s: "Fair pay for reviewers, wellness support.",
            },
          ].map((i) => (
            <div key={i.t} className="relative rounded-2xl border p-6">
              <div className="font-semibold">{i.t}</div>
              <p className="mt-2 text-sm text-gray-600">{i.s}</p>
              <div className="pointer-events-none absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-cyan-400 via-emerald-400 to-slate-900 opacity-60" />
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t">
        <div className="mx-auto max-w-5xl px-4 py-12 text-center">
          <h2 className="text-2xl font-bold">
            Ready to see Zuri in your pipeline?
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-gray-700">
            We’ll sign an NDA, run a focused pilot, and share scorecards,
            exports, and clear success metrics.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/contact"
              className="rounded-xl bg-black px-5 py-3 font-medium text-white hover:opacity-90"
            >
              Book a pilot
            </Link>
            <Link
              href="/demo"
              className="rounded-xl border px-5 py-3 font-medium hover:bg-gray-50"
            >
              See interactive demos
            </Link>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Africa HQ in Lagos • hello@equatoria.ai
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ZuriPortraitPNG() {
  return (
    // isolate so z-index layering is self-contained
    <div className="relative isolate">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-10 -z-10 rounded-[28px] blur-2xl opacity-80 sm:left-1/3"
        style={{
          background:
            "radial-gradient(65% 55% at 65% 50%, rgba(226,254,255,0.85) 0%, rgba(226,254,255,0.30) 45%, rgba(226,254,255,0) 75%)",
        }}
      />

      {/* image */}
      <Image
        src="/zuri-portrait.png"
        alt="Zuri — AI Interviewer"
        width={720}
        height={720}
        priority
        className="relative z-10 w-full max-w-xl rounded-2xl shadow-xl ring-1 ring-black/5"
      />

      {/* anchor dot */}
      <div className="absolute z-20 left-1/3 top-1/2 -translate-y-1/2">
        <span className="relative inline-flex h-5 w-5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
          <span className="relative inline-flex h-5 w-5 rounded-full bg-emerald-500 ring-2 ring-white" />
        </span>
      </div>

      {/* speech bubble; responsive placement */}
      <div
        className="
          absolute z-20 hidden sm:block
          left-[40%] top-[62%]
          max-w-[320px] rounded-2xl border bg-white/90 p-3 text-sm text-gray-800 shadow-lg backdrop-blur
        "
      >
        Multilingual & accent-fair. Local languages on demand.
      </div>

      <div className="sm:hidden relative z-20 mt-3 max-w-[420px] rounded-2xl border bg-white/90 p-3 text-sm text-gray-800 shadow-lg">
        Multilingual & accent-fair. Local languages on demand.
      </div>
    </div>
  );
}
