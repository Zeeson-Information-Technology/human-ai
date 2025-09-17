// src/app/page.tsx
import Nav from "../components/nav";
import Section from "../components/section";
import Footer from "../components/footer";
import Highlight from "../components/highlight";
import Stats from "../components/stats";

export default function Page() {
  return (
    <div className="pb-12">
      <Nav />

      {/* Hero: left text, right SVG (mirrors Data Engine layout) */}
      <section className="relative border-b overflow-visible">
        {/* subtle film grain to avoid gradient banding */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 mix-blend-soft-light opacity-10"
          style={{
            backgroundImage:
              "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2264%22 height=%2264%22 viewBox=%220 0 64 64%22><filter id=%22n%22 x=%220%22 y=%220%22 width=%22100%25%22 height=%22100%25%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%2264%22 height=%2264%22 filter=%22url(%23n)%22 opacity=%220.07%22/></svg>')",
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-8 py-14 sm:grid-cols-2 sm:gap-10 sm:py-20">
            {/* Copy (left) — lighting removed here */}
            <div className="relative isolate overflow-visible">
              <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs font-medium text-gray-700 backdrop-blur">
                Africa-native • Enterprise-grade • Human-in-the-loop
              </div>

              <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl">
                Raise model quality with human data you can trust
              </h1>

              {/* Tiny brand underline */}
              <div className="pointer-events-none mt-2 h-[3px] w-24 rounded-full bg-gradient-to-r from-emerald-400/70 to-cyan-400/20" />

              <p className="mt-4 max-w-xl text-gray-700">
                Equatoria designs and runs consent-based data
                pipelines—sourcing, labeling, and evaluation—so your LLMs ship
                with measurable lift, lower risk, and clear provenance.
              </p>

              {/* CTA row with stronger layering/contrast */}
              <div className="mt-6 flex flex-wrap items-center gap-3 relative z-20">
                <a
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 font-medium text-white shadow-xl ring-1 ring-black/10 hover:bg-gray-900 hover:shadow-2xl transition"
                >
                  Book a demo
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M7 4l6 6-6 6" />
                  </svg>
                </a>
                <a
                  href="/data-engine"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-medium text-gray-900 border border-gray-200 shadow-sm hover:bg-gray-50 hover:shadow transition"
                >
                  Build with Data Engine
                  <svg
                    className="h-4 w-4 text-gray-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M7 4l6 6-6 6" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Visual (right) — keeps the glow */}
            <div className="relative overflow-visible">
              {/* brighter right-side glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-10 -z-10 rounded-[28px] blur-2xl opacity-70"
                style={{
                  background:
                    "radial-gradient(65% 55% at 60% 50%, rgba(226,254,255,0.75) 0%, rgba(226,254,255,0.25) 45%, rgba(226,254,255,0) 75%)",
                }}
              />
              <img
                src="/equatoria-hero-brain-circle-clean.svg"
                alt="Equatoria data-to-AI pipeline"
                className="relative z-10 w-full max-w-xl rounded-2xl shadow-xl ring-1 ring-black/5 animate-hero-float"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Partner / Social proof strip */}
      <section className="border-b">
        <div className="mx-auto max-w-5xl px-4 py-6 text-center">
          <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Equatoria works with
          </div>
          <div className="mt-4 grid grid-cols-3 items-center gap-x-8 gap-y-3 opacity-70 grayscale sm:grid-cols-6">
            <div className="text-sm font-semibold text-gray-500">AI Labs</div>
            <div className="text-sm font-semibold text-gray-500">Banks</div>
            <div className="text-sm font-semibold text-gray-500">Telecoms</div>
            <div className="text-sm font-semibold text-gray-500">Fintech</div>
            <div className="text-sm font-semibold text-gray-500">Health</div>
            <div className="text-sm font-semibold text-gray-500">Gov</div>
          </div>
        </div>
      </section>

      {/* Optional marquee + stats */}
      <div className="mx-auto max-w-5xl px-4">
        <div className="mt-8">
          <Highlight />
        </div>
        <div className="mt-8">
          <Stats />
        </div>
      </div>

      {/* Capabilities */}
      <Section
        id="capabilities"
        title="Full-stack data operations"
        subtitle="Sourcing → Labeling → Evaluation → Secure handover."
      >
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "LLM evaluation & safety",
              desc: "Task design, rubrics, red-teaming, expert reviews, RLHF-ready datasets.",
            },
            {
              title: "Multilingual NLP",
              desc: "NER, classification, sentiment, translation QA — Yoruba, Hausa, Swahili, Amharic, isiZulu & more.",
            },
            {
              title: "Speech & accents",
              desc: "Transcription, diarization, accent coverage, ASR benchmark sets.",
            },
            {
              title: "Vision + OCR",
              desc: "Bounding boxes, polygons, forms OCR, document-intelligence benchmarks.",
            },
            {
              title: "Data sourcing",
              desc: "Consent-based collection via partners, licensed content, synthetic augmentation.",
            },
            {
              title: "Secure handover",
              desc: "S3/GCS + KMS, datasheets, QC reports, lineage & signed attestations.",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="group relative overflow-hidden rounded-2xl border p-6 shadow-sm transition hover:-translate-y-0.5"
            >
              <div className="pointer-events-none absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-cyan-400 via-emerald-400 to-slate-900 opacity-80" />
              <h3 className="font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{c.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Process */}
      <Section
        id="process"
        title="From pilot to production"
        subtitle="Fast, secure, measurable."
      >
        <ol className="grid list-decimal gap-6 pl-5 sm:grid-cols-3">
          {[
            { t: "Scope & NDA", s: "Goals, data rights, residency, SLA." },
            { t: "Pilot & rubrics", s: "Gold tests and calibration." },
            {
              t: "Production & QA",
              s: "Two-pass review or consensus; drift checks.",
            },
            { t: "Secure handover", s: "Datasheets, QC report, lineage." },
            { t: "Feedback loop", s: "Edge cases → rubric refinement." },
            { t: "Scale", s: "Ramp teams and automation." },
          ].map((i, idx) => (
            <li key={idx} className="relative rounded-2xl border p-6">
              <div className="text-xs text-gray-500">Step {idx + 1}</div>
              <div className="font-semibold">{i.t}</div>
              <p className="mt-1 text-sm text-gray-600">{i.s}</p>
              <div className="pointer-events-none absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-slate-900 via-emerald-400 to-cyan-400 opacity-60" />
            </li>
          ))}
        </ol>
      </Section>

      {/* Security */}
      <Section
        id="security"
        title="Security & ethics"
        subtitle="Enterprise posture by default."
      >
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { t: "Security", s: "VPC/VPN, KMS, RBAC, audit logs." },
            { t: "Compliance", s: "GDPR/CCPA-ready, DPAs, PII minimization." },
            { t: "Ethical labor", s: "Fair pay, training, wellness support." },
          ].map((i) => (
            <div key={i.t} className="relative rounded-2xl border p-6">
              <div className="font-semibold">{i.t}</div>
              <p className="mt-2 text-sm text-gray-600">{i.s}</p>
              <div className="pointer-events-none absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-cyan-400 via-emerald-400 to-slate-900 opacity-60" />
            </div>
          ))}
        </div>
      </Section>

      {/* Final CTA */}
      <section className="border-t">
        <div className="mx-auto max-w-5xl px-4 py-12 text-center">
          <h2 className="text-2xl font-bold">Ready to run a pilot?</h2>
          <p className="mx-auto mt-2 max-w-2xl text-gray-700">
            We’ll sign an NDA, scope a focused module, and share a plan with
            timelines, costs, and success metrics.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <a
              href="/contact"
              className="rounded-xl bg-black px-5 py-3 font-medium text-white hover:opacity-90"
            >
              Book a demo
            </a>
            <a
              href="/whitepaper"
              className="rounded-xl border px-5 py-3 font-medium hover:bg-gray-50"
            >
              Read white paper
            </a>
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
