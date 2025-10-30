// src/app/data-engine/page.tsx
import Link from "next/link";
import Nav from "../../components/nav";
import Footer from "../../components/footer";
import Section from "../../components/section";
import Image from "next/image";

export const metadata = {
  title: "Data Engine — euman AI",
  description:
    "Euman AI’s consent-based Data Engine: sourcing, curation, labeling, LLM evaluations, and secure handover.",
};

export default function DataEnginePage() {
  return (
    <div className="pb-12">
      <Nav />

      {/* Hero: left text, right SVG (mirrors homepage layout) */}
      <section className="relative border-b">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-8 py-14 sm:grid-cols-2 sm:gap-10 sm:py-20">
            {/* Copy (left) */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-gray-700">
                Data that sets the horizon
              </div>

              <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl">
                Euman AI data engine
              </h1>

              <p className="mt-4 max-w-xl text-gray-700">
                Consent-based sourcing, expert labeling, rigorous LLM
                evaluations, and secure handover — delivered with measurable
                quality and full provenance.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/#contact"
                  className="rounded-xl bg-black px-5 py-3 font-medium text-white hover:opacity-90"
                >
                  Request a pilot
                </Link>
                <Link
                  href="/whitepaper"
                  className="rounded-xl border px-5 py-3 font-medium hover:bg-gray-50"
                >
                  Read white paper
                </Link>
              </div>
            </div>

            {/* Visual (right) */}
            <div className="relative isolate overflow-visible">
              {/* Incoming light layers (pure CSS, no clipping) */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 overflow-visible"
              >
                {/* Wide soft wash coming in from the right */}
                <div
                  className="
        absolute right-[-22%] top-1/2 h-[170%] w-[90%]
        -translate-y-1/2 blur-3xl opacity-60
      "
                  style={{
                    background:
                      "radial-gradient(60% 50% at 0% 50%, rgba(0, 212, 178, 0.25) 0%, rgba(0, 212, 178, 0.12) 35%, rgba(0,212,178,0) 70%)",
                  }}
                />

                {/* Narrow bright beam that feels directional */}
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

                {/* Specular streak highlight along the “beam” */}
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
                src="/equatoria-data-engine-funnel.svg"
                alt="Equatoria Data Engine — consent → curate → label → evaluate → deliver"
                priority
                width={720}
                height={720}
                className="w-full max-w-xl rounded-2xl shadow-xl ring-1 ring-black/5 sm:ml-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* What is the Data Engine */}
      <Section
        id="overview"
        title="What our Data Engine does"
        subtitle="A managed pipeline to improve model capability and safety with consent-based human intelligence."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border p-6">
            <h3 className="font-semibold">End-to-end, but modular</h3>
            <p className="mt-2 text-sm text-gray-700">
              Use the whole pipeline or pick a module: sourcing, curation,
              labeling, evaluations, or handover. Everything is documented and
              auditable.
            </p>
          </div>
          <div className="rounded-2xl border p-6">
            <h3 className="font-semibold">Africa-native coverage</h3>
            <p className="mt-2 text-sm text-gray-700">
              Deep multilingual expertise and accents (Yorùbá, Hausa, Igbo,
              Swahili, Amharic, isiZulu, and more) to reduce bias and improve
              robustness.
            </p>
          </div>
        </div>
      </Section>

      {/* Pipeline */}
      <Section
        id="pipeline"
        title="How it works"
        subtitle="Consent → Curate → Label → Evaluate → Deliver"
      >
        <div className="grid gap-4 sm:grid-cols-5">
          {[
            {
              t: "Consent-based sourcing",
              s: "Programs & licensed partners with clear rights and compensation.",
            },
            {
              t: "Curation",
              s: "Slice finding, de-dup, coverage analysis, and active-learning loops.",
            },
            {
              t: "Labeling",
              s: "Expert tasks + calibrated rubrics, two-pass review or consensus.",
            },
            {
              t: "Evaluations",
              s: "LLM evals (instruction-following, safety, red-team) with SME review.",
            },
            {
              t: "Secure handover",
              s: "Encrypted delivery + datasheets, QC report, lineage attestations.",
            },
          ].map((x, i) => (
            <div key={i} className="rounded-2xl border p-5">
              <div className="text-xs text-gray-500">Step {i + 1}</div>
              <div className="mt-1 font-semibold">{x.t}</div>
              <p className="mt-2 text-sm text-gray-700">{x.s}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Modules */}
      <Section
        id="modules"
        title="Modules you can start with today"
        subtitle="Pick a lane for your first 1–2 week pilot."
      >
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              t: "RLHF / Preference Data",
              s: "Pairwise ranking, span-level feedback, structured rationales.",
            },
            {
              t: "Red Teaming & Safety",
              s: "Adversarial prompts, jailbreak detection, harm taxonomy scoring.",
            },
            {
              t: "Instruction Following",
              s: "Task design, rubric calibration, executable checks where possible.",
            },
            {
              t: "Multilingual NLP",
              s: "NER, classification, sentiment, translation QA; long-tail coverage.",
            },
            {
              t: "Speech & Accents",
              s: "Transcription, diarization, accent expansion for ASR robustness.",
            },
            {
              t: "Vision & OCR",
              s: "Forms, documents, boxes/polygons; document-intelligence sets.",
            },
          ].map((m) => (
            <div key={m.t} className="rounded-2xl border p-6 shadow-sm">
              <div className="font-semibold">{m.t}</div>
              <p className="mt-2 text-sm text-gray-700">{m.s}</p>
            </div>
          ))}
        </div>
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
              t: "Calibration & gold tests",
              s: "Annotator screening, pilot calibration, seeded gold & blind checks.",
            },
            {
              t: "Agreement & drift",
              s: "IAA metrics, adjudication rates, slice-level drift monitoring.",
            },
            {
              t: "Transparent reports",
              s: "Datasheets, QC summaries, error taxonomy, lineage & coverage stats.",
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
              s: "NDA, DPAs, ethical sourcing terms; verifiable attestations.",
            },
          ].map((s) => (
            <div key={s.t} className="rounded-2xl border p-6">
              <div className="font-semibold">{s.t}</div>
              <p className="mt-2 text-sm text-gray-700">{s.s}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Metrics */}
      <Section
        id="metrics"
        title="Metrics we report by default"
        subtitle="So you can compare pilots apples-to-apples."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <ul className="list-disc pl-5 text-sm text-gray-700">
            <li>IAA (Krippendorff / Cohen where applicable)</li>
            <li>Gold accuracy and adjudication rates</li>
            <li>Throughput, TAT, and reviewer utilization</li>
            <li>Error taxonomy and critical defect rate</li>
          </ul>
          <ul className="list-disc pl-5 text-sm text-gray-700">
            <li>Coverage (language, domain, slices)</li>
            <li>Bias/representation notes & mitigations</li>
            <li>Security review checklist & sign-offs</li>
            <li>Lineage & datasheet links</li>
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
              "Can you work with our data in-region?",
              "Yes. We support region-aware storage and VPC/VPN access. We minimize PII and can redact at source.",
            ],
            [
              "Do you only source data, or can you use ours?",
              "Both. We can run consent-based collection or label/evaluate your provided datasets with strict access controls.",
            ],
            [
              "What’s the fastest way to start?",
              "A 1–2 week pilot focused on one module (e.g., instruction following or red-team) with crystal-clear metrics.",
            ],
            [
              "How do you measure quality?",
              "Calibrated rubrics, seeded gold, inter-annotator agreement, adjudication, and transparent QC reports.",
            ],
          ].map(([q, a]) => (
            <details
              key={q as string}
              className="group rounded-xl border border-gray-200 bg-white shadow-sm transition-colors focus-within:ring-1 focus-within:ring-emerald-400"
            >
              <summary className="flex cursor-pointer select-none items-center justify-between gap-3 rounded-xl px-4 py-4 font-medium text-gray-900 hover:bg-gray-50 focus-visible:outline-none">
                <span>{q}</span>
                <svg
                  className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180 text-gray-500"
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
          <h2 className="text-2xl font-bold">Ready to run a pilot?</h2>
          <p className="mx-auto mt-2 max-w-2xl text-gray-700">
            We’ll sign an NDA, scope a focused module, and share a plan with
            timelines, costs, and success metrics.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/#contact"
              className="rounded-xl bg-black px-5 py-3 font-medium text-white hover:opacity-90"
            >
              Start a pilot
            </Link>
            <Link
              href="/whitepaper"
              className="rounded-xl border px-5 py-3 font-medium hover:bg-gray-50"
            >
              Read white paper
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
