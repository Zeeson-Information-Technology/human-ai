import Link from "next/link";

export const metadata = {
  title: "AI Use Policy — Euman AI",
  description: "How Euman AI manages responsible and ethical use of AI.",
};

export default function AIUsePolicyPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-4">AI Use Policy</h1>
      <p className="mb-4 text-gray-700">
        Euman is committed to responsible and ethical use of AI. This policy
        outlines our principles and practices for AI development and deployment.
      </p>
      <h2 className="font-semibold mt-6 mb-2">1. Responsible AI</h2>
      <ul className="list-disc pl-6 text-gray-700">
        <li>
          We design and test our AI systems for fairness, transparency, and
          accountability.
        </li>
        <li>
          We monitor for bias and take steps to mitigate it in our data and
          models.
        </li>
        <li>
          We provide clear documentation and usage guidelines for our AI
          services.
        </li>
      </ul>
      <h2 className="font-semibold mt-6 mb-2">2. User Responsibilities</h2>
      <ul className="list-disc pl-6 text-gray-700">
        <li>
          Do not use our AI for unlawful, harmful, or discriminatory purposes.
        </li>
        <li>
          Respect privacy and confidentiality when submitting data for
          processing.
        </li>
      </ul>
      <h2 className="font-semibold mt-6 mb-2">3. Feedback & Concerns</h2>
      <ul className="list-disc pl-6 text-gray-700">
        <li>
          If you notice unexpected or unsafe AI behavior, please contact us at{" "}
          <a href="mailto:hello@eumanai.com" className="underline">
            hello@eumanai.com
          </a>
          .
        </li>
      </ul>
      <p className="mt-8 text-sm text-gray-500">Last updated: June 2024</p>
      <div className="mt-6">
        <Link href="/policies/privacy" className="underline text-emerald-700">
          See our Privacy Policy
        </Link>
      </div>
    </div>
  );
}
