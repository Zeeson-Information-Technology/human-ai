// /src/components/hash-scroll.tsx
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function scrollToHash(hash: string) {
  const id = hash.replace(/^#/, "");
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) return;
  // account for fixed nav using scroll-margin in CSS, but still smooth scroll:
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function HashScroll() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // On mount / whenever route/search changes, scroll to hash if present
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash) scrollToHash(window.location.hash);
  }, [pathname, searchParams]);

  // Also handle in-page hash changes (e.g., clicking TOC links)
  useEffect(() => {
    const onHashChange = () => scrollToHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return null;
}
