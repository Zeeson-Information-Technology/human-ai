// src/app/human-data/page.tsx
import type { Metadata } from "next";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import Link from "next/link";
import { brand } from "@/lib/brand";
import ClientContent from "./ClientContent";

export const metadata: Metadata = {
  title: `Human Data — ${brand.name}`,
  description:
    "How Eumanai sources, vets, trains, and manages expert talent to produce high-quality human data for AI. Africa-first network, global delivery.",
};

export default function HumanDataPage() {
  return (
    <div className="pb-16">
      <Nav />

      {/* Hero */}
      <section className="border-b">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Human Data
              </h1>
              <p className="mt-2 max-w-2xl text-gray-400">
                Eumanai’s human data playbook: Africa-first talent, global
                delivery. Our approach to sourcing, vetting, training, and
                managing experts to produce reliable post-training data for AI
                systems.
              </p>
            </div>

            {/* Primary CTAs */}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/zuri/start/login"
                className="rounded-lg border px-4 py-2 font-medium hover:bg-gray-50"
              >
                Log In
              </Link>
              <Link
                href="/zuri/start/register"
                className="rounded-lg bg-black px-4 py-2 font-medium text-white hover:opacity-90"
              >
                Create an account
              </Link>
              <Link
                href="/contact"
                className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
              >
                Book a demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section>
        <ClientContent />
      </section>

      <Footer />
    </div>
  );
}
