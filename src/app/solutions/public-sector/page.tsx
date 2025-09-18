// src/app/solutions/public-sector/page.tsx
import Link from "next/link";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import Section from "@/components/section";
import Image from "next/image";

export const metadata = {
  title: "Public Sector — Equatoria",
  description:
    "Data operations for governments and public institutions: multilingual citizen service datasets, records OCR, safety evaluations, and in-region secure delivery.",
};

export default function PublicSectorPage() {
  return (
    <div className="pb-12">
      <Nav />

      {/* Hero: left copy, right visual (glow only on visual side) */}
      <section className="relative border-b">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-8 py-14 sm:grid-cols-2 sm:gap-10 sm:py-20">
            {/* Copy (left) */}
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs font-medium text-gray-700 backdrop-blur">
                For governments & public institutions
              </div>

              <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl">
                Data operations for citizen services, safety, and trust
              </h1>

              <p className="mt-4 max-w-xl text-gray-700">
                We build datasets and evaluation suites that power multilingual
                digital services, records digitization and OCR, safety and
                policy compliance checks, and evidence-ready reporting—delivered
                with data sovereignty in mind.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/#contact"
                  className="rounded-xl bg-black px-5 py-3 font-medium text-white hover:opacity-90"
                >
                  Speak with our public sector team
                </Link>
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
                  className="
                    absolute right-[-20%] top-1/2 h-[170%] w-[90%]
                    -translate-y-1/2 blur-3xl opacity-60
                  "
                  style={{
                    background:
                      "radial-gradient(60% 50% at 0% 50%, rgba(0,212,178,0.25) 0%, rgba(0,212,178,0.12) 35%, rgba(0,212,178,0) 70%)",
                  }}
                />
                <div
                  className="
                    absolute right-[-2%] top-1/2 h-[120%] w-[55%]
                    -translate-y-1/2 blur-2xl opacity-70
                  "
                  style={{
                    background:
                      "linear-gradient(270deg, rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.22) 40%, rgba(255,255,255,0) 75%)",
                  }}
                />
                <div
                  className="
                    absolute right-[6%] top-[48%] h-[14px] w-[70%]
                    -translate-y-1/2 rounded-full bg-gradient-to-l
                    from-white/80 via-cyan-200/60 to-transparent
                    blur-md opacity-65
                  "
                />
              </div>

              <Image
                src="/equatoria-hero-brain-circle-clean.svg"
                alt="Retail & commerce data operations visual"
                priority
                width={720}
                height={720}
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
        subtitle="Impactful, auditable data work for public outcomes."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border p-6">
            <h3 className="font-semibold">Citizen service automation</h3>
            <p className="mt-2 text-sm text-gray-700">
              Datasets for multilingual assistants and hotlines: intent
              coverage, entity extraction, escalation quality, and safety checks
              for sensitive topics.
            </p>
          </div>
          <div className="rounded-2xl border p-6">
            <h3 className="font-semibold">Records digitization & OCR</h3>
            <p className="mt-2 text-sm text-gray-700">
              High-accuracy OCR for IDs, forms, permits, and archives with
              field-level validation, redaction options, and lineage evidence.
            </p>
          </div>
        </div>
      </Section>

      {/* Modules */}
      <Section
        id="modules"
        title="Modules you can start with today"
        subtitle="Pick a focused 1–2 week pilot; expand after review."
      >
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              t: "Multilingual citizen service datasets",
              s: "Intent/entity corpora and evaluation suites across major African languages.",
            },
            {
              t: "Safety & policy evaluations",
              s: "Harm taxonomy scoring, jailbreak tests, and policy compliance prompts.",
            },
            {
              t: "Document OCR & extraction",
              s: "IDs, forms, permits, certificates—schemas, validation, and anomalies.",
            },
            {
              t: "Public information copilots",
              s: "Summarization, citation adherence, and hallucination checks for portals.",
            },
            {
              t: "Fraud & abuse corpora",
              s: "Spam, scams, and misuse examples for detection and classifier training.",
            },
            {
              t: "Accessibility & inclusion",
              s: "Speech datasets with regional accents and low-resource languages.",
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
              s: "Objectives, data residency, retention, and compliance constraints.",
            },
            {
              t: "Sample & design",
              s: "Schemas, rubrics, anonymization, and gold seeds where applicable.",
            },
            { t: "Calibration", s: "Reviewer training and agreement targets." },
            { t: "Production", s: "Label/evaluate with live QC dashboards." },
            {
              t: "Reporting",
              s: "Datasheets, coverage, error taxonomy, lineage & sign-offs.",
            },
            { t: "Scale", s: "Expand coverage or move to continuous evals." },
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
              t: "Agreement & calibration",
              s: "IAA metrics, adjudication rates, reviewer drift monitoring.",
            },
            {
              t: "Gold & reproducibility",
              s: "Seeded checks, replayable scoring, change logs, and leak tests.",
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
        subtitle="Privacy by design; public sector posture by default."
      >
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              t: "In-region options",
              s: "Data residency in-country or regional zones; VPC/VPN deployment.",
            },
            {
              t: "Access control",
              s: "Least-privilege roles, background-checked reviewers, audit logs.",
            },
            {
              t: "Contracts & DPAs",
              s: "NDAs, DPAs, ethical sourcing terms; verifiable attestations.",
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
            <li>Datasets & schemas, prompts, and reviewer guidelines</li>
            <li>Eval suites with scoring scripts and calibration targets</li>
            <li>Datasheets, coverage & drift stats, QC summaries</li>
          </ul>
          <ul className="list-disc pl-5 text-sm text-gray-700">
            <li>Encrypted delivery to S3/GCS + KMS or inside your VPC/VPN</li>
            <li>Change log & reproducibility notes</li>
            <li>Optional continuous eval subscription</li>
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
              "Can you operate fully in-region or on-prem?",
              "Yes. We can deploy within your VPC/VPN or on approved infrastructure with strict access controls and audit logs.",
            ],
            [
              "How do you handle sensitive records and PII?",
              "We minimize and optionally redact PII, enforce least-privilege access, and provide chain-of-custody evidence.",
            ],
            [
              "Do you support local languages and accents?",
              "Yes. We work across major African languages and regional accents with native reviewers and calibrated rubrics.",
            ],
            [
              "What does a pilot look like?",
              "1–2 weeks with explicit success metrics (e.g., OCR F1, containment lift, safety score), fixed scope and price.",
            ],
          ].map(([q, a]) => (
            <details
              key={q as string}
              className="group rounded-xl border border-gray-200 bg-white shadow-sm transition-colors focus-within:ring-1 focus-within:ring-emerald-400"
            >
              <summary className="flex cursor-pointer select-none items-center justify-between gap-3 rounded-xl px-4 py-4 font-medium text-gray-900 hover:bg-gray-50 focus-visible:outline-none">
                <span>{q}</span>
                <svg
                  className="h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200 group-open:rotate-180"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
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
          <h2 className="text-2xl font-bold">
            Ready to scope a public sector pilot?
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-gray-700">
            We’ll sign an NDA, align on data residency and compliance, and ship
            a 1–2 week pilot you can benchmark internally.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/#contact"
              className="rounded-xl bg-black px-5 py-3 font-medium text-white hover:opacity-90"
            >
              Get started
            </Link>
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
