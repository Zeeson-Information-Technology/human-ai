import Footer from "@/components/footer";
import Nav from "@/components/nav";
import Link from "next/link";

export const metadata = {
  title: "About - Euman Intelligence",
  description:
    "Euman Intelligence brings human judgment and AI-enabled execution together to help businesses handle proposals, bids, and RFPs with more clarity.",
};

const beliefCards = [
  {
    label: "Context",
    title: "Proposal work needs more than generic automation",
    text: "Proposal work is too important to be left to generic automation and too demanding to depend on scattered effort.",
  },
  {
    label: "Clarity",
    title: "Strong responses come from structured judgment",
    text: "Strong responses come from people who understand context, structure, and what matters to a buyer.",
  },
  {
    label: "Purpose",
    title: "We bring steadier coordination into the process",
    text: "Euman Intelligence exists to bring more clarity, steadier coordination, and better follow-through into proposal work.",
  },
];

const workCards = [
  {
    title: "We start with understanding",
    text: "Before we push words onto a page, we take time to understand the business, the offer, the differentiators, and the pressure around the opportunity itself.",
  },
  {
    title: "We keep the work moving",
    text: "We use AI where it removes friction, but quality still depends on judgment, organization, and accountability. That is the standard behind the work.",
  },
];

const differenceCards = [
  {
    title: "Less overhead",
    text: "Many RFP tools assume you already have a mature content library, a response process, and a dedicated internal team. Many businesses do not.",
  },
  {
    title: "More momentum",
    text: "Our approach is to get close to the opportunity quickly, build a working understanding, and keep the response moving without forcing unnecessary complexity onto the client.",
  },
];

const credibilityCards = [
  {
    value: "10+ years",
    label: "Experience working with global teams",
  },
  {
    value: "RFP-led",
    label: "Built around proposal, bid, and tender response work",
  },
  {
    value: "Human + AI",
    label: "Designed for judgment, structure, and faster execution",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-gradient-to-b from-[#050505] via-[#0a0a0f] to-black pb-12 text-gray-300">
      <Nav />

      <section className="relative overflow-hidden border-b border-white/10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 mix-blend-soft-light opacity-10"
          style={{
            backgroundImage:
              "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2264%22 height=%2264%22 viewBox=%220 0 64 64%22><filter id=%22n%22 x=%220%22 y=%220%22 width=%22100%25%22 height=%22100%25%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%2264%22 height=%2264%22 filter=%22url(%23n)%22 opacity=%220.07%22/></svg>')",
          }}
        />

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <div className="py-20 sm:py-28">
            <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs font-medium text-gray-700 backdrop-blur">
              Human judgment &bull; AI-enabled execution &bull; Response
              clarity
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              About Euman Intelligence
            </h1>

            <div className="pointer-events-none mx-auto mt-4 h-[3px] w-24 rounded-full bg-gradient-to-r from-emerald-400/70 to-cyan-400/20" />

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-300">
              We are building Euman Intelligence around a simple belief:
              proposal work moves better when thoughtful people and modern
              intelligence work together.
            </p>

            <div className="relative z-20 mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/contact"
                className="rounded-xl bg-white px-6 py-4 text-lg font-medium text-gray-900 hover:bg-gray-100"
              >
                Start a conversation
              </Link>
              <Link
                href="/zuri"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-4 text-lg font-medium text-white transition hover:bg-white/15"
              >
                Explore Zuri
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-5 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-sm md:grid-cols-[1.1fr_1.4fr] md:p-8">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                Built from proposal experience
              </div>
              <h2 className="mt-3 text-2xl font-bold text-white">
                Proposal intelligence shaped by real response work.
              </h2>
            </div>
            <div>
              <p className="text-base leading-7 text-gray-300">
                Behind Euman Intelligence is more than 10 years of experience
                working with global teams, complex requirements, and structured
                response work. That experience shapes how we read RFPs, identify
                buyer priorities, organize proposal intelligence, and keep
                response execution grounded in real business context.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {credibilityCards.map((card) => (
                  <div
                    key={card.value}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="text-lg font-semibold text-white">
                      {card.value}
                    </div>
                    <div className="mt-1 text-xs leading-5 text-gray-400">
                      {card.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              What we believe
            </div>
            <h2 className="mt-3 text-3xl font-bold text-white">
              Better proposal work starts with better intelligence.
            </h2>
          </div>

          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {beliefCards.map((card) => (
              <article
                key={card.title}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-sm"
              >
                <div className="pointer-events-none absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-emerald-300 via-cyan-300 to-white/20" />
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                  {card.label}
                </div>
                <h3 className="mt-4 text-xl font-semibold leading-snug text-white">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-gray-300">
                  {card.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                How we work
              </div>
              <h2 className="mt-3 text-3xl font-bold text-white">
                We reduce ambiguity before we write.
              </h2>
              <p className="mt-4 text-base leading-7 text-gray-300">
                The process is designed to move from scattered inputs to a clear
                response path with ownership, structure, and pace.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {workCards.map((card, index) => (
                <article
                  key={card.title}
                  className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-gray-950">
                    {index + 1}
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-white">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-gray-300">
                    {card.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Why it feels different
            </div>
            <h2 className="mt-3 text-3xl font-bold text-white">
              Practical proposal support without unnecessary complexity.
            </h2>
          </div>
          <div className="mt-9 grid gap-5 md:grid-cols-2">
            {differenceCards.map((card) => (
              <article
                key={card.title}
                className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-7 shadow-sm"
              >
                <h3 className="text-2xl font-semibold text-white">
                  {card.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-gray-300">
                  {card.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 text-center shadow-sm sm:p-12">
            <div
              aria-hidden
              className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl"
            />
            <div className="relative mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-white">
                If the opportunity matters, the response process should too.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-gray-300">
                We help businesses bring more order, sharper thinking, and
                better follow-through into proposal work.
              </p>
              <Link
                href="/contact"
                className="mt-8 inline-block rounded-xl bg-white px-8 py-4 text-lg font-medium text-gray-900 transition hover:bg-gray-100"
              >
                Start a conversation
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
