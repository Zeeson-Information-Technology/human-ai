// src/app/case-studies/page.tsx
import type { Metadata } from "next";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import Image from "next/image";
import Link from "next/link";
import ClientsCarousel from "@/app/candidate-reviews/sections/clientCarousel";

export const metadata: Metadata = {
  title: "Case Studies — Eumanai",
  description:
    "How leading African enterprises ship faster with human-in-the-loop AI. Real outcomes across customer support, sales, and operations.",
};

type Study = {
  company: string;
  logo: string;
  sector: string;
  title: string;
  summary: string;
  details: string[]; // bullet points: challenge, approach, stack
  highlights: Array<{ label: string; value: string }>; // KPI results
  quote?: { text: string; author?: string; role?: string };
  ctaHref?: string;
};

const STUDIES: Study[] = [
  {
    company: "Atlas Bank",
    logo: "/clients/atlas.svg",
    sector: "Financial Services",
    title: "Automating multilingual KYC review with human QA",
    summary:
      "Atlas scaled KYC across English, Yoruba and Hausa with Zuri’s structured workflows, reducing manual backlogs while improving auditability.",
    details: [
      "OCR + form parsing with human validation for edge-cases",
      "Policy‑aware prompts with audit trails",
      "Reviewer queues and sampling for quality",
    ],
    highlights: [
      { label: "Backlog reduction", value: "-63%" },
      { label: "KYC cycle time", value: "-42%" },
      { label: "Accuracy (QA)", value: "+3.1pp" },
    ],
    quote: {
      text:
        "We moved from weekly backlogs to same‑day KYC—without sacrificing compliance.",
      author: "Head of Compliance",
      role: "Atlas Bank",
    },
    ctaHref: "/contact",
  },
  {
    company: "Kora Health",
    logo: "/clients/kora.svg",
    sector: "Healthcare",
    title: "Triage and follow‑up in local languages",
    summary:
      "Nurse teams use Zuri to triage inbound chats and schedule follow‑ups, with human oversight for escalation‑worthy cases.",
    details: [
      "ASR + intent routing across English & Yoruba",
      "Escalation workflows to on‑call nurses",
      "EHR notes draft with reviewer confirmation",
    ],
    highlights: [
      { label: "First response", value: "< 30s" },
      { label: "Resolution rate", value: "+21%" },
      { label: "CSAT", value: "+18%" },
    ],
    quote: {
      text:
        "Language stopped being a barrier for triage. Our nurses stay focused on care.",
      author: "Clinical Ops Lead",
      role: "Kora Health",
    },
    ctaHref: "/contact",
  },
  {
    company: "Apex Data",
    logo: "/clients/apex.svg",
    sector: "BPO / Data Ops",
    title: "Human‑in‑the‑loop labeling for speech + forms",
    summary:
      "Apex combined speech transcripts with Textract and human review to create high‑quality datasets for downstream models.",
    details: [
      "Textract + Rekognition pre‑labels with human QA",
      "Sampling + inter‑annotator agreement tracking",
      "Versioned datasets for model training",
    ],
    highlights: [
      { label: "Turnaround", value: "‑48%" },
      { label: "Unit cost", value: "‑27%" },
      { label: "QA reject", value: "< 2%" },
    ],
    quote: {
      text:
        "Quality finally met timelines. Our training runs converged with fewer iterations.",
      author: "Data Platform Manager",
      role: "Apex Data",
    },
    ctaHref: "/contact",
  },
  {
    company: "Nimbus Cloud",
    logo: "/clients/nimbus.svg",
    sector: "SaaS",
    title: "Sales research co‑pilot for SDRs",
    summary:
      "SDRs generate tailored briefs in minutes with verifiable sources; managers review within the same workspace.",
    details: [
      "Verified sources with citations and redaction",
      "Reviewer feedback loops and templates",
      "One‑click export to CRM",
    ],
    highlights: [
      { label: "Time to brief", value: "‑72%" },
      { label: "Meetings booked", value: "+14%" },
      { label: "A/B quality", value: "+2.6×" },
    ],
    quote: {
      text:
        "The co‑pilot replaced slide‑making. Reps spend time on conversations, not formatting.",
      author: "SDR Manager",
      role: "Nimbus Cloud",
    },
    ctaHref: "/contact",
  },
];

