import * as React from "react";

type PremiumSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  wrapperClassName?: string;
  appearance?: "light" | "dark"; // control dropdown OS theme for clarity
};

export default function PremiumSelect({
  wrapperClassName,
  className,
  children,
  appearance = "light",
  ...props
}: PremiumSelectProps) {
  const isDark = appearance === "dark";
  const outer =
    wrapperClassName ||
    "group relative inline-block w-full rounded-2xl ring-1 ring-neutral-200 dark:ring-neutral-800 shadow-sm hover:shadow transition";
  const innerBase = isDark
    ? "relative rounded-2xl bg-neutral-900 text-white"
    : "relative rounded-2xl bg-white text-neutral-900";
  const selectCls = (
    `w-full appearance-none rounded-2xl bg-transparent border-0 px-3 py-3 pr-10 text-sm text-inherit focus:outline-none focus:ring-2 focus:ring-emerald-400/50 cursor-pointer ${
      isDark ? "[color-scheme:dark]" : "[color-scheme:light]"
    } ` + (className || "")
  ).trim();
  return (
    <div className={outer}>
      <div className={innerBase}>
        <select {...props} className={selectCls}>
          {children}
        </select>
        <svg
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
