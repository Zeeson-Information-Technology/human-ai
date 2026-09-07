import Link from "next/link";
import Footer from "../components/footer";
import Highlight from "../components/highlight";
import HeroWorkflowGraphic from "../components/hero-workflow-graphic";
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
                For SMEs pursuing government tenders
              </div>

              <h1 className="mt-4 max-w-xl text-4xl font-extrabold tracking-tight sm:text-6xl">
                Win more tenders without hiring a full bid team
              </h1>

              <div className="pointer-events-none mt-2 h-[3px] w-24 rounded-full bg-gradient-to-r from-emerald-400/70 to-cyan-400/20" />

              <p className="mt-3 text-sm font-semibold text-slate-700 sm:text-base">
                Human and AI intelligence for proposals, bids, and RFPs
              </p>

              <p className="mt-4 max-w-xl text-gray-600">
                For small and medium businesses entering government and public
                sector bids. We help you capture the brief, shape the response,
                source the right SME support, and keep delivery moving.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 font-medium text-white shadow-xl ring-1 ring-black/10 transition hover:bg-gray-900 hover:shadow-2xl"
                >
                  Start a consultation
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

              <HeroWorkflowGraphic />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b">
        <div className="mx-auto max-w-5xl px-4 py-6 text-center">
          <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Built for lean businesses entering government and public sector bids
          </div>
          <div className="mt-4 grid grid-cols-2 items-center gap-x-8 gap-y-3 opacity-70 sm:grid-cols-6">
            <div className="text-sm font-semibold text-gray-500">Consulting</div>
            <div className="text-sm font-semibold text-gray-500">
              Public Sector
            </div>
            <div className="text-sm font-semibold text-gray-500">Health</div>
            <div className="text-sm font-semibold text-gray-500">Telecom</div>
            <div className="text-sm font-semibold text-gray-500">
              Financial Services
            </div>
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
        id="proof"
        title="Trusted by leaders who know the work"
        subtitle="Built on real proposal experience, practical judgment, and the ability to spot what matters early."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          {[
            {
              quote:
                "Sharp instinct, solid judgment, and a practical grip on how proposal work should move.",
              by: "Current employer feedback",
            },
            {
              quote:
                "Trusted to notice risk early, organize the response, and keep the work moving under pressure.",
              by: "CEO feedback",
            },
          ].map((item) => (
            <figure
              key={item.by}
              className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="text-4xl leading-none text-emerald-500/30">“</div>
              <blockquote className="mt-3 text-lg leading-8 text-slate-800">
                {item.quote}
              </blockquote>
              <figcaption className="mt-4 text-sm font-medium text-slate-500">
                {item.by}
              </figcaption>
              <div className="pointer-events-none absolute inset-x-0 -top-px h-[2px] rounded-t-3xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-slate-900 opacity-80" />
            </figure>
          ))}
        </div>
      </Section>

      <Section
        id="services"
        title="Everything a lean tender team needs"
        subtitle="Capture the brief, respond well, source the right help, and stay on track through delivery."
      >
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Capture",
              desc: "Collect inquiry details, buyer context, RFP text, attachments, and deadlines before the work fragments.",
            },
            {
              title: "Response",
              desc: "Draft executive summaries, response sections, and value-led narratives that speak to buyer priorities.",
            },
            {
              title: "Talent sourcing",
              desc: "Identify the SME, writer, reviewer, or delivery support needed to move the pursuit forward quickly.",
            },
            {
              title: "Delivery support",
              desc: "Keep workbench tasks, deadlines, review cycles, and final packaging organized through submission.",
            },
            {
              title: "Low-budget pilot",
              desc: "Start small with one live tender, then expand once the workflow is working for your team.",
            },
            {
              title: "Cross-market readiness",
              desc: "Support opportunities across Canada, the US, the UK, and other global buyer environments.",
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
        id="fit"
        title="Best fit for"
        subtitle="We work best with smaller teams that want to compete for public sector work without heavy overhead."
      >
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Small & medium businesses",
              desc: "Companies that want to enter government tenders but do not need a full in-house response department.",
            },
            {
              title: "Lean proposal teams",
              desc: "Teams juggling sales, operations, and proposals who need extra structure and execution support.",
            },
            {
              title: "First-time bidders",
              desc: "Businesses who are new to government tenders and need help making the process less overwhelming.",
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
        title="How we work with you"
        subtitle="A simple path that keeps the work moving without unnecessary software or hiring overhead."
      >
        <ol className="grid list-decimal gap-6 pl-5 sm:grid-cols-3">
          {[
            {
              t: "Capture the pursuit",
              s: "We review the inquiry, RFP, attachments, and the pressures around the opportunity.",
            },
            {
              t: "Set the response path",
              s: "We define the structure, key themes, dependencies, evidence needs, and decision points.",
            },
            {
              t: "Source the support needed",
              s: "We bring in the right SME, writer, or delivery support so the opportunity keeps moving.",
            },
            {
              t: "Check the details",
              s: "We review instructions, attachments, mandatory criteria, and answer completeness before submission.",
            },
            {
              t: "Develop the response",
              s: "We shape the story the buyer will actually read, with stronger structure and sharper positioning.",
            },
            {
              t: "Support delivery",
              s: "We handle final packaging, approvals, the submission handoff, and the last-mile review that protects the response.",
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
        title="Why lean teams choose this model"
        subtitle="The approach is built for businesses that want better outcomes without more software to manage."
      >
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              t: "Structured capture",
              s: "Clear intake, source materials, and evidence paths reduce late confusion and lost context.",
            },
            {
              t: "Human-led with modern tooling",
              s: "Technology helps move faster, but judgment, nuance, and accountability stay with people who understand the work.",
            },
            {
              t: "Built for lean teams",
              s: "It works for companies that want stronger proposal capability without committing to expensive software and a large in-house response function.",
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
            Need help on your next tender without the overhead of a full bid team?
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-gray-700">
            Share the opportunity, the context, and the timeline. We will
            assess the brief, identify the response path, surface the SME or
            talent gap, and show you how the work can move with less internal
            drag.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/contact"
              className="rounded-xl bg-black px-5 py-3 font-medium text-white hover:opacity-90"
            >
              Book a fit call
            </Link>
            <Link
              href="/about"
              className="rounded-xl border px-5 py-3 font-medium hover:bg-gray-50"
            >
              Learn more
            </Link>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Euman Intelligence &bull; proposals@eumanai.com
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
