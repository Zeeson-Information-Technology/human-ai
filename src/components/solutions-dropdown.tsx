"use client";

import Link from "next/link";
import { useState } from "react";

type SolKey =
  | "ai-labs"
  | "financial"
  | "telecom"
  | "public"
  | "health"
  | "retail"
  | "bpo";

const ITEMS: {
  key: SolKey;
  label: string;
  href: string;
  title: string;
  desc: string;
  tags: { t: string; href: string }[];
}[] = [
  {
    key: "ai-labs",
    label: "For AI labs",
    href: "/solutions/ai-labs",
    title: "Frontier evals, RLHF & safety",
    desc: "Design rigorous task suites, red-team safety, and preference data to lift win-rate, reliability, and alignment — multilingual by default.",
    tags: [
      { t: "LLM evals", href: "/solutions/ai-labs" },
      { t: "RLHF", href: "/solutions/ai-labs" },
      { t: "Red team", href: "/solutions/ai-labs" },
    ],
  },
  {
    key: "financial",
    label: "For banks & fintech",
    href: "/solutions/financial-services",
    title: "KYC, OCR & multilingual CX",
    desc: "Document intelligence for KYC/AML, fraud/risk classification, and chatbot evaluation — with auditable lineage and secure posture.",
    tags: [
      { t: "KYC / OCR", href: "/solutions/financial-services" },
      { t: "Fraud & risk", href: "/solutions/financial-services" },
      { t: "Chatbot QA", href: "/solutions/financial-services" },
    ],
  },
  {
    key: "telecom",
    label: "For telecoms",
    href: "/solutions/telecom",
    title: "Call intent, ASR QA & logs",
    desc: "Large-scale annotation for call intent/sentiment, spam detection, and network-log labeling for proactive diagnostics and CX.",
    tags: [
      { t: "Call intent", href: "/solutions/telecom" },
      { t: "ASR QA", href: "/solutions/telecom" },
      { t: "Log labeling", href: "/solutions/telecom" },
    ],
  },
  {
    key: "public",
    label: "For public sector",
    href: "/solutions/public-sector",
    title: "Secure data operations",
    desc: "Region-aware storage, DPAs, and vetted evaluator networks for safety testing, accessibility, and multilingual citizen services.",
    tags: [
      { t: "Data residency", href: "/solutions/public-sector" },
      { t: "Safety evals", href: "/solutions/public-sector" },
      { t: "DPAs", href: "/solutions/public-sector" },
    ],
  },
  {
    key: "health",
    label: "For health",
    href: "/solutions/health",
    title: "Clinical-grade review",
    desc: "Forms/OCR, de-identification, and SME evaluation with privacy by design. Evidence-driven QC, metrics, and lineage.",
    tags: [
      { t: "Clinical OCR", href: "/solutions/health" },
      { t: "De-ID", href: "/solutions/health" },
      { t: "SME eval", href: "/solutions/health" },
    ],
  },
  {
    key: "retail",
    label: "For retail & commerce",
    href: "/solutions/retail-commerce",
    title: "Catalog, search & receipts OCR",
    desc: "Catalog enrichment, product taxonomy QA, search/reco evaluations, and retail OCR for receipts/invoices — measured for lift.",
    tags: [
      { t: "Catalog enrichment", href: "/solutions/retail-commerce" },
      { t: "Search/reco evals", href: "/solutions/retail-commerce" },
      { t: "Receipts OCR", href: "/solutions/retail-commerce" },
    ],
  },
  {
    key: "bpo",
    label: "For BPO",
    href: "/solutions/bpo",
    title: "Contact center data & QA",
    desc: "Speech/intent corpora, QA rubrics, compliance checks, and containment metrics to train assistants and coach models.",
    tags: [
      { t: "ASR & intents", href: "/solutions/bpo" },
      { t: "QA & compliance", href: "/solutions/bpo" },
      { t: "Containment metrics", href: "/solutions/bpo" },
    ],
  },
];

export default function SolutionsDropdown() {
  const [active, setActive] = useState<SolKey>("ai-labs");
  const current = ITEMS.find((i) => i.key === active)!;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Left list */}
      <div className="flex flex-col" role="menu" aria-label="Solutions">
        {ITEMS.map((item) => {
          const isActive = item.key === active;
          return (
            <Link
              key={item.key}
              href={item.href}
              role="menuitem"
              onMouseEnter={() => setActive(item.key)}
              onFocus={() => setActive(item.key)}
              className={[
                "mb-1 rounded-lg px-3 py-2 text-sm outline-none transition",
                "text-white/85 hover:text-white hover:bg-white/5",
                isActive ? "bg-white/10 text-white ring-1 ring-white/10" : "",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Right preview card */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-start gap-3">
          <svg
            className="mt-0.5 h-5 w-5 text-emerald-300"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2a7 7 0 0 0-7 7v.6a3.4 3.4 0 0 0-2 3.1 3.4 3.4 0 0 0 3.4 3.4h1.1A5.5 5.5 0 0 0 12 21a5.5 5.5 0 0 0 4.5-2.3h1.1a3.4 3.4 0 0 0 3.4-3.4 3.4 3.4 0 0 0-2-3.1V9a7 7 0 0 0-7-7z" />
          </svg>
          <div>
            <div className="text-sm font-semibold text-white">
              {current.title}
            </div>
            <p className="mt-1 text-sm text-white/70">{current.desc}</p>
          </div>
        </div>

        {/* Quick links */}
        <div className="mt-4 flex flex-wrap gap-2">
          {current.tags.map((q) => (
            <Link
              key={q.t}
              href={q.href}
              className="rounded-lg border border-white/15 px-2 py-1 text-xs text-white/80 hover:bg-white/5 hover:text-white"
            >
              {q.t}
            </Link>
          ))}
        </div>

        {/* Learn more */}
        <div className="mt-4">
          <Link
            href={current.href}
            className="inline-flex items-center gap-1 text-sm text-white hover:opacity-90"
          >
            Learn more
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 4l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
