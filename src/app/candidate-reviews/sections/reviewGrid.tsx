"use client";

const TESTIMONIALS = [
  {
    quote:
      "The process felt fair and focused on what I said—not my accent. Best interview experience I’ve had.",
    name: "Bola A.",
    role: "Data Analyst, Lagos",
  },
  {
    quote:
      "Follow-ups were sharp and relevant to my answers. I could tell the system really listened.",
    name: "Kwame N.",
    role: "ML Engineer, Accra",
  },
  {
    quote:
      "Clear scoring and instant feedback. I got matched to a role that fit my strengths.",
    name: "Zinhle M.",
    role: "Product Researcher, Cape Town",
  },
  {
    quote:
      "Scheduling was simple, and the interview took exactly the time shown. Professional end-to-end.",
    name: "Omar S.",
    role: "Software Engineer, Cairo",
  },
  {
    quote:
      "The transcripts helped me reflect on my answers and improve for the next round.",
    name: "Rashida K.",
    role: "UX Researcher, Abuja",
  },
  {
    quote:
      "I appreciated the structure—no trick questions, just the skills that matter.",
    name: "Emeka T.",
    role: "Backend Engineer, Enugu",
  },
];

function Card({ quote, name, role }: (typeof TESTIMONIALS)[number]) {
  return (
    <figure className="group relative overflow-hidden rounded-2xl border bg-white/70 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:backdrop-blur transition hover:-translate-y-0.5">
      <div className="pointer-events-none absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-cyan-400 via-emerald-400 to-slate-900 opacity-80" />
      <blockquote className="text-gray-900">“{quote}”</blockquote>
      <figcaption className="mt-3 text-sm text-gray-600">
        <span className="font-semibold text-gray-800">{name}</span> • {role}
      </figcaption>
    </figure>
  );
}

export default function ReviewsGrid() {
  return (
    <section className="border-b">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, idx) => (
            <Card key={idx} {...t} />
          ))}
        </div>
      </div>
    </section>
  );
}
