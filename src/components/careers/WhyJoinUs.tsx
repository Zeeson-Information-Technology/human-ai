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
            className="inline-flex items-center rounded-xl border
              justify-center rounded-2xl px-6 py-3 text-white 
              font-semibold from-emerald-600 
              via-teal-600 to-sky-600 shadow-lg 
              shadow-emerald-500/20 hover:shadow-emerald-600/30 
              hover:opacity-95 transition-transform hover:-translate-y-0.5 
              min-w-[220px] md:min-w-[260px]"
          >
            Get hired
          </Link>
        </div>
      </div>
    </section>
  );
}
