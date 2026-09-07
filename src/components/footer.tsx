import { brand } from "@/lib/brand";
import Watermark from "@/components/Watermark";
import Image from "next/image";
import Link from "next/link";

type FooterProps = {
  variant?: "light" | "dark";
};

export default function Footer({ variant = "dark" }: FooterProps) {
  const year = new Date().getFullYear();
  const isDark = variant === "dark";

  const services = [
    { href: "/services", label: "All services" },
    { href: "/services/bid-qualification", label: "Bid qualification" },
    { href: "/services/response-development", label: "Response development" },
    { href: "/services/compliance-tracking", label: "Compliance tracking" },
    { href: "/zuri", label: "Zuri intelligence layer" },
  ];

  const company = [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/policies/privacy", label: "Privacy" },
    { href: "/careers", label: "Careers" },
  ];

  return (
    <footer
      className={`mt-16 w-full border-t ${
        isDark
          ? "border-white/10 bg-[#05070b] text-white"
          : "border-gray-200 bg-white text-gray-950"
      }`}
    >
      <div className="mx-auto w-full max-w-7xl px-4 pb-0 pt-10">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row">
          <div className="sm:-mt-4">
            <Link href="/" className="inline-flex cursor-pointer items-center">
              <Image
                src="/euman_logo.png"
                alt="Euman Intelligence"
                className="h-auto w-auto"
                width={137}
                height={32}
                priority
              />
            </Link>
            <p
              className={`mt-1 max-w-sm text-sm ${
                isDark ? "text-white/65" : "text-gray-600"
              }`}
            >
              Human judgment and AI-enabled execution for businesses navigating
              proposals, bids, and RFPs.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h3 className="font-semibold">Services</h3>
              <ul className="mt-4 space-y-2">
                {services.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={
                        isDark
                          ? "text-white/65 hover:text-white"
                          : "text-gray-700 hover:text-black"
                      }
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
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={
                        isDark
                          ? "text-white/65 hover:text-white"
                          : "text-gray-700 hover:text-black"
                      }
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
                    className={
                      isDark
                        ? "text-white/65 hover:text-white"
                        : "text-gray-700 hover:text-black"
                    }
                  >
                    Start a conversation
                  </Link>
                </li>
                <li>
                  <Link
                    href={`mailto:${brand.email}`}
                    className={
                      isDark
                        ? "text-white/65 hover:text-white"
                        : "text-gray-700 hover:text-black"
                    }
                  >
                    {brand.email}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/login"
                    className={
                      isDark
                        ? "text-white/65 hover:text-white"
                        : "text-gray-700 hover:text-black"
                    }
                  >
                    Admin login
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className={`my-6 h-px ${isDark ? "bg-white/10" : "bg-gray-200"}`} />

        <div
          className={`flex flex-col items-start justify-between gap-4 text-xs sm:flex-row sm:items-center ${
            isDark ? "text-white/55" : "text-gray-500"
          }`}
        >
          <div
            className={`flex flex-wrap items-center gap-3 ${
              isDark ? "text-white/60" : "text-gray-600"
            }`}
          >
            <p>&copy; {year} {brand.name}</p>
            <span aria-hidden="true">&bull;</span>
            <Link
              href="/policies/privacy"
              className={
                isDark
                  ? "hover:text-white hover:underline"
                  : "hover:text-gray-700 hover:underline"
              }
            >
              Privacy
            </Link>
            <span aria-hidden="true">&bull;</span>
            <Link
              href="/policies/terms"
              className={
                isDark
                  ? "hover:text-white hover:underline"
                  : "hover:text-gray-700 hover:underline"
              }
            >
              Terms
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://www.linkedin.com/company/euman-ai/?viewAsMember=true"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className={
                isDark
                  ? "text-white/55 transition hover:text-white"
                  : "text-gray-500 transition hover:text-gray-800"
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8.5h4V24h-4V8.5zm7.5 0h3.84v2.11h.05c.54-1.03 1.86-2.11 3.83-2.11 4.1 0 4.86 2.7 4.86 6.2V24h-4v-6.8c0-1.62-.03-3.7-2.26-3.7-2.26 0-2.61 1.77-2.61 3.59V24h-4V8.5z" />
              </svg>
            </a>
            <a
              href="https://x.com/AiEuman76197"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className={
                isDark
                  ? "text-white/55 transition hover:text-white"
                  : "text-gray-500 transition hover:text-gray-800"
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M18.244 2H21.5l-7.5 8.57L22.5 22h-6.18l-4.83-5.95L5.8 22H2.5l8.23-9.4L2 2h6.27l4.37 5.38L18.244 2zm-1.08 18h1.78L8.9 4H7.06l10.104 16z" />
              </svg>
            </a>
            <a
              href="https://web.facebook.com/people/Euman-AI/61582927658296/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className={
                isDark
                  ? "text-white/55 transition hover:text-white"
                  : "text-gray-500 transition hover:text-gray-800"
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M22.675 0h-21.35C.595 0 0 .595 0 1.325v21.351C0 23.405.595 24 1.325 24h11.49v-9.294H9.691V11.01h3.124V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.764v2.313h3.59l-.467 3.696h-3.123V24h6.125C23.405 24 24 23.405 24 22.676V1.325C24 .595 23.405 0 22.675 0z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className={isDark ? "border-t border-white/10" : "border-t border-gray-200"}>
        <Watermark />
      </div>
    </footer>
  );
}
