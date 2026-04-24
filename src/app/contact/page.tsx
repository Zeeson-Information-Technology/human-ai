import CTA from "@/components/cta";
import Footer from "@/components/footer";
import Nav from "@/components/nav";

export const metadata = {
  title: "Contact - Euman Intelligence",
  description:
    "Talk to Euman Intelligence about proposals, bids, and RFP responses shaped through human judgment and AI-enabled execution.",
};

export default function ContactPage() {
  return (
    <div className="pb-12">
      <Nav />

      <section className="pt-10 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-gray-700">
            Bring us into the opportunity early
          </div>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl">
            Let&apos;s talk
          </h1>

          <p className="mt-4 text-gray-700">
            Tell us about the opportunity, your timeline, and where the process
            is getting heavy. We will review the brief and outline a clear way
            to move the response forward.
          </p>
        </div>
      </section>

      <section className="mt-8">
        <div className="mx-auto max-w-3xl px-4">
          <CTA />
          <p className="mt-4 text-center text-sm text-gray-600">
            Prefer email?{" "}
            <a
              className="underline hover:text-black"
              href="mailto:proposals@eumanai.com"
            >
              proposals@eumanai.com
            </a>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
