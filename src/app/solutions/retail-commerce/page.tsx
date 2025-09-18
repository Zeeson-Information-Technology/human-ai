// src/app/solutions/retail-commerce/page.tsx
import Link from "next/link";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import Section from "@/components/section";
import Image from "next/image";

export const metadata = {
  title: "Retail & Commerce — Equatoria",
  description:
    "Retail data operations: catalog enrichment, product OCR, search/reco evals, multilingual support datasets, and secure delivery.",
};

export default function RetailCommercePage() {
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
                For marketplaces, retailers & fintech-commerce
              </div>

              <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl">
                Cleaner catalogs, smarter search, faster support
              </h1>

              <p className="mt-4 max-w-xl text-gray-700">
                We build product and customer datasets, OCR flows for receipts
                and invoices, and evaluation suites for search/recommendations.
                Multilingual support corpora help reduce handle time while
                keeping policy and trust intact.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/#contact"
                  className="rounded-xl bg-black px-5 py-3 font-medium text-white hover:opacity-90"
                >
                  Talk to our retail team
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
              <Image
                src="/equatoria-retail-commerce-hero.svg"
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
        subtitle="Catalog quality, CX, and trust & safety."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border p-6">
            <h3 className="font-semibold">Catalog & product intelligence</h3>
            <p className="mt-2 text-sm text-gray-700">
              Attribute extraction, normalization, variant linkage, and
              image/text QA for consistent, shoppable catalogs.
            </p>
          </div>
          <div className="rounded-2xl border p-6">
            <h3 className="font-semibold">Search & recommendations evals</h3>
            <p className="mt-2 text-sm text-gray-700">
              Human-in-the-loop relevance, diversity, and safety checks for
              search and feed ranking.
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
              t: "Product attribute extraction",
              s: "Titles, specs, categories; variant mapping and deduplication.",
            },
            {
              t: "Retail OCR pipelines",
              s: "Receipts, invoices, manifests—field validation and anomaly flags.",
            },
            {
              t: "Search/reco relevance",
              s: "Query–result judgments and offline metrics with gold checks.",
            },
            {
              t: "Multilingual CX corpora",
              s: "Support chat/voice datasets with policy-adherent responses.",
            },
            {
              t: "Fraud/risk corpora",
              s: "Counterfeit, abuse, and returns edge-cases for classifier/eval.",
            },
            {
              t: "Image QA",
              s: "Product image checks: quality, compliance, and safety filters.",
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
              s: "Goals, data rights, residency, retention.",
            },
            {
              t: "Design & sample",
              s: "Schemas, rubrics, gold seeds, policy boundaries.",
            },
            { t: "Calibration", s: "Reviewer training and agreement targets." },
            { t: "Production", s: "Label/evaluate with live QC dashboards." },
            { t: "Reporting", s: "Datasheets, coverage, taxonomy, lineage." },
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
              t: "Agreement & drift",
              s: "IAA, adjudication rates, slice-level drift by category.",
            },
            {
              t: "Gold & reproducibility",
              s: "Seeded checks, replayable scoring, change logs.",
            },
            {
              t: "Transparent reports",
              s: "Datasheets, coverage stats, error taxonomy, lineage.",
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
              s: "Least-privilege roles, audit logs, region-aware storage.",
            },
            {
              t: "Data minimization",
              s: "PII minimization, redaction options, time-boxed retention.",
            },
            {
              t: "Contracts & DPAs",
              s: "NDA, DPAs, ethical sourcing terms; attestations.",
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
            <li>Option for continuous retail-eval subscription</li>
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
              "Can you enrich our existing catalog?",
              "Yes—attribute extraction, normalization, and variant mapping; we provide lineage and QC.",
            ],
            [
              "Do you support receipts and invoices OCR?",
              "Yes, with field validation and anomaly flags; output delivered in your schema.",
            ],
            [
              "How do you evaluate search/recs?",
              "Human relevance judgments with gold checks and offline metrics you can replay.",
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
          <h2 className="text-2xl font-bold">Ready to scope a retail pilot?</h2>
          <p className="mx-auto mt-2 max-w-2xl text-gray-700">
            We’ll align on categories, KPIs, and privacy, then ship a
            benchmarkable pilot in 1–2 weeks.
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
