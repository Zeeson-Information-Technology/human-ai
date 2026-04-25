import Footer from "@/components/footer";
import Nav from "@/components/nav";
import Link from "next/link";
import { getCareer, careers } from "../data";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return careers.map((career) => ({ slug: career.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const career = getCareer(slug);
  if (!career) return {};
  return {
    title: `${career.title} - Euman Intelligence`,
    description: career.summary,
  };
}

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

export default async function CareerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const career = getCareer(slug);
  if (!career) notFound();

  const related = careers
    .filter((item) => item.slug !== career.slug)
    .slice(0, 3);
  const mailto = `mailto:proposals@eumanai.com?subject=${encodeURIComponent(
    `Application - ${career.title}`
  )}`;

  return (
    <div className="bg-[#05070b] pb-12 text-white">
      <Nav />

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <Link
            href="/careers"
            className="text-sm font-medium text-white/65 underline underline-offset-4 hover:text-white"
          >
            Back to careers
          </Link>

          <div className="mt-8 flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                {career.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/70">
                <span>{career.type}</span>
                <span>&bull;</span>
                <span>{career.location}</span>
                <StatusBadge status={career.status} />
              </div>
              <p className="mt-6 text-lg leading-8 text-white/70">
                {career.summary}
              </p>
            </div>

            <a
              href={mailto}
              className="inline-flex justify-center rounded-xl bg-white px-5 py-3 font-medium text-gray-950 transition hover:bg-emerald-50"
            >
              Apply now
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <main className="min-w-0">
            <div className="space-y-10 rounded-3xl border border-white/10 bg-white/[0.05] p-6 sm:p-8">
              <section>
                <h2 className="text-2xl font-semibold text-white">Who we are</h2>
                <p className="mt-4 text-base leading-8 text-white/75">
                  {career.whoWeAre}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white">
                  About the role
                </h2>
                <p className="mt-4 text-base leading-8 text-white/75">
                  {career.intro}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white">
                  Key responsibilities
                </h2>
                <ul className="mt-4 space-y-3 text-base leading-7 text-white/75">
                  {career.responsibilities.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white">
                  What we are looking for
                </h2>
                <ul className="mt-4 space-y-3 text-base leading-7 text-white/75">
                  {career.qualifications.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-white/60" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white">
                  How to apply
                </h2>
                <p className="mt-4 text-base leading-8 text-white/75">
                  Send your cover letter and resume to{" "}
                  <a
                    href={mailto}
                    className="font-medium text-white underline underline-offset-2"
                  >
                    proposals@eumanai.com
                  </a>
                  . Use <span className="font-medium text-white">{career.title}</span>{" "}
                  as your email subject.
                </p>
                <div className="mt-5">
                  <div className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
                    What to include
                  </div>
                  <ul className="mt-4 space-y-3 text-base leading-7 text-white/75">
                    {career.whatToSend.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </div>
          </main>

          <aside className="space-y-5">
            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                Apply
              </div>
              <h2 className="mt-3 text-xl font-semibold text-white">
                Interested in this role?
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/70">
                Send your cover letter and resume to proposals@eumanai.com.
              </p>
              <a
                href={mailto}
                className="mt-5 inline-flex w-full justify-center rounded-xl bg-white px-4 py-3 text-sm font-medium text-gray-950 transition hover:bg-emerald-50"
              >
                Apply by email
              </a>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                Similar roles
              </div>
              <div className="mt-4 grid gap-3">
                {related.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/careers/${item.slug}`}
                    className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 transition hover:border-emerald-300/40 hover:bg-white/[0.08]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-semibold text-white">
                        {item.title}
                      </h3>
                      <StatusBadge status={item.status} />
                    </div>
                    <div className="mt-2 text-xs text-white/55">
                      {item.type} &bull; {item.location}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 text-sm leading-6 text-white/70">
              If you can&apos;t find the right role, send your resume directly
              to{" "}
              <a
                href="mailto:proposals@eumanai.com"
                className="font-medium text-white underline underline-offset-2"
              >
                proposals@eumanai.com
              </a>
              .
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </div>
  );
}
