import Footer from "@/components/footer";
import Nav from "@/components/nav";
import Link from "next/link";
import { services } from "./data";

export const metadata = {
  title: "Services - Euman Intelligence",
  description:
    "RFP, bid, and proposal support shaped by human proposal judgment and AI-enabled execution.",
};

const workflow = [
  {
    title: "Understand the opportunity",
    text: "We review the buyer, scope, requirements, deadlines, and pressure points before recommending the response path.",
  },
  {
    title: "Structure the work",
    text: "We turn scattered requirements and inputs into workstreams, decisions, evidence needs, and a practical review rhythm.",
  },
  {
    title: "Develop the response",
    text: "We support writing, compliance, SME input, review, and refinement with human judgment and AI-enabled structure.",
  },
  {
    title: "Finish cleanly",
    text: "We help protect the last mile: completeness, clarity, attachments, submission readiness, and outcome learning.",
  },
];

const signals = [
  "You have an active RFP and limited internal proposal capacity.",
  "The opportunity is valuable, but the requirements are complex or unclear.",
  "SME input is needed, but collecting it is slowing the response down.",
  "Your team needs proposal discipline without adopting heavy RFP software first.",
];

export default function ServicesPage() {
  return (
    <div className="bg-[#05070b] pb-12 text-white">
      <Nav />

      <section className="relative overflow-hidden border-b border-white/10 bg-[#05070b]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(circle at 18% 16%, rgba(20,184,166,0.22), transparent 32%), radial-gradient(circle at 86% 12%, rgba(148,163,184,0.14), transparent 30%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-emerald-200 backdrop-blur">
            RFP and proposal intelligence services
          </div>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            Practical proposal support for teams pursuing important RFPs.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-white/70">
            We help turn buyer requirements, SME knowledge, and business context
            into clearer pursuit decisions, stronger responses, and cleaner
            submission work.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300/40 hover:bg-white/[0.09]"
            >
              <div className="pointer-events-none absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-cyan-300 via-emerald-300 to-white/40 opacity-80" />
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                {service.eyebrow}
              </div>
              <h2 className="mt-4 text-xl font-semibold text-white">
                {service.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/65">
                {service.summary}
              </p>
              <div className="mt-5 text-sm font-medium text-emerald-200">
                Learn more
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-black/20 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              How services connect
            </div>
            <h2 className="mt-3 text-3xl font-bold">
              One response workflow, different entry points.
            </h2>
            <p className="mt-4 text-white/65">
              You can bring us in for one focused part of the response or use
              the services together as a managed proposal execution path.
            </p>
          </div>
          <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {workflow.map((item, index) => (
              <article
                key={item.title}
                className="rounded-3xl border border-white/10 bg-white/[0.06] p-5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-gray-950">
                  {index + 1}
                </div>
                <h3 className="mt-5 font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/65">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              When to bring us in
            </div>
            <h2 className="mt-3 text-3xl font-bold text-white">
              Use Euman Intelligence when the opportunity needs more order.
            </h2>
            <p className="mt-4 text-white/65">
              The work is most useful when there is a real opportunity to
              pursue, a timeline to protect, and a need for structured proposal
              judgment.
            </p>
          </div>
          <div className="grid gap-3">
            {signals.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white/75 shadow-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 text-white shadow-sm sm:p-10">
          <div
            aria-hidden
            className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl"
          />
          <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-3xl font-bold">
                Need support on an active opportunity?
              </h2>
              <p className="mt-3 max-w-2xl text-white/65">
                Share the RFP, deadline, and current state of the response. We
                will help identify the right service path.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex justify-center rounded-xl bg-white px-5 py-3 font-medium text-gray-950 transition hover:bg-emerald-50"
            >
              Start a conversation
            </Link>
          </div>
        </div>
      </section>

      <Footer variant="dark" />
    </div>
  );
}
