// src/app/candidate-reviews/sections/ClientsCarousel.tsx
"use client";

import Image from "next/image";

const CLIENTS = [
  { name: "Acme AI", src: "/clients/acme.svg", width: 120, height: 40 },
  { name: "Kora Health", src: "/clients/kora.svg", width: 120, height: 40 },
  { name: "Atlas Bank", src: "/clients/atlas.svg", width: 120, height: 40 },
  { name: "Nimbus Cloud", src: "/clients/nimbus.svg", width: 120, height: 40 },
  { name: "Helio Labs", src: "/clients/helio.svg", width: 120, height: 40 },
  { name: "Toko Retail", src: "/clients/toko.svg", width: 120, height: 40 },
  { name: "Orbit Systems", src: "/clients/orbit.svg", width: 120, height: 40 },
  { name: "Granite", src: "/clients/granite.svg", width: 120, height: 40 },
  { name: "Lumen", src: "/clients/lumen.svg", width: 120, height: 40 },
  { name: "Apex Data", src: "/clients/apex.svg", width: 120, height: 40 },
];

function Logo({
  name,
  src,
  width = 120,
  height = 40,
}: (typeof CLIENTS)[number]) {
  return (
    <div className="flex items-center gap-3">
      {src ? (
        <Image
          src={src}
          alt={name}
          width={width}
          height={height}
          className="h-8 w-auto opacity-90 grayscale hover:grayscale-0 transition"
        />
      ) : (
        <span className="rounded-full border bg-white/70 px-3 py-1 text-sm text-gray-700 shadow-sm">
          {name}
        </span>
      )}
      {/* Visible, theme-aware text */}
      <span className="hidden sm:inline text-sm font-medium text-gray-800 dark:text-gray-200">
        {name}
      </span>
    </div>
  );
}

export default function ClientsCarousel() {
  const items = [...CLIENTS, ...CLIENTS]; // seamless loop

  return (
    <section className="border-b">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="text-center">
          <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Trusted by Africa-first teams and global enterprises
          </div>
        </div>

        {/* Marquee */}
        <div className="group relative mt-4 overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-white to-transparent dark:from-[#0a0a0a]" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-white to-transparent dark:from-[#0a0a0a]" />

          <ul
            className="
              flex w-[200%] animate-marquee items-center gap-10
              [animation-duration:28s] [animation-timing-function:linear] [animation-iteration-count:infinite]
              group-hover:[animation-play-state:paused]
            "
          >
            {items.map((c, i) => (
              <li key={`${c.name}-${i}`} className="shrink-0">
                <Logo {...c} />
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto mt-6 h-px w-40 rounded-full bg-gradient-to-r from-emerald-400/70 to-cyan-400/30" />
      </div>
    </section>
  );
}
