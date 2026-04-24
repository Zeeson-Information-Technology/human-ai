import Footer from "@/components/footer";
import Nav from "@/components/nav";
import Link from "next/link";
import { getService, services } from "../data";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: `${service.title} - Euman Intelligence`,
    description: service.summary,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const related = services.filter((item) => item.slug !== service.slug).slice(0, 3);

  return (
    <div className="bg-[#05070b] pb-12 text-white">
      <Nav />

      <section className="relative overflow-hidden border-b border-white/10 bg-[#05070b]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(circle at 18% 20%, rgba(20,184,166,0.22), transparent 34%), radial-gradient(circle at 88% 10%, rgba(148,163,184,0.14), transparent 32%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <Link
            href="/services"
            className="text-sm font-medium text-white/65 underline underline-offset-4 hover:text-white"
          >
            Back to services
          </Link>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_0.78fr]">
            <div>
              <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200 backdrop-blur">
                {service.eyebrow}
              </div>
              <h1 className="mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
                {service.headline}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
                {service.body}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex justify-center rounded-xl bg-white px-5 py-3 font-medium text-gray-950 transition hover:bg-emerald-50"
                >
                  Discuss this service
                </Link>
                <Link
                  href="/zuri"
                  className="inline-flex justify-center rounded-xl border border-white/15 bg-white/10 px-5 py-3 font-medium text-white transition hover:bg-white/15"
                >
                  See Zuri intelligence layer
                </Link>
              </div>
            </div>

            <aside className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-sm backdrop-blur">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
                What this supports
              </div>
              <div className="mt-5 grid gap-3">
                {service.outcomes.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white/75"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-sm sm:p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              When this helps
            </div>
            <h2 className="mt-3 text-2xl font-bold text-white">
              Good fit for this kind of situation.
            </h2>
            <div className="mt-6 grid gap-3">
              {service.bestFor.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm leading-6 text-white/75"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-sm sm:p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              What we work from
            </div>
            <h2 className="mt-3 text-2xl font-bold text-white">
              Useful inputs at the start.
            </h2>
            <div className="mt-6 grid gap-3">
              {service.inputs.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm leading-6 text-white/75"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-black/20 text-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                Service outcome
              </div>
              <h2 className="mt-3 text-3xl font-bold">
                Clearer proposal intelligence, not more internal noise.
              </h2>
              <p className="mt-4 text-white/65">
                The purpose is to make the next decision or next draft easier:
                clearer context, fewer missed details, and a response team that
                knows what needs to happen next.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {service.outcomes.map((item) => (
                <div
                  key={item}
                  className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 text-sm leading-6 text-white/75"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              How it fits
            </div>
            <h2 className="mt-3 text-3xl font-bold text-white">
              Part of a complete response workflow.
            </h2>
            <p className="mt-4 text-white/65">
              This service can stand alone for a specific opportunity or connect
              into a broader engagement covering qualification, writing,
              compliance, expert input, review, and final packaging.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {["Assess", "Structure", "Execute"].map((step, index) => (
              <div
                key={step}
                className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-gray-950">
                  {index + 1}
                </div>
                <h3 className="mt-5 font-semibold text-white">{step}</h3>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  {index === 0
                    ? "Understand the opportunity, buyer, scope, and pressure points."
                    : index === 1
                      ? "Create a response path with clear workstreams and evidence needs."
                      : "Move the work forward with disciplined review and delivery support."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                Related services
              </div>
              <h2 className="mt-2 text-2xl font-bold text-white">
                Other ways we support the response.
              </h2>
            </div>
            <Link
              href="/services"
              className="text-sm font-medium text-white/75 underline hover:text-white"
            >
              View all services
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/services/${item.slug}`}
                className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300/40 hover:bg-white/[0.09]"
              >
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  {item.summary}
                </p>
              </Link>
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
                Want to use this on an active opportunity?
              </h2>
              <p className="mt-3 max-w-2xl text-white/65">
                Send the opportunity context and where the response is stuck. We
                will help define the right next step.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex justify-center rounded-xl bg-white px-5 py-3 font-medium text-gray-950 transition hover:bg-emerald-50"
            >
              Discuss this service
            </Link>
          </div>
        </div>
      </section>

      <Footer variant="dark" />
    </div>
  );
}
