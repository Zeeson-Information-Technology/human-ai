import Link from "next/link";

export const metadata = {
  title: "Terms and Conditions — Equatoria",
  description: "The rules and conditions for using Equatoria's services.",
};

const TOC = [
  "AGREEMENT TO TERMS",
  "INTELLECTUAL PROPERTY RIGHTS",
  "USER REPRESENTATIONS",
  "USER REGISTRATION",
  "PROHIBITED ACTIVITIES",
  "USER GENERATED CONTRIBUTIONS",
  "CONTRIBUTION LICENSE",
  "SUBMISSIONS",
  "THIRD-PARTY WEBSITE AND CONTENT",
  "SITE MANAGEMENT",
  "PRIVACY POLICY",
  "TERM AND TERMINATION",
  "MODIFICATIONS AND INTERRUPTIONS",
  "GOVERNING LAW",
  "DISPUTE RESOLUTION",
  "CORRECTIONS",
  "DISCLAIMER",
  "LIMITATIONS OF LIABILITY",
  "INDEMNIFICATION",
  "USER DATA",
  "ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES",
  "CALIFORNIA USERS AND RESIDENTS",
  "MISCELLANEOUS",
  "ADDITIONAL DISCLAIMER",
  "CANDIDATE TERMS AND PRIVACY NOTICE REFERENCE",
  "CONTACT US",
];

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-4">Terms and Conditions</h1>
      <div className="mb-2 text-xs text-gray-500">Last updated July 22, 2025</div>
      <div className="mb-6">
        <strong>TABLE OF CONTENTS</strong>
        <ol className="list-decimal pl-6 mt-2 text-sm text-gray-700 space-y-1">
          {TOC.map((section, i) => (
            <li key={section}>
              <a href={`#section${i + 1}`} className="underline text-emerald-700">{section}</a>
            </li>
          ))}
        </ol>
      </div>
      <div className="space-y-6 text-gray-700 text-sm">
        <section id="section1">
          <h2 className="font-semibold mt-4 mb-2">1. AGREEMENT TO TERMS</h2>
          <p>
            By accessing or using Equatoria’s website, platform, or services, you agree to be bound by these Terms and Conditions. If you do not agree, you must not use our services.
          </p>
        </section>
        <section id="section2">
          <h2 className="font-semibold mt-4 mb-2">2. INTELLECTUAL PROPERTY RIGHTS</h2>
          <p>
            All content, trademarks, service marks, and intellectual property on the site are owned by Equatoria or its licensors. You may not use, copy, or distribute any content without permission.
          </p>
        </section>
        <section id="section3">
          <h2 className="font-semibold mt-4 mb-2">3. USER REPRESENTATIONS</h2>
          <p>
            You represent that all information you provide is true and accurate, and that you have the legal capacity to enter into these Terms.
          </p>
        </section>
        <section id="section4">
          <h2 className="font-semibold mt-4 mb-2">4. USER REGISTRATION</h2>
          <p>
            You may be required to register for an account. You are responsible for maintaining the confidentiality of your login information and for all activities under your account.
          </p>
        </section>
        <section id="section5">
          <h2 className="font-semibold mt-4 mb-2">5. PROHIBITED ACTIVITIES</h2>
          <p>
            You agree not to misuse the site, including but not limited to: unauthorized access, reverse engineering, scraping, or using the site for unlawful purposes.
          </p>
        </section>
        <section id="section6">
          <h2 className="font-semibold mt-4 mb-2">6. USER GENERATED CONTRIBUTIONS</h2>
          <p>
            You may submit content or data. You retain ownership but grant us a license to use, reproduce, and display your contributions as needed to provide our services.
          </p>
        </section>
        <section id="section7">
          <h2 className="font-semibold mt-4 mb-2">7. CONTRIBUTION LICENSE</h2>
          <p>
            By submitting content, you grant Equatoria a worldwide, royalty-free license to use, modify, and display such content in connection with the service.
          </p>
        </section>
        <section id="section8">
          <h2 className="font-semibold mt-4 mb-2">8. SUBMISSIONS</h2>
          <p>
            Any feedback, suggestions, or ideas submitted to Equatoria may be used without compensation or obligation to you.
          </p>
        </section>
        <section id="section9">
          <h2 className="font-semibold mt-4 mb-2">9. THIRD-PARTY WEBSITE AND CONTENT</h2>
          <p>
            The site may contain links to third-party websites or content. We are not responsible for any third-party content or practices.
          </p>
        </section>
        <section id="section10">
          <h2 className="font-semibold mt-4 mb-2">10. SITE MANAGEMENT</h2>
          <p>
            We reserve the right to monitor, manage, and restrict access to the site at our discretion.
          </p>
        </section>
        <section id="section11">
          <h2 className="font-semibold mt-4 mb-2">11. PRIVACY POLICY</h2>
          <p>
            Please review our <Link href="/policies/privacy" className="underline text-emerald-700">Privacy Policy</Link> for information on how we collect, use, and protect your data.
          </p>
        </section>
        <section id="section12">
          <h2 className="font-semibold mt-4 mb-2">12. TERM AND TERMINATION</h2>
          <p>
            We may suspend or terminate your access to the site or services at any time for any reason, including violation of these Terms.
          </p>
        </section>
        <section id="section13">
          <h2 className="font-semibold mt-4 mb-2">13. MODIFICATIONS AND INTERRUPTIONS</h2>
          <p>
            We reserve the right to modify, suspend, or discontinue the site or services at any time without notice.
          </p>
        </section>
        <section id="section14">
          <h2 className="font-semibold mt-4 mb-2">14. GOVERNING LAW</h2>
          <p>
            These Terms are governed by the laws of Nigeria, without regard to conflict of law principles.
          </p>
        </section>
        <section id="section15">
          <h2 className="font-semibold mt-4 mb-2">15. DISPUTE RESOLUTION</h2>
          <p>
            Any disputes will be resolved through binding arbitration in Lagos, Nigeria, except where prohibited by law.
          </p>
        </section>
        <section id="section16">
          <h2 className="font-semibold mt-4 mb-2">16. CORRECTIONS</h2>
          <p>
            We reserve the right to correct any errors or omissions on the site at any time.
          </p>
        </section>
        <section id="section17">
          <h2 className="font-semibold mt-4 mb-2">17. DISCLAIMER</h2>
          <p>
            The site and services are provided “as is” and “as available” without warranties of any kind.
          </p>
        </section>
        <section id="section18">
          <h2 className="font-semibold mt-4 mb-2">18. LIMITATIONS OF LIABILITY</h2>
          <p>
            Equatoria is not liable for any indirect, incidental, or consequential damages arising from your use of the site or services.
          </p>
        </section>
        <section id="section19">
          <h2 className="font-semibold mt-4 mb-2">19. INDEMNIFICATION</h2>
          <p>
            You agree to indemnify and hold Equatoria harmless from any claims or damages arising from your use of the site or violation of these Terms.
          </p>
        </section>
        <section id="section20">
          <h2 className="font-semibold mt-4 mb-2">20. USER DATA</h2>
          <p>
            You are responsible for any data you transmit or that relates to your use of the site. We are not liable for any loss or corruption of such data.
          </p>
        </section>
        <section id="section21">
          <h2 className="font-semibold mt-4 mb-2">21. ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES</h2>
          <p>
            By using the site, you consent to receive electronic communications and agree that electronic signatures are valid and binding.
          </p>
        </section>
        <section id="section22">
          <h2 className="font-semibold mt-4 mb-2">22. CALIFORNIA USERS AND RESIDENTS</h2>
          <p>
            If you are a California resident, you may have additional rights under California law.
          </p>
        </section>
        <section id="section23">
          <h2 className="font-semibold mt-4 mb-2">23. MISCELLANEOUS</h2>
          <p>
            These Terms constitute the entire agreement between you and Equatoria regarding your use of the site and services.
          </p>
        </section>
        <section id="section24">
          <h2 className="font-semibold mt-4 mb-2">24. ADDITIONAL DISCLAIMER</h2>
          <p>
            AI outputs may be inaccurate or incomplete; use at your own risk. Equatoria does not guarantee any specific results.
          </p>
        </section>
        <section id="section25">
          <h2 className="font-semibold mt-4 mb-2">25. CANDIDATE TERMS AND PRIVACY NOTICE REFERENCE</h2>
          <p>
            Candidates should also review our <Link href="/policies/privacy" className="underline text-emerald-700">Privacy Policy</Link> for information on data handling and rights.
          </p>
        </section>
        <section id="section26">
          <h2 className="font-semibold mt-4 mb-2">26. CONTACT US</h2>
          <p>
            If you have questions about these Terms, please contact us at <a href="mailto:hello@equatoria.ai" className="underline">hello@equatoria.ai</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
