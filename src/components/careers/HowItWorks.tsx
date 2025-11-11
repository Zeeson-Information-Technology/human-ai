import Link from "next/link";

const steps = [
  {
    step: 1,
    title: "Create your free account",
  },
  {
    step: 2,
    title: "Define your skills",
  },
  {
    step: 3,
    title: "Take AI interview",
  },
  {
    step: 4,
    title: "Apply for relevant roles",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-neutral-900 dark:text-neutral-100">
            How it works
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.step}
              className="text-center rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900"
            >
              <div className="flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white font-semibold">
                  {step.step}
                </div>
              </div>
              <h3 className="mt-4 text-base font-medium text-neutral-900 dark:text-neutral-100">
                {step.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
