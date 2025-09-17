// src/app/solutions/bpo/page.tsx
import Link from "next/link";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import Section from "@/components/section";

export const metadata = {
  title: "BPO — Equatoria",
  description:
    "Contact center & back-office data operations: ASR/intent corpora, QA rubrics, evaluation suites, and secure delivery with multilingual coverage.",
};

export default function BPOPage() {
  return (
    <div className="pb-12">
      <Nav />

      {/* Hero: left copy, right visual (glow only on visual side) */}
      <section className="relative border-b">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-8 py-14 sm:grid-cols-2 sm:gap-10 sm:py-20">
            {/* Copy (left) */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs font-medium text-gray-700 backdrop-blur">
                For contact centers & back-office
              </div>

              <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl">
                Higher-quality ops with data you can trust
              </h1>

              <p className="mt-4 max-w-xl text-gray-700">
                We build speech and text datasets, evaluation rubrics, and QA
                pipelines for service, sales, and risk ops—covering regional
                accents and languages. Measure containment, resolution, and
                compliance with evidence, not anecdotes.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href="/#contact"
                  className="rounded-xl bg-black px-5 py-3 font-medium text-white hover:opacity-90"
                >
                  Talk to our BPO team
                </a>
                <Link
                  href="/data-engine"
                  className="rounded-xl border px-5 py-3 font-medium hover:bg-gray-50"
                >
                  Explore Data Engine
                </Link>
                <Link
                  href="/whitepaper"
                  className="rounded-xl border px-5 py-3 font-medium hover:bg-gray-50"
                >
                  Read approach
                </Link>
              </div>
            </div>

            {/* Visual (right) */}
            <div className="relative isolate overflow-visible">
              {/* Right-side incoming light only */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 overflow-visible"
              >
                <div
                  className="absolute right-[-20%] top-1/2 h-[170%] w-[90%] -translate-y-1/2 blur-3xl opacity-60"
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
                <div className="absolute right-[6%] top-[48%] h-[14px] w-[70%] -translate-y-1/2 rounded-full bg-gradient-to-l from-white/80 via-cyan-200/60 to-transparent blur-md opacity-65" />
              </div>

              <img
                src="/equatoria-hero-brain-circle-clean.svg"
                alt="BPO data operations visual"
                className="w-full max-w-xl rounded-2xl shadow-xl ring-1 ring-black/5 sm:ml-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Overview */}
      <Section
        id="overview"
        title="Where we help first"
        subtitle="Service, sales, trust & safety, and back-office workflows."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border p-6">
            <h3 className="font-semibold">ASR & intent corpora</h3>
            <p className="mt-2 text-sm text-gray-700">
              Call transcription datasets across accents; intent/entity schemas
              tuned to your queues and KPIs.
            </p>
          </div>
          <div className="rounded-2xl border p-6">
            <h3 className="font-semibold">QA & compliance evals</h3>
            <p className="mt-2 text-sm text-gray-700">
              Rubrics for empathy, policy adherence, and resolution; automated
              checks plus SME review.
            </p>
          </div>
        </div>
      </Section>

      {/* Modules */}
      <Section
        id="modules"
        title="Modules you can start with today"
        subtitle="Begin with a 1–2 week pilot; expand after review."
      >
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              t: "Speech-to-intent datasets",
              s: "Transcripts + labeled intents/entities; accent coverage and noise profiles.",
            },
            {
              t: "Assistant containment evals",
              s: "Measure self-serve containment, escalation quality, and failure modes.",
            },
            {
              t: "Back-office OCR",
              s: "Invoices, IDs, proofs with field validation and anomaly flags.",
            },
            {
              t: "Policy & safety checks",
              s: "Prompt suites for restricted content and policy edge-cases.",
            },
            {
              t: "Multilingual chat corpora",
              s: "Customer chat datasets with translation QA for major African languages.",
            },
            {
              t: "Agent coaching sets",
              s: "Curated exemplars and counter-examples for on-job guidance.",
            },
          ].map((m) => (
            <div key={m.t} className="rounded-2xl border p-6 shadow-sm">
              <div className="font-semibold">{m.t}</div>
              <p className="mt-2 text-sm text-gray-700">{m.s}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Process */}
      <Section
        id="process"
        title="How a pilot runs"
        subtitle="Fast, auditable, and secure."
      >
        <ol className="grid list-decimal gap-6 pl-5 sm:grid-cols-3">
          {[
            {
              t: "Scope & NDA",
              s: "Queues, KPIs, rights, residency, retention.",
            },
            {
              t: "Design & sample",
              s: "Schemas, rubrics, gold seeds, redlines.",
            },
            { t: "Calibration", s: "Reviewer training and agreement targets." },
            { t: "Production", s: "Label/evaluate with live QC dashboards." },
            { t: "Reporting", s: "Datasheets, coverage, taxonomy, lineage." },
            { t: "Scale", s: "Expand languages, add continuous evals." },
          ].map((i, idx) => (
            <li key={idx} className="relative rounded-2xl border p-6">
              <div className="text-xs text-gray-500">Step {idx + 1}</div>
              <div className="font-semibold">{i.t}</div>
              <p className="mt-1 text-sm text-gray-700">{i.s}</p>
              <div className="pointer-events-none absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-slate-900 via-emerald-400 to-cyan-400 opacity-60" />
            </li>
          ))}
        </ol>
      </Section>

      {/* Quality */}
      <Section
        id="quality"
        title="Quality & evidence"
        subtitle="We don’t assert quality — we show it."
      >
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              t: "Agreement & drift",
              s: "IAA metrics, adjudication rates, drift monitoring by queue.",
            },
            {
              t: "Gold & replay",
              s: "Seeded checks, replayable scoring, change logs.",
            },
            {
              t: "Transparent reports",
              s: "Datasheets, coverage stats, error taxonomy, lineage attestations.",
            },
          ].map((q) => (
            <div key={q.t} className="rounded-2xl border p-6">
              <div className="font-semibold">{q.t}</div>
              <p className="mt-2 text-sm text-gray-700">{q.s}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Security */}
      <Section
        id="security"
        title="Security & compliance"
        subtitle="Privacy by design; enterprise posture by default."
      >
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              t: "Access control",
              s: "Least-privilege roles, audit logs, in-region storage options.",
            },
            {
              t: "PII minimization",
              s: "Redaction options, scoped views, time-boxed retention.",
            },
            {
              t: "Contracts & DPAs",
              s: "NDA, DPAs, ethical labor terms; verifiable attestations.",
            },
          ].map((s) => (
            <div key={s.t} className="rounded-2xl border p-6">
              <div className="font-semibold">{s.t}</div>
              <p className="mt-2 text-sm text-gray-700">{s.s}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Deliverables */}
      <Section
        id="deliverables"
        title="What you receive"
        subtitle="Evidence-ready artifacts and datasets."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <ul className="list-disc pl-5 text-sm text-gray-700">
            <li>Datasets & schemas; prompts and reviewer guidelines</li>
            <li>Evaluation suites with scoring scripts and targets</li>
            <li>Datasheets, coverage & drift, QC summaries</li>
          </ul>
          <ul className="list-disc pl-5 text-sm text-gray-700">
            <li>Encrypted delivery to S3/GCS + KMS or inside your VPC/VPN</li>
            <li>Change log & reproducibility notes</li>
            <li>Option for continuous ops-eval subscription</li>
          </ul>
        </div>
      </Section>

      {/* FAQs */}
      <Section
        id="faqs"
        title="FAQs"
        subtitle="Practical answers for pilots and procurement."
      >
        <div className="grid gap-3">
          {[
            [
              "Can you work with call recordings that include PII?",
              "Yes. We minimize PII, restrict access, and can redact at source. We provide chain-of-custody evidence.",
            ],
            [
              "Do you support on-prem or private cloud?",
              "Yes—VPC/VPN with scoped roles and audit logs.",
            ],
            [
              "What’s a typical pilot?",
              "1–2 weeks focused on a queue (e.g., billing or onboarding) with clear metrics like containment lift or QA score delta.",
            ],
          ].map(([q, a]) => (
            <details
              key={q as string}
              className="group rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <summary className="flex cursor-pointer select-none items-center justify-between gap-3 rounded-xl px-4 py-4 font-medium text-gray-900 hover:bg-gray-50">
                <span>{q}</span>
                <svg
                  className="h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200 group-open:rotate-180"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z"
                    clipRule="evenodd"
                  />
                </svg>
              </summary>
              <div className="px-4 pb-4 pt-0 text-sm text-gray-700">{a}</div>
            </details>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="border-t">
        <div className="mx-auto max-w-5xl px-4 py-12 text-center">
          <h2 className="text-2xl font-bold">Ready to scope a BPO pilot?</h2>
          <p className="mx-auto mt-2 max-w-2xl text-gray-700">
            We’ll align on queues, metrics, and privacy, then ship a
            benchmarkable pilot in 1–2 weeks.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <a
              href="/#contact"
              className="rounded-xl bg-black px-5 py-3 font-medium text-white hover:opacity-90"
            >
              Get started
            </a>
            <Link
              href="/whitepaper"
              className="rounded-xl border px-5 py-3 font-medium hover:bg-gray-50"
            >
              Read approach
            </Link>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Africa headquarters in Lagos • hello@equatoria.ai
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
