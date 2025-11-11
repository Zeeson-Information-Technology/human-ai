const testimonials = [
  {
    name: "Amina Bello",
    title: "PhD, Ahmadu Bello University",
    quote:
      "Euman AI opened doors for my research and consulting beyond Nigeria. The process is respectful, clear, and focused on real outcomes.",
  },
  {
    name: "Chinedu Okafor",
    title: "Senior Software Engineer, Lagos",
    quote:
      "I value how transparent the projects are and how quickly the team pays. I choose remote roles that fit my schedule and still grow my skills.",
  },
  {
    name: "Zainab Yusuf",
    title: "Data Scientist, Abuja",
    quote:
      "From screening to onboarding, it was smooth. I now work with teams building products used across Africa, and my work is fairly measured and rewarded.",
  },
  {
    name: "Kofi Mensah",
    title: "ML Engineer, Accra",
    quote:
      "Strong communication, realistic scopes, and a community that helps. It feels like a platform designed for African talent to thrive globally.",
  },
  {
    name: "Lerato M.",
    title: "NLP Researcher, University of Cape Town",
    quote:
      "Projects that respect linguistics and real-world context. I contribute in local languages and see the impact in production systems.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-neutral-900 dark:text-neutral-100">
            Hear from Euman AI talent
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900"
            >
              <p className="text-base leading-7 text-neutral-800 dark:text-neutral-200">{t.quote}</p>
              <div className="mt-5">
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">{t.name}</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{t.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
