"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";

export default function Watermark() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const dx = (e.clientX - window.innerWidth / 2) * 0.02;
      const dy = (e.clientY - window.innerHeight / 2) * 0.02;
      el.style.setProperty("--pointer-x", `${dx}px`);
      el.style.setProperty("--pointer-y", `${dy}px`);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div className="pointer-events-none w-full select-none overflow-hidden">
      <div
        ref={wrapRef}
        className="relative mx-auto w-[calc(100vw+2rem)] -mx-4 max-w-none overflow-hidden h-40 sm:h-52 md:h-64 lg:h-72 xl:h-80 2xl:h-96 opacity-[0.14]"
        style={{
          transform:
            "translate(var(--pointer-x,0), var(--pointer-y,0)) translateZ(0)",
        }}
      >
        <Image
          src="/euman_logo.png"
          alt="Euman Intelligence"
          fill
          priority={false}
          sizes="100vw"
          aria-hidden
          className="object-contain object-bottom mix-blend-multiply"
          style={{
            top: "auto",
            bottom: "-12px",
            color: "transparent",
            filter: "grayscale(1) contrast(1.7) brightness(0.42)",
          }}
        />
      </div>
    </div>
  );
}
