import Footer from "@/components/footer";
import Nav from "@/components/nav";
import Link from "next/link";

export const metadata = {
  title: "Terms and Conditions - Euman Intelligence",
  description:
    "The rules and conditions for using Euman Intelligence's services.",
};

const TOC = [
  "Agreement to Terms",
  "Intellectual Property Rights",
  "User Representations",
  "User Registration",
  "Prohibited Activities",
  "User Generated Contributions",
  "Contribution License",
  "Submissions",
  "Third-Party Website and Content",
  "Site Management",
  "Privacy Policy",
  "Term and Termination",
  "Modifications and Interruptions",
  "Governing Law",
  "Dispute Resolution",
  "Corrections",
  "Disclaimer",
  "Limitations of Liability",
  "Indemnification",
  "User Data",
  "Electronic Communications, Transactions, and Signatures",
  "California Users and Residents",
  "Miscellaneous",
  "Additional Disclaimer",
  "Candidate Terms and Privacy Notice Reference",
  "Contact Us",
];

export default function TermsPage() {
  return (
    <div className="pb-12">
      <Nav />

      <section className="pt-10">
        <div className="mx-auto max-w-3xl px-4">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-gray-700">
            Policies
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Terms and Conditions
          </h1>
          <p className="mt-4 max-w-2xl text-gray-700">
            These terms govern the use of Euman Intelligence&apos;s website,
            tools, and services. By using the site, you agree to these
            conditions.
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Last updated: July 22, 2025
          </p>
        </div>
      </section>

      <section className="mt-8">
        <div className="mx-auto max-w-3xl px-4">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
                Table of Contents
              </h2>
              <ol className="mt-4 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
                {TOC.map((section, i) => (
                  <li key={section}>
                    <a
                      href={`#section${i + 1}`}
                      className="underline underline-offset-2"
                    >
                      {i + 1}. {section}
                    </a>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-8 space-y-8 text-sm leading-7 text-gray-700 sm:text-base">
              <section id="section1">
                <h2 className="text-lg font-semibold text-gray-950">
                  1. Agreement to Terms
                </h2>
                <p className="mt-3">
                  By accessing or using Euman Intelligence&apos;s website,
                  platform, or services, you agree to be bound by these Terms
                  and Conditions. If you do not agree, you must not use our
                  services.
                </p>
              </section>
              <section id="section2">
                <h2 className="text-lg font-semibold text-gray-950">
                  2. Intellectual Property Rights
                </h2>
                <p className="mt-3">
                  All content, trademarks, service marks, and intellectual
                  property on the site are owned by Euman Intelligence or its
                  licensors. You may not use, copy, or distribute any content
                  without permission.
                </p>
              </section>
              <section id="section3">
                <h2 className="text-lg font-semibold text-gray-950">
                  3. User Representations
                </h2>
                <p className="mt-3">
                  You represent that all information you provide is true and
                  accurate, and that you have the legal capacity to enter into
                  these Terms.
                </p>
              </section>
              <section id="section4">
                <h2 className="text-lg font-semibold text-gray-950">
                  4. User Registration
                </h2>
                <p className="mt-3">
                  You may be required to register for an account. You are
                  responsible for maintaining the confidentiality of your login
                  information and for all activities under your account.
                </p>
              </section>
              <section id="section5">
                <h2 className="text-lg font-semibold text-gray-950">
                  5. Prohibited Activities
                </h2>
                <p className="mt-3">
                  You agree not to misuse the site, including unauthorized
                  access, reverse engineering, scraping, or use of the site for
                  unlawful purposes.
                </p>
              </section>
              <section id="section6">
                <h2 className="text-lg font-semibold text-gray-950">
                  6. User Generated Contributions
                </h2>
                <p className="mt-3">
                  You may submit content or data. You retain ownership but grant
                  us a license to use, reproduce, and display your contributions
                  as needed to provide our services.
                </p>
              </section>
              <section id="section7">
                <h2 className="text-lg font-semibold text-gray-950">
                  7. Contribution License
                </h2>
                <p className="mt-3">
                  By submitting content, you grant Euman Intelligence a
                  worldwide, royalty-free license to use, modify, and display
                  such content in connection with the service.
                </p>
              </section>
              <section id="section8">
                <h2 className="text-lg font-semibold text-gray-950">
                  8. Submissions
                </h2>
                <p className="mt-3">
                  Any feedback, suggestions, or ideas submitted to Euman
                  Intelligence may be used without compensation or obligation to
                  you.
                </p>
              </section>
              <section id="section9">
                <h2 className="text-lg font-semibold text-gray-950">
                  9. Third-Party Website and Content
                </h2>
                <p className="mt-3">
                  The site may contain links to third-party websites or content.
                  We are not responsible for any third-party content or
                  practices.
                </p>
              </section>
              <section id="section10">
                <h2 className="text-lg font-semibold text-gray-950">
                  10. Site Management
                </h2>
                <p className="mt-3">
                  We reserve the right to monitor, manage, and restrict access
                  to the site at our discretion.
                </p>
              </section>
              <section id="section11">
                <h2 className="text-lg font-semibold text-gray-950">
                  11. Privacy Policy
                </h2>
                <p className="mt-3">
                  Please review our{" "}
                  <Link
                    href="/policies/privacy"
                    className="underline underline-offset-2"
                  >
                    Privacy Policy
                  </Link>{" "}
                  for information on how we collect, use, and protect your
                  data.
                </p>
              </section>
              <section id="section12">
                <h2 className="text-lg font-semibold text-gray-950">
                  12. Term and Termination
                </h2>
                <p className="mt-3">
                  We may suspend or terminate your access to the site or
                  services at any time for any reason, including violation of
                  these Terms.
                </p>
              </section>
              <section id="section13">
                <h2 className="text-lg font-semibold text-gray-950">
                  13. Modifications and Interruptions
                </h2>
                <p className="mt-3">
                  We reserve the right to modify, suspend, or discontinue the
                  site or services at any time without notice.
                </p>
              </section>
              <section id="section14">
                <h2 className="text-lg font-semibold text-gray-950">
                  14. Governing Law
                </h2>
                <p className="mt-3">
                  These Terms are governed by the laws of Nigeria, without
                  regard to conflict of law principles.
                </p>
              </section>
              <section id="section15">
                <h2 className="text-lg font-semibold text-gray-950">
                  15. Dispute Resolution
                </h2>
                <p className="mt-3">
                  Any disputes will be resolved through binding arbitration in
                  Lagos, Nigeria, except where prohibited by law.
                </p>
              </section>
              <section id="section16">
                <h2 className="text-lg font-semibold text-gray-950">
                  16. Corrections
                </h2>
                <p className="mt-3">
                  We reserve the right to correct any errors or omissions on the
                  site at any time.
                </p>
              </section>
              <section id="section17">
                <h2 className="text-lg font-semibold text-gray-950">
                  17. Disclaimer
                </h2>
                <p className="mt-3">
                  The site and services are provided &quot;as is&quot; and
                  &quot;as available&quot; without warranties of any kind.
                </p>
              </section>
              <section id="section18">
                <h2 className="text-lg font-semibold text-gray-950">
                  18. Limitations of Liability
                </h2>
                <p className="mt-3">
                  Euman Intelligence is not liable for any indirect, incidental,
                  or consequential damages arising from your use of the site or
                  services.
                </p>
              </section>
              <section id="section19">
                <h2 className="text-lg font-semibold text-gray-950">
                  19. Indemnification
                </h2>
                <p className="mt-3">
                  You agree to indemnify and hold Euman Intelligence harmless
                  from any claims or damages arising from your use of the site
                  or violation of these Terms.
                </p>
              </section>
              <section id="section20">
                <h2 className="text-lg font-semibold text-gray-950">
                  20. User Data
                </h2>
                <p className="mt-3">
                  You are responsible for any data you transmit or that relates
                  to your use of the site. We are not liable for any loss or
                  corruption of such data.
                </p>
              </section>
              <section id="section21">
                <h2 className="text-lg font-semibold text-gray-950">
                  21. Electronic Communications, Transactions, and Signatures
                </h2>
                <p className="mt-3">
                  By using the site, you consent to receive electronic
                  communications and agree that electronic signatures are valid
                  and binding.
                </p>
              </section>
              <section id="section22">
                <h2 className="text-lg font-semibold text-gray-950">
                  22. California Users and Residents
                </h2>
                <p className="mt-3">
                  If you are a California resident, you may have additional
                  rights under California law.
                </p>
              </section>
              <section id="section23">
                <h2 className="text-lg font-semibold text-gray-950">
                  23. Miscellaneous
                </h2>
                <p className="mt-3">
                  These Terms constitute the entire agreement between you and
                  Euman Intelligence regarding your use of the site and
                  services.
                </p>
              </section>
              <section id="section24">
                <h2 className="text-lg font-semibold text-gray-950">
                  24. Additional Disclaimer
                </h2>
                <p className="mt-3">
                  AI outputs may be inaccurate or incomplete; use at your own
                  risk. Euman Intelligence does not guarantee any specific
                  results.
                </p>
              </section>
              <section id="section25">
                <h2 className="text-lg font-semibold text-gray-950">
                  25. Candidate Terms and Privacy Notice Reference
                </h2>
                <p className="mt-3">
                  Candidates should also review our{" "}
                  <Link
                    href="/policies/privacy"
                    className="underline underline-offset-2"
                  >
                    Privacy Policy
                  </Link>{" "}
                  for information on data handling and rights.
                </p>
              </section>
              <section id="section26">
                <h2 className="text-lg font-semibold text-gray-950">
                  26. Contact Us
                </h2>
                <p className="mt-3">
                  If you have questions about these Terms, please contact us at{" "}
                  <a
                    href="mailto:proposals@eumanai.com"
                    className="underline underline-offset-2"
                  >
                    proposals@eumanai.com
                  </a>
                  .
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
