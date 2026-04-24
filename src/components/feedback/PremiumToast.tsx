"use client";

export type ToastType = "success" | "error" | "info";

export default function PremiumToast({
  message,
  type = "info",
}: {
  message: string;
  type?: ToastType;
}) {
  const tone =
    type === "success"
      ? "bg-emerald-600 text-white"
      : type === "error"
        ? "bg-rose-600 text-white"
        : "bg-slate-900 text-white";

  return (
    <div
      className={`fixed top-6 left-1/2 z-[90] -translate-x-1/2 rounded-2xl px-4 py-3 text-sm font-medium shadow-lg ${tone}`}
      role="alert"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
