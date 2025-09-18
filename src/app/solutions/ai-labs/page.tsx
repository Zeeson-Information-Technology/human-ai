// src/app/solutions/ai-labs/page.tsx
import Link from "next/link";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import Section from "@/components/section";
import Image from "next/image";

export const metadata = {
  title: "For AI Labs — Equatoria",
  description:
    "Frontier evaluations, RLHF/preference data, and safety red-teaming for AI labs — multilingual, auditable, and secure. Built in Africa, HQ Lagos.",
};

export default function AiLabsPage() {
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
                For AI labs
              </div>

              <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl">
                Frontier evaluations, RLHF & safety
              </h1>

              <p className="mt-4 max-w-xl text-gray-700">
                We design and run rigorous evaluations, preference datasets, and
                red-team suites that lift win-rate, reliability, and safety.
                Multilingual by default, with auditable reports and secure
                handover.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/#contact"
                  className="rounded-xl bg-black px-5 py-3 font-medium text-white hover:opacity-90"
                >
                  Request a pilot
                </Link>
                <Link
                  href="/data-engine"
                  className="rounded-xl border px-5 py-3 font-medium hover:bg-gray-50"
                >
                  Build with Data Engine
                </Link>
                <Link
                  href="/whitepaper"
                  className="rounded-xl border px-5 py-3 font-medium hover:bg-gray-50"
                >
                  Read research brief
                </Link>
              </div>
            </div>

            {/* Visual (right) */}
            <div className="relative isolate overflow-visible">
              {/* Incoming light (right only) */}
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
                src="/equatoria-ai-labs-hero.svg"
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
        title="What we do for AI labs"
        subtitle="Measured capability & safety improvements with human expertise."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border p-6">
            <h3 className="font-semibold">Evaluation design & execution</h3>
            <p className="mt-2 text-sm text-gray-700">
              Instruction following, groundedness, tool-use, and agent tasks
              with calibrated rubrics. We run controlled evals against baselines
              and report lift by slice.
            </p>
          </div>
          <div className="rounded-2xl border p-6">
            <h3 className="font-semibold">RLHF / preference data</h3>
            <p className="mt-2 text-sm text-gray-700">
              Pairwise ranking and structured rationales from expert reviewers,
              tuned to your safety and product constraints.
            </p>
          </div>
        </div>
      </Section>

      {/* Modules for labs */}
      <Section
        id="modules"
        title="Modules you can start with"
        subtitle="Pick a focused 1–2 week pilot; scale after the review."
      >
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              t: "Instruction-following evals",
              s: "Task suites, rubric calibration, executable checks where possible.",
            },
            {
              t: "Safety & red-team",
              s: "Adversarial prompts, jailbreak detection, harm taxonomy scoring.",
            },
            {
              t: "Preference / RLHF",
              s: "Pairwise ranking, span-level feedback, and rationales.",
            },
            {
              t: "Agents & tool-use",
              s: "Multi-step tasks, tool correctness, and recovery behavior.",
            },
            {
              t: "Multilingual & accents",
              s: "African languages & speech accents to improve generalization.",
            },
            {
              t: "Benchmark curation",
              s: "Leak-checked datasets, slice mining, and leaderboard prep.",
            },
          ].map((m) => (
            <div key={m.t} className="rounded-2xl border p-6 shadow-sm">
              <div className="font-semibold">{m.t}</div>
              <p className="mt-2 text-sm text-gray-700">{m.s}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* How we work (pilot to prod) */}
      <Section
        id="process"
        title="How a pilot runs"
        subtitle="Fast, reproducible, and decision-ready."
      >
        <ol className="grid list-decimal gap-6 pl-5 sm:grid-cols-3">
          {[
            { t: "Kickoff & NDA", s: "Goals, constraints, safety guidelines." },
            {
              t: "Eval design",
              s: "Tasks, rubrics, gold seeds, and slice hypotheses.",
            },
            {
              t: "Calibration",
              s: "Reviewer training, agreement targets, dry-run on samples.",
            },
            {
              t: "Execution",
              s: "Compare your model vs baselines; capture edge cases.",
            },
            {
              t: "Reporting",
              s: "Lift by slice, error taxonomy, safety incidents, datasheets.",
            },
            {
              t: "Scale-up",
              s: "Expand coverage, RLHF data, or continuous eval subscriptions.",
            },
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

      {/* Quality & evidence */}
      <Section
        id="quality"
        title="Quality & evidence"
        subtitle="We don’t assert quality — we show it."
      >
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              t: "Agreement & calibration",
              s: "IAA targets (Krippendorff / Cohen), adjudication rates, reviewer drift.",
            },
            {
              t: "Gold & reproducibility",
              s: "Seeded gold checks, leak testing, and replicable scoring scripts.",
            },
            {
              t: "Transparent reports",
              s: "Slice-level metrics, error taxonomy, safety incident log, lineage.",
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

      {/* Deliverables */}
      <Section
        id="deliverables"
        title="What you receive"
        subtitle="Decision-ready artifacts and datasets."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <ul className="list-disc pl-5 text-sm text-gray-700">
            <li>Eval suite with prompts, rubrics, and scoring scripts</li>
            <li>Preference datasets (rankings, rationales) as requested</li>
            <li>Datasheets & lineage attestations</li>
          </ul>
          <ul className="list-disc pl-5 text-sm text-gray-700">
            <li>Slice-level metrics & error taxonomy</li>
            <li>Safety incident log & mitigations</li>
            <li>Secure encrypted handover (S3/GCS + KMS)</li>
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
              "Can you replicate an existing evaluation we use internally?",
              "Yes. We can implement your spec, add calibration & gold checks, and extend coverage with new slices.",
            ],
            [
              "How do you prevent training data leaks in evals?",
              "We run leak checks, curate sources with provenance, and document any risks in the datasheet.",
            ],
            [
              "Do you support continuous evals?",
              "Yes. Many labs engage us as a subscription to monitor regressions and safety over time.",
            ],
            [
              "Can you produce RLHF data in our style?",
              "We calibrate on a sample, align on rationales, and report agreement metrics before scale.",
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
          <h2 className="text-2xl font-bold">Ready to trial an eval suite?</h2>
          <p className="mx-auto mt-2 max-w-2xl text-gray-700">
            We’ll sign an NDA, scope a 1–2 week pilot, and share a plan with
            metrics, costs, and timelines.
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
              Read research brief
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
