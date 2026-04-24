import Footer from "@/components/footer";
import Nav from "@/components/nav";

export const metadata = {
  title: "Zuri | Proposal Intelligence by Euman Intelligence",
  description:
    "Zuri is Euman Intelligence's proposal intelligence layer for opportunity sourcing, RFP summarization, go/no-go support, and structured human-in-the-loop reviews.",
};

const capabilities = [
  {
    title: "Opportunity sourcing",
    text: "Monitor buyer notices, tender portals, saved searches, and public opportunity signals so relevant RFPs can be surfaced earlier.",
  },
  {
    title: "RFP summarization",
    text: "Convert long RFPs, RFS documents, emails, and portal listings into clear briefs with buyer, scope, deadline, risks, and next steps.",
  },
  {
    title: "Preliminary go / no-go",
    text: "Highlight fit, capacity, compliance gaps, likely effort, and decision questions before a team commits to a pursuit.",
  },
  {
    title: "SME intelligence capture",
    text: "Collect structured input from technical, operational, commercial, and delivery experts without losing context in scattered calls.",
  },
  {
    title: "Resource matching",
    text: "Help identify proposal writers, coordinators, reviewers, estimators, or delivery resources when an opportunity needs extra support.",
  },
  {
    title: "Lifecycle memory",
    text: "Keep opportunity briefs, notes, decisions, subtasks, documents, reviews, and outcomes connected for future pursuits.",
  },
];

const flow = [
  {
    step: "Find",
    title: "Surface the right opportunities",
    text: "Zuri will help scan and organize opportunity signals from portals, notices, and client-shared sources.",
  },
  {
    step: "Understand",
    title: "Summarize the requirement",
    text: "Documents become structured briefs: buyer context, mandatory requirements, timelines, risks, and response path.",
  },
  {
    step: "Decide",
    title: "Support go / no-go judgment",
    text: "AI prepares the evidence, but the team makes the decision with human context and business priorities.",
  },
  {
    step: "Collaborate",
    title: "Collect the missing intelligence",
    text: "SMEs, clients, candidates, and delivery collaborators can provide structured input when the pursuit needs depth.",
  },
  {
    step: "Deliver",
    title: "Move through the workbench",
    text: "Tasks, deadlines, documents, reviews, and outcomes stay connected to the opportunity until submission and result.",
  },
];

const humanLoop = [
  "AI finds signals, humans confirm relevance.",
  "AI summarizes documents, humans validate meaning.",
  "AI surfaces risk, humans decide whether to pursue.",
  "AI structures questions, humans provide judgment.",
  "AI tracks context, humans lead the response.",
];

const futureModules = [
  "Portal search and saved opportunity feeds",
  "Document extraction and compliance mapping",
  "Bid/no-bid scoring with human override",
  "SME and stakeholder review sessions",
  "Candidate and resource sourcing for pursuits",
  "Workbench task intelligence and outcome learning",
];

export default function ZuriPage() {
  return (
    <div className="min-h-screen bg-[#05070b] text-white">
      <Nav />

      <main>
        <section className="relative overflow-hidden border-b border-white/10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 12% 18%, rgba(20,184,166,0.22), transparent 30%), radial-gradient(circle at 84% 12%, rgba(255,255,255,0.09), transparent 32%), linear-gradient(135deg, rgba(15,23,42,0.98), rgba(5,7,11,0.92))",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              maskImage:
                "radial-gradient(70rem 45rem at 35% 25%, rgba(0,0,0,1), rgba(0,0,0,0.05))",
              WebkitMaskImage:
                "radial-gradient(70rem 45rem at 35% 25%, rgba(0,0,0,1), rgba(0,0,0,0.05))",
            }}
          />

          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:py-24 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="inline-flex rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-200 backdrop-blur">
                Proposal intelligence layer
              </div>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
                Zuri connects AI intelligence with the human judgment behind
                winning proposal work.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
                Zuri is the intelligence layer we are building around the Euman
                workflow: opportunity sourcing, document understanding, early
                go / no-go support, structured reviews, and workbench context
                across the full RFP lifecycle.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/75">
                {["Find", "Summarize", "Decide", "Collaborate", "Deliver"].map(
                  (item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 shadow-sm backdrop-blur"
                    >
                      {item}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 text-white shadow-2xl backdrop-blur">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">
                    Opportunity intelligence
                  </div>
                  <div className="mt-5 space-y-3">
                    {[
                      ["Source", "Buyer notices, portals, shared documents"],
                      ["Brief", "Scope, deadline, fit, risks, questions"],
                      ["Decision", "Go / no-go with human review"],
                      ["Action", "Workbench tasks, SMEs, resources, delivery"],
                    ].map(([label, text]) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"
                      >
                        <div className="text-sm font-semibold text-white">
                          {label}
                        </div>
                        <div className="mt-1 text-sm text-white/65">{text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-white/10 bg-[#05070b] p-4 text-sm text-white/75 shadow-xl sm:block">
                Human-in-the-loop at every decision point.
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-white/[0.03]">
          <div className="mx-auto max-w-6xl px-4 py-7 text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              Built for proposal teams, RFP services, SMEs, and pursuit leaders
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">
              What Zuri will do
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              A practical intelligence layer around the opportunity.
            </h2>
            <p className="mt-4 text-white/65">
              The goal is not to replace proposal professionals. The goal is to
              reduce noise, surface the right context, and help people move with
              better intelligence.
            </p>
          </div>

          <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((item) => (
              <article
                key={item.title}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-sm transition hover:-translate-y-0.5 hover:bg-white/[0.08] hover:shadow-md"
              >
                <div className="pointer-events-none absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-teal-400 via-slate-900 to-amber-300 opacity-70" />
                <h3 className="text-lg font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/65">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-white/10 bg-black/35 text-white">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">
                  Lifecycle view
                </div>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                  From first signal to final outcome.
                </h2>
                <p className="mt-4 text-sm leading-6 text-white/70">
                  Zuri should help the team understand what the opportunity is,
                  whether it is worth pursuing, what knowledge is missing, and
                  how the response work should move.
                </p>
              </div>
              <div className="grid gap-4">
                {flow.map((item, index) => (
                  <div
                    key={item.step}
                    className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.06] p-5 sm:grid-cols-[88px_1fr]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-300 text-sm font-semibold text-slate-950">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-200">
                        {item.step}
                      </div>
                      <h3 className="mt-1 font-semibold text-white">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-white/65">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-sm sm:p-8">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">
                Human-in-the-loop
              </div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                AI prepares the work. Humans make the call.
              </h2>
              <div className="mt-6 grid gap-3">
                {humanLoop.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white/70"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-sm sm:p-8">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">
                Roadmap modules
              </div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Built around real proposal operations.
              </h2>
              <div className="mt-6 grid gap-3">
                {futureModules.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white/70"
                  >
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-sm sm:p-10">
            <div
              aria-hidden
              className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-teal-300/30 blur-3xl"
            />
            <div className="relative max-w-3xl">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">
                Current position
              </div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Zuri is part of the Euman Intelligence operating system, not a
                separate destination.
              </h2>
              <p className="mt-4 leading-7 text-white/70">
                Today, Euman Intelligence can run proposal support with human
                expertise and AI-assisted structure. Zuri represents the deeper
                intelligence layer we are building: sourcing, summarization,
                go/no-go support, collaboration, resource discovery, and
                lifecycle memory around each opportunity.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
