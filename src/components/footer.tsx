// src/components/footer.tsx
import Link from "next/link";
import Image from "next/image";
import { brand } from "@/lib/brand";

export default function Footer() {
  const year = new Date().getFullYear();

  const products = [
    { href: "/data-engine", label: "Data Engine" },
    { href: "/zuri", label: "Zuri" },
    { href: "/human-data", label: "Human data" },
    // { href: "/ai-recruiter", label: "AI Recruiter" },
  ];

  const services = [
    { href: "/solutions/african-languages", label: "African languages" },
    { href: "/solutions/health", label: "Healthcare" },
    { href: "/solutions/financial-services", label: "Financial services" },
    { href: "/solutions/telecom", label: "Telecom" },
  ];

  const company = [
    { href: "/whitepaper", label: "Research" },
    { href: "/case-studies", label: "Case studies" },
    // { href: "/forum", label: "Forum" },
    { href: "/candidate-reviews", label: "Candidate reviews" },
    { href: "/jobs", label: "Careers" },
  ];

  const resources = [
    { href: "/whitepaper", label: "Approach & research" },
    { href: "/case-studies", label: "Case studies" },
    { href: "/candidate-reviews", label: "Candidate reviews" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <footer className="mt-16 w-full border-t">
      <div className="mx-auto w-full max-w-7xl px-4 py-10">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row">
          <div className="sm:-mt-4">
            <Image
              src="/euman-logo.png"
              alt="Euman AI"
              className="h-auto w-auto"
              width={137}
              height={32}
              priority
            />
            <p className="mt-1 text-sm text-gray-600">
              Human-in-the-loop AI for Africa’s languages &amp; enterprises.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <div>
              <h3 className="font-semibold">Products</h3>
              <ul className="mt-4 space-y-2">
                {products.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-700 hover:text-black"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Services</h3>
              <ul className="mt-4 space-y-2">
                {services.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-700 hover:text-black"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Company</h3>
              <ul className="mt-4 space-y-2">
                {company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-700 hover:text-black"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">Support</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-700 hover:text-black"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href={`mailto:${brand.email}`}
                    className="text-gray-700 hover:text-black"
                  >
                    {brand.email}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* thin line between sections */}
        <div className="my-6 h-px bg-gray-200" />

        <div className="flex flex-col items-start justify-between gap-4 text-xs text-gray-500 sm:flex-row sm:items-center">
          <p>
            © {year} {brand.name} — {brand.locations}
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/policies/privacy"
              className="hover:text-gray-700 hover:underline"
            >
              Privacy
            </Link>
            <span aria-hidden="true">•</span>
            <Link
              href="/policies/terms"
              className="hover:text-gray-700 hover:underline"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
