// src/app/solutions/telecom/page.tsx
import Link from "next/link";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import Section from "@/components/section";
import Image from "next/image";

export const metadata = {
  title: "Telecom — Equatoria",
  description:
    "Speech & accents, contact-center QA, SIM/KYC OCR, spam & fraud datasets, and multilingual model evaluations for telecom operators and connectivity platforms.",
};

export default function TelecomPage() {
  return (
    <div className="pb-12">
      <Nav />

      {/* Hero: left copy, right visual (glow on visual side only) */}
      <section className="relative border-b">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-8 py-14 sm:grid-cols-2 sm:gap-10 sm:py-20">
            {/* Copy (left) */}
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs font-medium text-gray-700 backdrop-blur">
                For telecom & connectivity
              </div>

              <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl">
                Data operations for telcos and connectivity platforms
              </h1>

              <p className="mt-4 max-w-xl text-gray-700">
                We build the datasets and evaluations behind voice & chat
                automation, SIM/KYC onboarding, spam and fraud detection, and
                device-support copilots. Multilingual by default for African
                markets.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/#contact"
                  className="rounded-xl bg-black px-5 py-3 font-medium text-white hover:opacity-90"
                >
                  Talk to a specialist
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
                  See approach
                </Link>
              </div>
            </div>

            {/* Visual (right) */}
            <div className="relative isolate overflow-visible">
              {/* Incoming light — right only */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 overflow-visible"
              >
                {/* Wide soft wash */}
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
                {/* Bright beam */}
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
                {/* Specular streak */}
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
                alt="Telecom data operations visual"
                priority
                width={720} // set to your SVG’s real size if known
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
        subtitle="Production-ready data work that moves key telecom metrics."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border p-6">
            <h3 className="font-semibold">Voice & chat automation</h3>
            <p className="mt-2 text-sm text-gray-700">
              Speech datasets with African accents, intent classification,
              entity extraction, and policy-aware response evaluation to raise
              containment and cut handle time.
            </p>
          </div>
          <div className="rounded-2xl border p-6">
            <h3 className="font-semibold">Onboarding & compliance</h3>
            <p className="mt-2 text-sm text-gray-700">
              SIM/KYC OCR for IDs and forms, fraud/spam corpora, and regulatory
              language checks with evidence packages for audits.
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
              t: "Speech & accents for IVR/ASR",
              s: "Yorùbá, Hausa, Igbo, Swahili, Amharic, isiZulu & more; diarization and punctuation.",
            },
            {
              t: "Contact-center QA",
              s: "Intent coverage, escalation quality, policy adherence, hallucination checks.",
            },
            {
              t: "SIM/KYC document OCR",
              s: "IDs, forms, proofs—field extraction, validation, and anomaly examples.",
            },
            {
              t: "Spam & fraud datasets",
              s: "SMS spam, phishing, scam patterns; red-team prompts and labels.",
            },
            {
              t: "Device/config support",
              s: "Copilot flows, troubleshooting knowledge, and success/failure evals.",
            },
            {
              t: "Multilingual NLU/TTS evals",
              s: "Intent/entity benchmarks and TTS naturalness/intelligibility scores.",
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
              s: "Goals, data residency, compliance constraints.",
            },
            {
              t: "Sample & design",
              s: "Schema, prompts/rubrics, anonymization, and gold seeds where applicable.",
            },
            { t: "Calibration", s: "Reviewer training and agreement targets." },
            { t: "Production", s: "Label/evaluate with live QC dashboards." },
            {
              t: "Reporting",
              s: "Datasheets, slice metrics, error taxonomy, lineage evidence.",
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
              s: "IAA metrics, adjudication rates, and reviewer drift monitoring.",
            },
            {
              t: "Gold & reproducibility",
              s: "Seeded checks, leak tests, and replayable scoring for audits.",
            },
            {
              t: "Transparent reports",
              s: "Datasheets, coverage stats, error taxonomy, and lineage attestations.",
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
              s: "PII minimization, optional redaction, time-boxed retention.",
            },
            {
              t: "Contracts & DPAs",
              s: "NDA, DPAs, ethical sourcing; verifiable attestations provided.",
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
        subtitle="Decision-ready artifacts and datasets."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <ul className="list-disc pl-5 text-sm text-gray-700">
            <li>Speech/NLP datasets with schemas, prompts & guidelines</li>
            <li>Eval suites with scoring scripts and rubrics</li>
            <li>Datasheets, coverage & drift stats, QC reports</li>
          </ul>
          <ul className="list-disc pl-5 text-sm text-gray-700">
            <li>Secure delivery to S3/GCS + KMS or VPC/VPN access</li>
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
              "Can you handle difficult accents and noisy call audio?",
              "Yes. We curate accent-rich speech with diarization, noise profiles, and transcription QA to improve ASR robustness.",
            ],
            [
              "Do you work with call recordings that include PII?",
              "We support anonymization/redaction, least-privilege access, audit logs, and region-aware storage under NDA/DPA.",
            ],
            [
              "Can you run fully inside our VPC?",
              "Yes. We can operate within your VPC/VPN and deliver reports and datasets without data leaving your perimeter.",
            ],
            [
              "What does a pilot look like?",
              "A 1–2 week scoped effort with clear metrics (e.g., WER drop, containment lift, OCR F1) and a fixed price.",
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
            Ready to scope a telecom pilot?
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-gray-700">
            We’ll sign an NDA, define success metrics, and ship a 1–2 week pilot
            you can benchmark internally.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/#contact"
              className="rounded-xl bg-black px-5 py-3 font-medium text-white hover:opacity-90"
            >
              Speak with us
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
