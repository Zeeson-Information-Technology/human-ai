import { Check } from "lucide-react";
import Link from "next/link";

const features = [
  "Work with top Silicon Valley companies",
  "Access unlimited educational courses",
  "Competitive & stable income",
  "Wellness and other benefit incentives",
  "Join the Euman AI experts community",
];

export default function WhyJoinUs() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-5xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Why the best talent joins Euman AI
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature} className="flex items-start">
              <Check className="h-6 w-6 flex-shrink-0 text-green-500" />
              <p className="ml-3 text-lg text-gray-700">{feature}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            href="/jobs#job-listings"
            className="rounded-xl bg-black px-6 py-3 text-white font-medium hover:opacity-90"
          >
            Get hired
          </Link>
        </div>
      </div>
    </section>
  );
}
