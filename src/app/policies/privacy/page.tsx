import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Euman AI",
  description: "How Euman AI collects, uses, and protects your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4 text-gray-700">
        Euman AI (“we”, “us”, or “our”) is committed to protecting your privacy.
        This Privacy Policy explains how we collect, use, and safeguard your
        information when you use our website, platform, and AI services.
      </p>
      <h2 className="font-semibold mt-6 mb-2">1. Information We Collect</h2>
      <ul className="list-disc pl-6 text-gray-700">
        <li>
          Personal information (name, email, company, etc.) provided during
          registration or contact.
        </li>
        <li>
          Usage data, logs, and analytics from your interactions with our
          platform.
        </li>
        <li>
          Data you submit for AI processing (e.g., documents, audio, text).
        </li>
      </ul>
      <h2 className="font-semibold mt-6 mb-2">
        2. How We Use Your Information
      </h2>
      <ul className="list-disc pl-6 text-gray-700">
        <li>To provide and improve our AI services.</li>
        <li>To communicate with you about your account or requests.</li>
        <li>For research, analytics, and product development.</li>
        <li>To comply with legal obligations.</li>
      </ul>
      <h2 className="font-semibold mt-6 mb-2">3. Data Sharing & Security</h2>
      <ul className="list-disc pl-6 text-gray-700">
        <li>We do not sell your personal data.</li>
        <li>
          We may share data with trusted partners for service delivery, under
          strict confidentiality.
        </li>
        <li>We use industry-standard security to protect your data.</li>
      </ul>
      <h2 className="font-semibold mt-6 mb-2">4. Your Rights</h2>
      <ul className="list-disc pl-6 text-gray-700">
        <li>
          You may request access, correction, or deletion of your data at any
          time.
        </li>
        <li>
          Contact us at{" "}
          <a href="mailto:hello@eumanai.com" className="underline">
            hello@eumanai.com
          </a>
          .
        </li>
      </ul>
      <h2 className="font-semibold mt-6 mb-2">5. Changes</h2>
      <p className="text-gray-700">
        We may update this policy. Changes will be posted on this page.
      </p>
      <p className="mt-8 text-sm text-gray-500">Last updated: June 2024</p>
      <div className="mt-6">
        <Link href="/policies/terms" className="underline text-emerald-700">
          See our Terms of Service
        </Link>
      </div>
    </div>
  );
}
