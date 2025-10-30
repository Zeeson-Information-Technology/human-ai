// src/app/whitepaper/page.tsx
import Link from "next/link";
import Footer from "../../components/footer";
import Nav from "../../components/nav";

export const metadata = {
  title: "White paper — Euman AI",
  description:
    "Euman AI’s approach to consent-based data sourcing, high-quality labeling, rigorous evaluations, and secure handover",
};

const TOC: Array<{ label: string; href: string }> = [
  { label: "Overview", href: "#overview" },
  { label: "Why now (and why Africa)", href: "#why-now" },
  { label: "Solution architecture", href: "#solution" },
  { label: "Data sourcing", href: "#sourcing" },
  { label: "Labeling & LLM evaluations", href: "#labeling" },
  { label: "Quality, metrics & reporting", href: "#quality" },
  { label: "Security & compliance", href: "#security" },
  { label: "Ethical labor & governance", href: "#ethics" },
  { label: "Pilot program (1–2 weeks)", href: "#pilot" },
  { label: "Commercials & engagement", href: "#commercials" },
  { label: "Example use cases", href: "#use-cases" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "Get in touch", href: "#contact" },
];

export default function WhitepaperPage() {
  const lastUpdated = "September 15, 2025";

  return (
    <div className="min-h-screen bg-white">
      <Nav />

      {/* High-contrast intro header */}
      <header className="border-b bg-[linear-gradient(135deg,#f8fafc,#ecfeff)]">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="mb-4"></div>

          <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs font-medium text-gray-700 backdrop-blur">
            White Paper
          </div>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Euman AI White Paper
          </h1>
          <p className="mt-3 max-w-3xl text-[17px] leading-7 text-gray-800">
            Our approach to consent-based data sourcing, high-quality labeling,
            rigorous LLM evaluations, and secure handover — built in Africa,
            with headquarters in Lagos, serving the world.
          </p>
          <div className="mt-2 text-xs font-medium text-gray-600">
            Last updated: {lastUpdated}
          </div>
        </div>
      </header>

      {/* Content with sticky TOC on desktop */}
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
          {/* Sticky TOC (desktop) */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24 rounded-2xl border p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                Contents
              </div>
              <ol className="mt-3 space-y-2 text-sm">
                {TOC.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block rounded-md px-2 py-1 text-gray-700 hover:bg-gray-50 hover:text-black"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          {/* Article */}
          <article className="text-[17px] leading-7 text-gray-800">
            {/* Mobile TOC */}
            <section aria-labelledby="toc-mobile" className="mb-8 lg:hidden">
              <h2
                id="toc-mobile"
                className="text-sm font-semibold tracking-wide text-gray-700"
              >
                Contents
              </h2>
              <ol className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
                {TOC.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-black">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ol>
            </section>

            {/* Sections */}
            <Section id="overview" title="1) Overview">
              <p>
                Euman delivers enterprise-grade data operations for AI teams:
                consent-based data sourcing, meticulous human-in-the-loop
                labeling, rigorous model evaluations, and secure handover with
                complete provenance. We specialize in multilingual coverage and
                regulated industries, operating with an{" "}
                <strong>Africa-native network (HQ Lagos)</strong> to bring new
                breadth and depth to training data and evaluations.
              </p>
              <ul className="mt-3 list-disc pl-5">
                <li>
                  Consent-first sourcing and licensed content partnerships
                </li>
                <li>
                  Expert reviewers and calibrated rubrics for LLM evaluation
                </li>
                <li>Measured quality (gold tests, IAA, drift monitoring)</li>
                <li>Secure, auditable handover with datasheets and lineage</li>
              </ul>
            </Section>

            <Section id="why-now" title="2) Why now (and why Africa)">
              <p>
                Models are reaching capability ceilings that can’t be solved
                with scale alone. Progress hinges on the <em>quality</em> of new
                human data—especially diverse languages, domains, and safety
                judgments. Africa provides an underrepresented richness of
                languages, contexts, and real-world tasks. Euman AI organizes
                this expertise with enterprise-grade process and governance.
              </p>
            </Section>

            <Section id="solution" title="3) Solution architecture">
              <p>
                Our data engine spans four managed stages, each with controls
                and evidence:
              </p>
              <ol className="mt-3 list-decimal pl-5">
                <li>
                  <strong>Sourcing:</strong> consented collection programs,
                  licensed content partners, and optional synthetic augmentation
                  (clearly labeled).
                </li>
                <li>
                  <strong>Labeling:</strong> calibrated annotators and SMEs,
                  rubric-driven tasks, multi-pass review or consensus.
                </li>
                <li>
                  <strong>Evaluation:</strong> task design, red-teaming, and
                  safety test suites for LLMs and agents.
                </li>
                <li>
                  <strong>Handover:</strong> encrypted delivery of structured
                  data, datasheets, QC reports, and lineage attestations.
                </li>
              </ol>
            </Section>

            <Section id="sourcing" title="4) Data sourcing">
              <p>
                Euman AI runs consent-based programs and licensed content
                partnerships that align rights, compensation, and privacy with
                downstream AI usage. We avoid gray-area scraping and provide
                clear provenance for every asset.
              </p>
              <ul className="mt-3 list-disc pl-5">
                <li>Documented consent and revocation paths</li>
                <li>PII minimization and data residency options</li>
                <li>Fair compensation and transparent terms</li>
                <li>
                  Provider audits and periodic re-consent for long-lived
                  programs
                </li>
              </ul>
            </Section>

            <Section id="labeling" title="5) Labeling & LLM evaluations">
              <p>
                We support NLP (NER, classification, sentiment, translation QA),
                speech (transcription, diarization, accent coverage), and
                vision/OCR tasks (forms, boxes/polygons). For LLMs, we run
                preference data (RLHF/RLAIF), instruction-following checks, and
                safety evaluations via rubric-driven expert reviews.
              </p>
              <ul className="mt-3 list-disc pl-5">
                <li>Expert-led calibration and pilot on small samples</li>
                <li>Two-pass review or consensus workflows</li>
                <li>Edge-case surfacing and continuous rubric refinement</li>
              </ul>
            </Section>

            <Section id="quality" title="6) Quality, metrics & reporting">
              <p>Quality is measured and reported, not asserted. We track:</p>
              <ul className="mt-3 list-disc pl-5">
                <li>Gold tests and reviewer calibration scores</li>
                <li>Inter-annotator agreement (IAA) and adjudication rates</li>
                <li>Error taxonomies and drift signals over time</li>
                <li>
                  Turnaround time (TAT), throughput, and resolution latencies by
                  task type
                </li>
              </ul>
              <p className="mt-3">
                Handover includes a QC report, dataset datasheet, and lineage
                summary to ensure auditability.
              </p>
            </Section>

            <Section id="security" title="7) Security & compliance">
              <p>We design for privacy and enterprise security:</p>
              <ul className="mt-3 list-disc pl-5">
                <li>PII minimization and role-based access controls</li>
                <li>Encryption in transit and at rest; access logging</li>
                <li>DPAs, SOC-style controls, and confidentiality workflows</li>
                <li>Region-aware storage and data residency upon request</li>
              </ul>
            </Section>

            <Section id="ethics" title="8) Ethical labor & governance">
              <p>
                We uphold transparent labor standards: fair pay, training
                access, and wellness support. Reviewers can escalate concerns
                through independent channels. We avoid harmful tasks and provide
                safety briefings and debriefings as needed.
              </p>
            </Section>

            <Section id="pilot" title="9) Pilot program (1–2 weeks)">
              <p>
                We recommend starting with a scoped pilot to de-risk assumptions
                and establish metrics.
              </p>
              <ol className="mt-3 list-decimal pl-5">
                <li>Define scope, success criteria, and constraints (NDA)</li>
                <li>Design tasks and rubrics; calibrate on a sample</li>
                <li>Execute with QA; report metrics and edge cases</li>
                <li>
                  Review outcomes; propose production plan and scale targets
                </li>
              </ol>
            </Section>

            <Section id="commercials" title="10) Commercials & engagement">
              <p>Engagements are structured for clarity and security:</p>
              <ul className="mt-3 list-disc pl-5">
                <li>
                  <strong>Pilot</strong>: fixed-scope, fixed-fee; clear
                  deliverables and metrics
                </li>
                <li>
                  <strong>Production</strong>: per-unit or per-hour pricing with
                  quality SLAs and capacity plans
                </li>
                <li>
                  <strong>Evaluations</strong>: per-task suite or subscription
                  for continuous testing
                </li>
              </ul>
            </Section>

            <Section id="use-cases" title="11) Example use cases">
              <ul className="mt-3 list-disc pl-5">
                <li>
                  <strong>Banking</strong>: KYC/OCR datasets, fraud
                  classification, multilingual chatbot evaluation
                </li>
                <li>
                  <strong>Telecom</strong>: call intent/sentiment, spam/fraud
                  detection, network log labeling
                </li>
                <li>
                  <strong>AI labs</strong>: instruction-following checks,
                  preference data (RLHF/RLAIF), red-teaming safety suites
                </li>
              </ul>
            </Section>

            <Section id="roadmap" title="12) Roadmap">
              <ul className="mt-3 list-disc pl-5">
                <li>Evaluator marketplace with expert verifications</li>
                <li>Curated multilingual benchmark suites</li>
                <li>Deeper document-intelligence (OCR) programmatic QC</li>
                <li>Privacy-preserving annotation modes and secure enclaves</li>
              </ul>
            </Section>

            <Section id="contact" title="13) Get in touch" last>
              <p>
                Ready to scope a pilot? We’ll sign an NDA and propose a 1–2 week
                plan with clear success metrics.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href="/#contact"
                  className="rounded-xl bg-black px-5 py-3 font-medium text-white hover:opacity-90"
                >
                  Start a pilot
                </Link>
                <Link
                  href="/"
                  className="rounded-xl border px-5 py-3 font-medium hover:bg-gray-50"
                >
                  Back to home
                </Link>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                Euman AI • hello@eumanai.com
              </p>
            </Section>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/** Local section wrapper with consistent spacing & dividers */
function Section({
  id,
  title,
  children,
  last = false,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <div className="mb-3 mt-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
        <Link href={`#${id}`} className="hover:text-black">
          {title}
        </Link>
      </div>
      <div className="space-y-3 text-[17px] leading-7 text-gray-800">
        {children}
      </div>
      {!last && <div className="my-8 h-px bg-gray-200" />}
    </section>
  );
}
