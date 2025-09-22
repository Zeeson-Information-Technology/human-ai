"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Tiny top progress bar that animates during route transitions.
 * Shows a 2px bar and completes quickly.
 */
export default function RouteProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const timerRef = useRef<number | null>(null);

  // ✅ simple, stable dependency (no expressions in the deps array)
  const routeKey = useMemo(
    () => (pathname ? pathname.split("#")[0] : ""),
    [pathname]
  );

  useEffect(() => {
    // Start
    setActive(true);

    // Finish shortly after (fake but feels snappy)
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setActive(false);
      timerRef.current = null;
    }, 450) as unknown as number;

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [routeKey]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-0.5"
    >
      <div
        className="h-full origin-left transform bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 transition-[transform,opacity]"
        style={{
          opacity: active ? 1 : 0,
          transform: active ? "scaleX(1)" : "scaleX(0)",
        }}
      />
    </div>
  );
}
