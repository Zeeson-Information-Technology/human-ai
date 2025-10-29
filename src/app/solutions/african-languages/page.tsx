// src/app/solutions/african-languages/page.tsx
import Link from "next/link";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import Section from "@/components/section";
import Image from "next/image";

export const metadata = {
  title: "African languages — Eumanai",
  description:
    "Speech, text, and evaluation services across major African languages with human-in-the-loop quality controls.",
};

export default function AfricanLanguagesPage() {
  return (
    <div className="pb-12">
      <Nav />

      {/* Hero */}
      <section className="relative border-b">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-8 py-14 sm:grid-cols-2 sm:gap-10 sm:py-20">
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs font-medium text-gray-700 backdrop-blur">
                Services • Local languages at scale
              </div>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl">
                Human-in-the-loop for African languages
              </h1>
              <p className="mt-4 max-w-xl text-gray-700">
                Speech and text datasets, translation QA, and evaluation suites
                across Yoruba, Hausa, Igbo, Amharic, Kiswahili, and Naija-Pidgin —
                delivered with reviewer calibration and transparent quality.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href="/contact" className="rounded-xl bg-black px-5 py-3 font-medium text-white hover:opacity-90">
                  Contact us
                </Link>
                <Link href="/whitepaper" className="rounded-xl border px-5 py-3 font-medium hover:bg-gray-50">
                  Read research
                </Link>
              </div>
            </div>

            {/* Visual */}
            <div className="relative isolate overflow-visible">
              <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-visible">
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
                src="/equatoria-languages-hero.svg"
                alt="African languages service visual"
                priority
                width={720}
                height={720}
                className="w-full max-w-xl rounded-2xl shadow-xl ring-1 ring-black/5 sm:ml-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Coverage */}
      <Section
        id="coverage"
        title="Coverage & accents"
        subtitle="We support major African languages with regional accents and scripts."
      >
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { t: "Yoruba (yo)", s: "Nigeria, diaspora; tone-aware text QA." },
            { t: "Hausa (ha)", s: "Nigeria, Niger; ASR corpora and IVR intents." },
            { t: "Igbo (ig)", s: "Nigeria; conversational and formal registers." },
            { t: "Naija-Pidgin (pcm)", s: "Call-center speech and chat intents." },
            { t: "Kiswahili (sw)", s: "East Africa; dialectal variants noted." },
            { t: "Amharic (am)", s: "Ethiopia; script handling and OCR QA." },
          ].map((i) => (
            <div key={i.t} className="rounded-2xl border p-6">
              <div className="font-semibold">{i.t}</div>
              <p className="mt-2 text-sm text-gray-700">{i.s}</p>
            </div>
          ))}
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
            { t: "Multilingual ASR datasets", s: "Call-center and in-person speech with calibrated transcripts." },
            { t: "TTS voices (pilot)", s: "Speaker collection and studio-quality capture with consent flows." },
            { t: "Translation QA", s: "Bidirectional QA with error taxonomy and gold seeds." },
            { t: "NLP entity corpora", s: "Domain terms and named entities with adjudication." },
            { t: "Evaluation suites", s: "Task-specific evals with reproducible scoring scripts." },
            { t: "Safety & bias checks", s: "Culturally-aware scenarios and red-team prompts." },
          ].map((m) => (
            <div key={m.t} className="rounded-2xl border p-6 shadow-sm">
              <div className="font-semibold">{m.t}</div>
              <p className="mt-2 text-sm text-gray-700">{m.s}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Process */}
      <Section id="process" title="How a pilot runs" subtitle="Fast, auditable, and secure.">
        <ol className="grid list-decimal gap-6 pl-5 sm:grid-cols-3">
          {[
            { t: "Scope & NDA", s: "Objectives, privacy, residency, and retention windows." },
            { t: "Design & sample", s: "Schemas, rubrics, gold seeds; language and accent mix." },
            { t: "Calibration", s: "Reviewer training and inter-annotator agreement targets." },
            { t: "Production", s: "Label/evaluate with live QC dashboards and sampling." },
            { t: "Reporting", s: "Datasheets, coverage, error taxonomy, lineage & sign-offs." },
            { t: "Scale", s: "Expand languages or move to continuous evals." },
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

      {/* Quality & security */}
      <Section id="quality" title="Quality & security" subtitle="Evidence-first, privacy by design.">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { t: "Agreement & calibration", s: "IAA metrics, adjudication rates, reviewer drift monitoring." },
            { t: "Gold & reproducibility", s: "Seeded checks, replayable scoring, change logs and leak tests." },
            { t: "Access control", s: "Least-privilege roles, background-checked reviewers, audit logs." },
          ].map((q) => (
            <div key={q.t} className="rounded-2xl border p-6">
              <div className="font-semibold">{q.t}</div>
              <p className="mt-2 text-sm text-gray-700">{q.s}</p>
            </div>
          ))}
        </div>
      </Section>

      <Footer />
    </div>
  );
}

