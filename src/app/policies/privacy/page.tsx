import Footer from "@/components/footer";
import Nav from "@/components/nav";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - Euman Intelligence",
  description: "How Euman Intelligence collects, uses, and protects your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="pb-12">
      <Nav />

      <section className="pt-10">
        <div className="mx-auto max-w-3xl px-4">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-gray-700">
            Policies
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 max-w-2xl text-gray-700">
            This policy explains how Euman Intelligence collects, uses, stores,
            and protects the information shared with us through our website,
            contact forms, proposal workflows, and related services.
          </p>
          <p className="mt-3 text-sm text-gray-500">Last updated: June 2024</p>
        </div>
      </section>

      <section className="mt-8">
        <div className="mx-auto max-w-3xl px-4">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="space-y-8 text-sm leading-7 text-gray-700 sm:text-base">
              <section>
                <h2 className="text-lg font-semibold text-gray-950">
                  1. Information We Collect
                </h2>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  <li>
                    Personal information such as name, email address, company,
                    and related contact details you provide.
                  </li>
                  <li>
                    Usage data, logs, and analytics from your interactions with
                    our website or platform.
                  </li>
                  <li>
                    Materials you submit for review or AI-assisted processing,
                    including documents, text, or audio where applicable.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-950">
                  2. How We Use Your Information
                </h2>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  <li>To provide, operate, and improve our services.</li>
                  <li>To respond to your inquiries and support requests.</li>
                  <li>To manage internal operations, analytics, and research.</li>
                  <li>To comply with legal, regulatory, or contractual obligations.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-950">
                  3. Data Sharing and Security
                </h2>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  <li>We do not sell your personal data.</li>
                  <li>
                    We may work with trusted service providers where necessary
                    for delivery, hosting, or operations, under confidentiality
                    obligations.
                  </li>
                  <li>
                    We apply reasonable administrative, technical, and
                    organizational safeguards to protect data.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-950">
                  4. Your Rights
                </h2>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  <li>
                    You may request access to, correction of, or deletion of
                    your personal data, subject to applicable law.
                  </li>
                  <li>
                    You may contact us at{" "}
                    <a
                      href="mailto:proposals@eumanai.com"
                      className="font-medium text-gray-950 underline underline-offset-2"
                    >
                      proposals@eumanai.com
                    </a>{" "}
                    regarding privacy-related questions.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-950">
                  5. Changes to This Policy
                </h2>
                <p className="mt-3">
                  We may update this Privacy Policy from time to time. Any
                  changes will be posted on this page with the updated date.
                </p>
              </section>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <Link
                href="/policies/terms"
                className="text-sm font-medium text-gray-950 underline underline-offset-2"
              >
                See our Terms and Conditions
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
