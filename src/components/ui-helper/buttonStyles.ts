// src/components/ui-helper/buttonStyles.ts

/**
 * Simple classNames utility — combines truthy class strings.
 * Example: cx("p-4", condition && "bg-red-500")
 */
export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Standardized button variants to keep UI consistent across pages.
 */
export const BTN = {
  primary: cx(
    "rounded-xl px-4 py-3 font-medium text-white",
    "bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-600",
    "shadow-sm ring-1 ring-black/10 hover:opacity-95",
    "transition cursor-pointer disabled:opacity-60"
  ),

  outline: cx(
    "rounded-xl px-4 py-3 font-medium text-white",
    "border border-white/20 bg-transparent hover:bg-white/10",
    "transition cursor-pointer disabled:opacity-60"
  ),

  subtle: cx(
    "rounded-xl px-4 py-3 font-medium text-gray-800",
    "bg-white/80 hover:bg-white transition shadow-sm",
    "cursor-pointer disabled:opacity-60"
  ),

  danger: cx(
    "rounded-xl px-4 py-3 font-medium text-white",
    "bg-gradient-to-r from-rose-600 to-red-500 hover:opacity-95",
    "transition cursor-pointer disabled:opacity-60"
  ),
};
