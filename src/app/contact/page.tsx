import Nav from "@/components/nav";
import Footer from "@/components/footer";
import CTA from "@/components/cta";

export const metadata = {
  title: "Contact — Eumanai",
  description:
    "Talk to Eumanai about consent-based data sourcing, expert labeling, and LLM evaluations.",
};

export default function ContactPage() {
  return (
    <div className="pb-12">
      <Nav />

      {/* Hero */}
      <section className="pt-10 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-gray-700">
            Let’s scope a 1–2 week pilot
          </div>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl">
            Contact Eumanai
          </h1>

          <p className="mt-4 text-gray-700">
            Tell us your use case. We’ll sign an NDA, propose a focused pilot,
            and share success metrics, timelines, and costs.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="mt-8">
        <div className="mx-auto max-w-3xl px-4">
          <CTA />
          <p className="mt-4 text-center text-sm text-gray-600">
            Prefer email?{" "}
            <a
              className="underline hover:text-black"
              href="mailto:hello@eumanai.com"
            >
              hello@eumanai.com
            </a>{" "}
            • Africa HQ: Lagos
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
