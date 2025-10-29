"use client";

export default function Highlights() {
  const items = [
    { h: "89%", s: "Felt the interview was fair" },
    { h: "82%", s: "Said follow-ups were relevant" },
    { h: "74%", s: "Matched to better-fit roles" },
  ];

  return (
    <section className="border-b">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {items.map((i) => (
            <div
              key={i.s}
              className="rounded-2xl border p-5 text-center shadow-sm bg-white/70 backdrop-blur supports-[backdrop-filter]:backdrop-blur"
            >
              <div className="text-2xl font-extrabold">{i.h}</div>
              <div className="mt-1 text-sm text-gray-600">{i.s}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-gray-500">
          Based on post-interview candidate surveys (rolling 90-day window).
          Indicative, not guaranteed.
        </p>
      </div>
    </section>
  );
}
