"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";

/**
 * Watermark
 * - Fixed, fullâ€‘width bottom overlay with subtle pointerâ€‘responsive motion
 * - Does not add page height; pointerâ€‘events disabled
 * - Safe for Next/Image `fill` (no height on the image itself)
 */
export default function Watermark() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      // Small parallax following the pointer; scaled down for subtlety
      const dx = (e.clientX - window.innerWidth / 2) * 0.02;
      const dy = (e.clientY - window.innerHeight / 2) * 0.02;
      el.style.setProperty("--pointer-x", `${dx}px`);
      el.style.setProperty("--pointer-y", `${dy}px`);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 select-none">
      <div
        ref={wrapRef}
        className="relative mx-auto w-[calc(100vw+2rem)] -mx-4 max-w-none overflow-hidden \
                   h-72 sm:h-96 md:h-[28rem] lg:h-[34rem] xl:h-[40rem] 2xl:h-[48rem] opacity-10"
        style={{
          transform:
            "translate(var(--pointer-x,0), var(--pointer-y,0)) translateZ(0)",
        }}
      >
        {/* Big brand image */}
        <Image
          src="/euman-logo.png"
          alt="Euman AI"
          fill
          priority={false}
          sizes="100vw"
          aria-hidden
          className="object-cover object-top"
          style={{ top: "-300px", bottom: "auto", color: "transparent" }}
        />

        {/* Subtle pointerâ€‘responsive stroke circle (desktop only) */}
        <div
          className="hidden lg:block absolute -left-[200px] -top-[150px] h-[300px] w-[300px] rounded-full"
          style={{
            backgroundImage:
              "radial-gradient(circle closest-side at 50% 50%, rgba(255,255,255,0.6), rgba(255,255,255,0))",
            transform:
              "translate(var(--pointer-x,0), var(--pointer-y,0)) translateZ(0)",
            transition: "opacity .6s ease-in-out",
            opacity: 0.6,
          }}
        />
      </div>
    </div>
  );
}