function Hero() {
  return (
    <section className="relative border-b">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute left-[-18%] top-1/2 h-[170%] w-[90%] -translate-y-1/2 blur-3xl opacity-40"
          style={{
            background:
              "radial-gradient(60% 50% at 100% 50%, rgba(16,185,129,0.25) 0%, rgba(16,185,129,0.12) 35%, rgba(16,185,129,0) 70%)",
          }}
        />
        <div
          className="absolute left-[6%] top-[52%] h-[14px] w-[70%] -translate-y-1/2 rounded-full bg-gradient-to-r from-white/80 via-emerald-200/60 to-transparent blur-md opacity-60"
        />
      </div>

      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:py-24">
        <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs font-medium text-gray-700 backdrop-blur">
          Case Studies • Human‑in‑the‑loop AI
        </div>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl">
          Real outcomes, shipped to production
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-gray-700">
          See how teams deploy Zuri for multilingual support, compliant operations,
          and measurable impact—always with human oversight.
        </p>
        <div className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/contact"
            className="rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-700"
          >
            Book a demo
          </Link>
          <Link
            href="/whitepaper"
            className="rounded-xl border px-5 py-3 font-medium hover:bg-gray-50"
          >
            Read research
          </Link>
        </div>
      </div>
    </section>
  );
}

function StudyCard({ study }: { study: Study }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0f] shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition hover:shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
      {/* subtle top sheen */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-emerald-400/10 to-transparent" />

      {/* two-column content */}
      <div className="relative grid gap-0 md:grid-cols-3">
        {/* Left: details (spans 2 columns on md+) */}
        <div className="md:col-span-2 p-4">
          <div className="flex items-center gap-3">
            <Image
              src={study.logo}
              alt={study.company}
              width={120}
              height={40}
              className="h-7 w-auto opacity-95"
            />
            <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-medium text-gray-200">
              {study.sector}
            </span>
          </div>
          <h3 className="mt-3 text-lg font-semibold leading-snug text-gray-100">{study.title}</h3>
          <p className="mt-2 text-sm text-gray-300">{study.summary}</p>
          {study.details?.length ? (
            <ul className="mt-3 grid list-disc gap-1 pl-5 text-sm text-gray-200">
              {study.details.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          ) : null}
          {study.quote?.text ? (
            <figure className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
              <blockquote className="text-sm text-gray-100">“{study.quote.text}”</blockquote>
              {(study.quote.author || study.quote.role) && (
                <figcaption className="mt-1 text-xs text-gray-400">
                  {study.quote.author}
                  {study.quote.author && study.quote.role ? " • " : ""}
                  {study.quote.role}
                </figcaption>
              )}
            </figure>
          ) : null}
          <div className="mt-4">
            <Link
              href={study.ctaHref || "/contact"}
              className="inline-flex items-center gap-2 text-sm font-medium text-emerald-300 hover:text-emerald-200"
            >
              Explore engagement
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4 transition group-hover:translate-x-0.5"
              >
                <path d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L13.586 10H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 010-1.414z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Right: results panel */}
        <aside className="relative border-t border-white/10 md:border-l md:border-t-0">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-emerald-400/5 to-transparent" />
          <div className="relative h-full p-4">
            <div className="text-xs font-medium uppercase tracking-wider text-emerald-300">
              Results
            </div>
            <ul className="mt-3 grid gap-2">
              {study.highlights.map((h) => (
                <li key={h.label} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                  <div className="text-xs text-gray-400">{h.label}</div>
                  <div className="text-base font-semibold text-gray-100">{h.value}</div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </article>
  );
}

function StudiesGrid() {
  return (
    <section className="border-b">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-5 text-center">
          <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Selected work
          </div>
          <h2 className="mt-2 text-2xl font-bold">Deploying human‑in‑the‑loop at scale</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {STUDIES.map((s) => (
            <StudyCard key={s.company} study={s} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="border-t">
      <div className="mx-auto max-w-5xl px-4 py-12 text-center">
        <h2 className="text-2xl font-bold">Bring this to your team</h2>
        <p className="mx-auto mt-2 max-w-2xl text-gray-700">
          We partner with product, ops and data leaders to ship reliable AI systems—
          with the right human guardrails from day one.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/contact"
            className="rounded-xl bg-black px-5 py-3 font-medium text-white hover:opacity-90"
          >
            Book a demo
          </Link>
          <Link
            href="/zuri"
            className="rounded-xl border px-5 py-3 font-medium hover:bg-gray-50"
          >
            Learn about Zuri
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function CaseStudiesPage() {
  return (
    <div className="pb-12">
      <Nav />
      <Hero />
      <ClientsCarousel />
      <StudiesGrid />
      <FinalCTA />
      <Footer />
    </div>
  );
}
