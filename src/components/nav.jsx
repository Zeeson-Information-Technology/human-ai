import Link from "next/link";
import SolutionsDropdown from "./solutions-dropdown";

export default function Nav() {
  return (
    <header className="sticky top-4 z-50">
      <div className="mx-auto max-w-5xl px-4">
        <div
          className={[
            "flex h-12 items-center justify-between rounded-2xl px-4 md:px-5",
            "border border-white/30 bg-[#0000004d]",
            "backdrop-blur-md supports-[backdrop-filter]:backdrop-blur-md",
            "shadow-[0_8px_30px_rgba(0,0,0,0.25)] ring-1 ring-white/10",
          ].join(" ")}
          aria-label="Primary navigation"
        >
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 text-white"
            aria-label="Equatoria — Home"
          >
            <span className="text-base font-extrabold tracking-tight">
              Equatoria
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link
              href="/data-engine"
              className="text-white/85 hover:text-white"
            >
              Data Engine
            </Link>

            {/* Solutions mega dropdown */}
            <div className="group relative">
              <div
                tabIndex={0}
                className="flex cursor-pointer select-none items-center gap-1 text-white/85 outline-none hover:text-white focus:text-white"
              >
                <span>Solutions</span>
                <svg
                  className="h-3 w-3 transition-transform duration-200 group-focus:-rotate-180 group-hover:-rotate-180"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z" />
                </svg>
              </div>

              {/* Panel container (visibility controlled by hover/focus) */}
              <div
                className={[
                  "invisible absolute right-0 top-full mt-3 w-[720px] translate-y-1 opacity-0",
                  "rounded-2xl border border-white/15 bg-[#0b0b0fe6] p-4",
                  "backdrop-blur-xl shadow-2xl ring-1 ring-white/10",
                  "transition-all duration-150 ease-out",
                  "group-hover:visible group-hover:translate-y-0 group-hover:opacity-100",
                  "group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100",
                ].join(" ")}
              >
                <SolutionsDropdown />
              </div>
            </div>

            <Link href="/whitepaper" className="text-white/85 hover:text-white">
              Research
            </Link>
            <Link
              href="/contact"
              className="rounded-lg bg-white px-3 py-2 font-medium text-slate-900 hover:bg-slate-100"
            >
              Book a demo
            </Link>
          </nav>

          {/* Mobile CTA (simple for now) */}
          <div className="md:hidden">
            <Link
              href="/contact"
              className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-900"
            >
              Demo
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
