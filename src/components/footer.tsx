// src/components/footer.tsx
import Link from "next/link";
import { brand } from "@/lib/brand";

export default function Footer() {
  const year = new Date().getFullYear();

  const primary = [
    { href: "/", label: "Home" },
    { href: "/data-engine", label: "Data Engine" },
    { href: "/whitepaper", label: "Research" },
    { href: "/contact", label: "Book a demo" },
  ];

  return (
    <footer className="mt-16 w-full border-t">
      <div className="mx-auto w-full max-w-7xl px-4 py-10">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="text-lg font-bold">{brand.name}</div>
            <p className="mt-1 text-sm text-gray-600">
              Human-in-the-loop AI for Africa’s languages &amp; enterprises.
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            {primary.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-black"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* thin line between sections */}
        <div className="my-6 h-px bg-gray-200" />

        <div className="flex flex-col items-start justify-between gap-4 text-xs text-gray-500 sm:flex-row sm:items-center">
          <p>
            © {year} {brand.name} — {brand.locations}
          </p>
          <div className="flex items-center gap-4">
            <a
              href={`mailto:${brand.email}`}
              className="hover:text-gray-700 hover:underline"
            >
              {brand.email}
            </a>
            <span aria-hidden="true">•</span>
            <Link
              href="/whitepaper"
              className="hover:text-gray-700 hover:underline"
            >
              Research
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
