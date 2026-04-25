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
    <div className="min-h-screen bg-[#05070b] pb-12 text-white">
      <Nav />

      <section className="relative overflow-hidden border-b border-white/10 pt-10 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 15% 18%, rgba(20,184,166,0.18), transparent 28%), radial-gradient(circle at 88% 12%, rgba(255,255,255,0.08), transparent 32%), linear-gradient(135deg, rgba(15,23,42,0.98), rgba(5,7,11,0.94))",
          }}
        />
        <div className="relative mx-auto max-w-3xl px-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-xs font-medium text-emerald-200">
            Bring us into the opportunity early
          </div>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            Let&apos;s talk
          </h1>

          <p className="mt-4 text-white/70">
            Tell us about the opportunity, your timeline, and where the process
            is getting heavy. We will review the brief and outline a clear way
            to move the response forward.
          </p>
        </div>
      </section>

      <section className="mt-8">
        <div className="mx-auto max-w-3xl px-4">
          <CTA />
          <p className="mt-4 text-center text-sm text-white/65">
            Prefer email?{" "}
            <a
              className="underline transition hover:text-white"
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
