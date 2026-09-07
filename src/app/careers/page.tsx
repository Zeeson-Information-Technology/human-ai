import Footer from "@/components/footer";
import Nav from "@/components/nav";
import Link from "next/link";
import { careers } from "./data";

export const metadata = {
  title: "Careers - Euman Intelligence",
  description:
    "Join Euman Intelligence to support global clients through proposal, bid, and RFP work with strong remote-team values.",
};

const values = [
  {
    title: "Ownership",
    text: "We take responsibility for the quality of the work, the clarity of communication, and the commitments we make to clients and to each other.",
  },
  {
    title: "Collaboration",
    text: "Strong proposal work depends on shared context. We work openly across writing, review, delivery, and client coordination so nothing important gets lost.",
  },
  {
    title: "Judgment",
    text: "We use AI to remove friction, but we rely on human thinking to decide what matters, what is credible, and what should be said.",
  },
  {
    title: "Reliability",
    text: "Remote work only works when people are dependable. We value follow-through, responsiveness, and the discipline to move work forward without constant prompting.",
  },
  {
    title: "Craft",
    text: "Proposal writing is not filler work. We care about structure, precision, readability, and the standard of the final submission.",
  },
  {
    title: "Global mindset",
    text: "We support clients across markets and time zones. That means clear communication, cultural awareness, and comfort working with distributed teams.",
  },
];

function StatusBadge({ status }: { status: string }) {
  const open = status.toLowerCase() === "open";
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
        open ? "bg-emerald-300 text-slate-950" : "bg-white/10 text-white/70"
      }`}
    >
      {status}
    </span>
  );
}

export default function CareersPage() {
  return (
    <div className="bg-gradient-to-b from-[#050505] via-[#0a0a0f] to-black pb-12 text-gray-300">
      <Nav />

      <section className="relative overflow-hidden border-b border-white/10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 15% 18%, rgba(20,184,166,0.16), transparent 28%), radial-gradient(circle at 88% 12%, rgba(255,255,255,0.08), transparent 32%), linear-gradient(135deg, rgba(15,23,42,0.98), rgba(5,7,11,0.94))",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 py-20 text-center sm:py-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-emerald-200">
            Careers
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            Build proposal intelligence with a remote global team.
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-300">
            We are building a team that supports global clients through
            proposals, bids, and RFP work with clarity, ownership, and strong
            collaboration across time zones.
          </p>
        </div>
      </section>

      <section className="border-b border-white/5 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Our values
            </div>
            <h2 className="mt-3 text-3xl font-bold text-white">
              The kind of team we are building.
            </h2>
          </div>
          <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => (
              <article
                key={value.title}
                className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-sm"
              >
                <h3 className="text-xl font-semibold text-white">
                  {value.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-gray-300">
                  {value.text}
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
                Remote, structured, and client-facing.
              </h2>
              <p className="mt-4 text-base leading-7 text-gray-300">
                We work as a distributed team supporting live opportunities for
                global clients. That means strong writing habits, reliable
                coordination, careful review, and respect for deadlines.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {[
                "Remote-first collaboration across time zones",
                "Direct exposure to proposal and bid delivery",
                "Structured review and coaching on real work",
                "Opportunities to grow into stronger writing and management responsibility",
              ].map((item, index) => (
                <div
                  key={item}
                  className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-gray-950">
                    {index + 1}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-gray-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Open roles
            </div>
            <h2 className="mt-3 text-3xl font-bold text-white">
              Current opportunities at Euman Intelligence.
            </h2>
            <p className="mt-4 text-gray-300">
              Click any role to view the full job description and application
              instructions.
            </p>
          </div>

          <div className="mt-9 grid gap-5">
            {careers.map((role) => (
              <Link
                key={role.slug}
                href={`/careers/${role.slug}`}
                className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300/40 hover:bg-white/[0.08]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-semibold text-white">
                      {role.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-400">
                      <span>{role.type}</span>
                      <span>&bull;</span>
                      <span>{role.location}</span>
                    </div>
                  </div>
                  <StatusBadge status={role.status} />
                </div>
                <p className="mt-4 max-w-3xl text-sm leading-6 text-gray-300">
                  {role.summary}
                </p>
                <div className="mt-5 text-sm font-medium text-emerald-200">
                  View full job description
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-sm leading-6 text-gray-300">
            If you can&apos;t find the right role, send us your resume directly
            at{" "}
            <a
              href="mailto:proposals@eumanai.com"
              className="font-medium text-white underline underline-offset-2"
            >
              proposals@eumanai.com
            </a>
            .
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
