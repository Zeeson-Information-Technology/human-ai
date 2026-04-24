import Image from "next/image";
import Link from "next/link";
import Footer from "../components/footer";
import Highlight from "../components/highlight";
import Nav from "../components/nav";
import Section from "../components/section";
import Stats from "../components/stats";

export default function Page() {
  return (
    <div className="pb-12">
      <Nav />

      <section className="relative overflow-hidden border-b">
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
            <div className="relative isolate overflow-hidden">
              <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs font-medium text-gray-600 backdrop-blur">
                Human judgment • AI-enabled execution • Proposal leadership
              </div>

              <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl">
                Human and AI intelligence for proposals, bids, and RFPs
              </h1>

              <div className="pointer-events-none mt-2 h-[3px] w-24 rounded-full bg-gradient-to-r from-emerald-400/70 to-cyan-400/20" />

              <p className="mt-4 max-w-2xl text-gray-600">
                Euman Intelligence works with businesses that need sharp
                proposal thinking without investing in heavyweight RFP software
                or building a full response team in house. We start by
                understanding your business, shape the response around what
                matters, and carry the work forward with discipline, speed, and
                context.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 font-medium text-white shadow-xl ring-1 ring-black/10 transition hover:bg-gray-900 hover:shadow-2xl"
                >
                  Request a consultation
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M7 4l6 6-6 6" />
                  </svg>
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 font-medium text-gray-900 shadow-sm transition hover:bg-gray-50 hover:shadow"
                >
                  See how we work
                  <svg
                    className="h-4 w-4 text-gray-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M7 4l6 6-6 6" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="relative overflow-hidden">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-10 -z-10 rounded-[28px] blur-2xl opacity-70"
                style={{
                  background:
                    "radial-gradient(65% 55% at 60% 50%, rgba(226,254,255,0.75) 0%, rgba(226,254,255,0.25) 45%, rgba(226,254,255,0) 75%)",
                }}
              />

              <Image
                src="/equatoria-hero-brain-circle-clean.svg"
                alt="Proposal delivery workflow supported by AI and human experts"
                priority
                width={720}
                height={720}
                className="relative z-10 w-full max-w-xl rounded-2xl shadow-xl ring-1 ring-black/5 animate-hero-float"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b">
        <div className="mx-auto max-w-5xl px-4 py-6 text-center">
          <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Designed for teams navigating complex buying processes
          </div>
          <div className="mt-4 grid grid-cols-2 items-center gap-x-8 gap-y-3 opacity-70 sm:grid-cols-6">
            <div className="text-sm font-semibold text-gray-500">Consulting</div>
            <div className="text-sm font-semibold text-gray-500">Public Sector</div>
            <div className="text-sm font-semibold text-gray-500">Health</div>
            <div className="text-sm font-semibold text-gray-500">Telecom</div>
            <div className="text-sm font-semibold text-gray-500">Financial Services</div>
            <div className="text-sm font-semibold text-gray-500">Technology</div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4">
        <div className="mt-8">
          <Highlight />
        </div>
        <div className="mt-8">
          <Stats />
        </div>
      </div>

      <Section
        id="services"
        title="A sharper way to run response work"
        subtitle="We help clients move from scattered inputs to clear, submission-ready responses."
      >
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Bid qualification",
              desc: "Review requirements, timelines, fit, and delivery expectations so decisions are made with clarity early.",
            },
            {
              title: "Response development",
              desc: "Draft executive summaries, response sections, and value-led narratives that speak to buyer priorities.",
            },
            {
              title: "Compliance tracking",
              desc: "Translate instructions into a clear response structure so mandatory requirements do not get lost.",
            },
            {
              title: "Expert input capture",
              desc: "Bring technical, commercial, and delivery perspectives into the response without creating noise or delay.",
            },
            {
              title: "Review and refinement",
              desc: "Strengthen clarity, consistency, evidence, and evaluator-readability before final packaging.",
            },
            {
              title: "Cross-market readiness",
              desc: "Support opportunities across global buyer environments, including current focus areas in Canada, the US, and the UK.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="group relative overflow-hidden rounded-2xl border p-6 shadow-sm transition hover:-translate-y-0.5"
            >
              <div className="pointer-events-none absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-cyan-400 via-emerald-400 to-slate-900 opacity-80" />
              <h3 className="font-semibold">{card.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{card.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="regions"
        title="Where we focus"
        subtitle="Our current commercial focus reflects the markets where structured response work matters most."
      >
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Canada",
              desc: "Support for public and private sector responses requiring clear compliance, governance, and structured service narratives.",
            },
            {
              title: "United States",
              desc: "Fast-turn proposal support for enterprise and government-oriented opportunities with multi-stakeholder review cycles.",
            },
            {
              title: "United Kingdom",
              desc: "Bid support aligned to formal tender expectations, framework language, and disciplined response management.",
            },
          ].map((market) => (
            <div key={market.title} className="rounded-2xl border p-6">
              <div className="font-semibold">{market.title}</div>
              <p className="mt-2 text-sm text-gray-600">{market.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="process"
        title="How the engagement moves"
        subtitle="We reduce friction by taking hold of the response process early and keeping it organized."
      >
        <ol className="grid list-decimal gap-6 pl-5 sm:grid-cols-3">
          {[
            {
              t: "Assess the opportunity",
              s: "We review the RFP, the scope, the stakeholders, and the pressure points around the opportunity.",
            },
            {
              t: "Set the response path",
              s: "We define the structure, key themes, dependencies, evidence needs, and decision points.",
            },
            {
              t: "Develop the response",
              s: "We work through drafting, clarifications, interviews, and content shaping with pace and order.",
            },
            {
              t: "Check the details",
              s: "We review instructions, attachments, mandatory criteria, and answer completeness before submission.",
            },
            {
              t: "Strengthen the case",
              s: "We sharpen differentiation, commercial positioning, and the story the buyer will actually read.",
            },
            {
              t: "Finish cleanly",
              s: "We support final packaging, approvals, and the last-mile review that protects the response.",
            },
          ].map((item, idx) => (
            <li key={idx} className="relative rounded-2xl border p-6">
              <div className="text-xs text-gray-500">Step {idx + 1}</div>
              <div className="font-semibold">{item.t}</div>
              <p className="mt-1 text-sm text-gray-600">{item.s}</p>
              <div className="pointer-events-none absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-slate-900 via-emerald-400 to-cyan-400 opacity-60" />
            </li>
          ))}
        </ol>
      </Section>

      <Section
        id="why-us"
        title="Why this model works"
        subtitle="The approach is built for teams that need better outcomes, not more software to manage."
      >
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              t: "Structured delivery",
              s: "Clear workstreams, tracked inputs, and visible review cycles reduce last-minute confusion.",
            },
            {
              t: "Human-led with modern tooling",
              s: "Technology helps move faster, but judgment, nuance, and accountability stay with people who understand the work.",
            },
            {
              t: "Built for lean teams",
              s: "It works for companies that want strong proposal capability without committing to expensive software and a large in-house response function.",
            },
          ].map((item) => (
            <div key={item.t} className="relative rounded-2xl border p-6">
              <div className="font-semibold">{item.t}</div>
              <p className="mt-2 text-sm text-gray-600">{item.s}</p>
              <div className="pointer-events-none absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-cyan-400 via-emerald-400 to-slate-900 opacity-60" />
            </div>
          ))}
        </div>
      </Section>

      <section className="border-t">
        <div className="mx-auto max-w-5xl px-4 py-12 text-center">
          <h2 className="text-2xl font-bold">
            Need a smarter way to move an active opportunity forward?
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-gray-700">
            Share the opportunity, the context, and the timeline. We will assess
            the brief, identify the response path, and show you how the work can
            move with less internal drag.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/contact"
              className="rounded-xl bg-black px-5 py-3 font-medium text-white hover:opacity-90"
            >
              Request a consultation
            </Link>
            <Link
              href="/about"
              className="rounded-xl border px-5 py-3 font-medium hover:bg-gray-50"
            >
              Learn more
            </Link>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Euman Intelligence • proposals@eumanai.com
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
