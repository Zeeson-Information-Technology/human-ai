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
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="mx-auto max-w-5xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            How it works
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.step} className="text-center">
              <div className="flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                  {step.step}
                </div>
              </div>
              <h3 className="mt-6 text-lg font-medium">{step.title}</h3>
            </div>
          ))}
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.step} className="text-center">
              <Link
                href="#"
                className="text-black font-medium hover:underline"
              >
                {step.title}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
