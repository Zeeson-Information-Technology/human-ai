"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const serviceLinks = [
  {
    href: "/services/bid-qualification",
    label: "Bid Qualification",
    desc: "Assess fit, risk, requirements, and pursuit readiness early.",
  },
  {
    href: "/services/response-development",
    label: "Response Development",
    desc: "Shape buyer-focused narratives, sections, and executive summaries.",
  },
  {
    href: "/services/compliance-tracking",
    label: "Compliance Tracking",
    desc: "Keep instructions, attachments, and mandatory requirements visible.",
  },
  {
    href: "/services/expert-input-capture",
    label: "Expert Input Capture",
    desc: "Collect SME, stakeholder, and delivery intelligence with structure.",
  },
  {
    href: "/services/review-and-refinement",
    label: "Review & Refinement",
    desc: "Improve clarity, evidence, consistency, and evaluator-readability.",
  },
  {
    href: "/services/cross-market-readiness",
    label: "Cross-Market Readiness",
    desc: "Support responses across Canada, the US, the UK, and global buyers.",
  },
];

const companyLinks = [
  {
    href: "/about",
    label: "About",
    desc: "The thinking behind the brand and the way we approach the work.",
  },
  {
    href: "/zuri",
    label: "Zuri Intelligence",
    desc: "A structured way to capture context, insight, and expert input.",
  },
  {
    href: "/contact",
    label: "Contact",
    desc: "Bring us into an active opportunity or a recurring response need.",
  },
  {
    href: "/careers",
    label: "Careers",
    desc: "Join our remote global team supporting proposal work for clients across markets.",
  },
];

function Dropdown({ label, items }) {
  return (
    <div className="group relative">
      <button
        type="button"
        className="flex items-center gap-1 text-white/85 outline-none transition hover:text-white focus:text-white"
        aria-haspopup="true"
        aria-expanded="false"
      >
        <span>{label}</span>
        <svg
          className="h-3 w-3 transition-transform duration-200 group-hover:-rotate-180 group-focus-within:-rotate-180"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z" />
        </svg>
      </button>

      <div
        className={[
          "invisible absolute left-1/2 top-full mt-3 w-[360px] -translate-x-1/2 translate-y-1 opacity-0",
          "rounded-2xl border border-white/15 bg-[#0b0b0fe6] p-3",
          "backdrop-blur-xl shadow-2xl ring-1 ring-white/10",
          "transition-all duration-150 ease-out",
          "group-hover:visible group-hover:translate-y-0 group-hover:opacity-100",
          "group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100",
        ].join(" ")}
        role="menu"
        aria-label={label}
      >
        <div className="grid gap-2">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-xl px-3 py-3 text-left transition hover:bg-white/5"
            >
              <div className="text-sm font-medium text-white">{item.label}</div>
              <div className="mt-1 text-xs text-white/65">{item.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <header className="sticky top-4 z-50">
      <div className="mx-auto max-w-5xl px-4">
        <div
          className={[
            "flex h-16 items-center justify-between rounded-2xl px-4 md:px-5",
            "border border-white/30 bg-[#0000004d]",
            "backdrop-blur-md supports-[backdrop-filter]:backdrop-blur-md",
            "shadow-[0_8px_30px_rgba(0,0,0,0.25)] ring-1 ring-white/10",
          ].join(" ")}
          aria-label="Euman Intelligence Home"
        >
          <Link
            href="/"
            className="flex items-center gap-2 text-white"
            aria-label="Euman Intelligence Home"
          >
            <Image
              src="/euman_logo.png"
              alt="Euman Intelligence"
              className="h-auto w-auto"
              width={137}
              height={32}
              priority
            />
          </Link>

          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Dropdown label="Services" items={serviceLinks} />
            <Dropdown label="Company" items={companyLinks} />

            <Link
              href="/contact"
              className="rounded-lg bg-white px-3 py-2 font-medium text-slate-900 hover:bg-slate-100"
              aria-label="Start a conversation"
            >
              Start a conversation
            </Link>
          </nav>

          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 text-sm font-medium text-white shadow-sm transition hover:bg-white/15"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              <span>{mobileOpen ? "Close" : "Menu"}</span>
              <svg
                className={`h-4 w-4 transition-transform ${
                  mobileOpen ? "rotate-180" : ""
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M3 5.75A.75.75 0 0 1 3.75 5h12.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 5.75zm0 4.25a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 10zm0 4.25a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 14.25z" />
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div className="mt-3 overflow-hidden rounded-3xl border border-white/15 bg-[#08090de8] p-3 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur-xl md:hidden">
            <div className="grid gap-3">
              <Link
                href="/services"
                onClick={closeMobileMenu}
                className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3"
              >
                <div className="text-sm font-semibold text-emerald-100">
                  Services
                </div>
                <div className="mt-1 text-xs leading-5 text-white/65">
                  RFP, bid, and proposal intelligence support.
                </div>
              </Link>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2">
                <button
                  type="button"
                  onClick={() => setMobileServicesOpen((open) => !open)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition hover:bg-white/[0.07]"
                  aria-expanded={mobileServicesOpen}
                >
                  <span>
                    <span className="block text-sm font-semibold text-white">
                      Proposal services
                    </span>
                    <span className="mt-1 block text-xs text-white/55">
                      View all RFP support areas
                    </span>
                  </span>
                  <svg
                    className={`h-4 w-4 text-white/60 transition-transform ${
                      mobileServicesOpen ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z" />
                  </svg>
                </button>

                {mobileServicesOpen ? (
                  <div className="mt-1 grid gap-1 border-t border-white/10 pt-2">
                    {serviceLinks.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={closeMobileMenu}
                        className="rounded-xl px-3 py-3 transition hover:bg-white/[0.07]"
                      >
                        <div className="text-sm font-medium text-white">
                          {item.label}
                        </div>
                        <div className="mt-1 text-xs leading-5 text-white/55">
                          {item.desc}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Link
                  href="/about"
                  onClick={closeMobileMenu}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/[0.07]"
                >
                  About
                </Link>
                <Link
                  href="/zuri"
                  onClick={closeMobileMenu}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/[0.07]"
                >
                  Zuri intelligence
                </Link>
                <Link
                  href="/careers"
                  onClick={closeMobileMenu}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/[0.07]"
                >
                  Careers
                </Link>
              </div>

              <div className="grid gap-2">
                <Link
                  href="/contact"
                  onClick={closeMobileMenu}
                  className="inline-flex justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-50"
                >
                  Start a conversation
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
