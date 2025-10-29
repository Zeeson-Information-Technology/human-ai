import React from "react";
import clsx from "clsx";
import { BRAND_FULL } from "@/lib/brand";

export function SectionCard({
  children,
  dark = false,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className={clsx(
        "w-full max-w-3xl rounded-2xl backdrop-blur p-6 shadow-sm border cursor-pointer",
        dark ? "bg-slate-900/70 border-slate-800" : "bg-white/70 border-black/5"
      )}
    >
      {children}
    </div>
  );
}

export function PrimaryButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { dark?: boolean }
) {
  const { className = "", dark = false, ...rest } = props;
  return (
    <button
      {...rest}
      className={clsx(
        "px-6 py-3 rounded-full font-medium disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 cursor-pointer ",
        dark
          ? "bg-indigo-500 hover:bg-indigo-400 text-white focus:ring-indigo-400"
          : "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-400",
        className
      )}
    />
  );
}

export function GhostButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { dark?: boolean }
) {
  const { className = "", dark = false, ...rest } = props;
  return (
    <button
      {...rest}
      className={clsx(
        "px-4 py-2 rounded-full font-medium border cursor-pointer",
        dark
          ? "border-slate-700 hover:bg-slate-800"
          : "border-black/10 hover:bg-black/5",
        className
      )}
    />
  );
}

export function HeaderBar({
  brandInitial = "Z",
  brandName = BRAND_FULL,
  onBack,
  dark = false,
}: {
  brandInitial?: string;
  brandName?: string;
  onBack?: () => void;
  dark?: boolean;
}) {
  return (
    <header className="mx-auto w-full max-w-6xl px-4 py-4 flex items-center gap-3">
      <div
        className={clsx(
          "h-9 w-9 rounded-xl grid place-content-center font-bold",
          dark ? "bg-indigo-500 text-white" : "bg-purple-700 text-white"
        )}
      >
        {brandInitial}
      </div>
      <div className="font-semibold tracking-tight">{brandName}</div>
      <div className="ml-auto cursor-pointer">
        {onBack && (
          <GhostButton dark={dark} onClick={onBack}>
            Back
          </GhostButton>
        )}
      </div>
    </header>
  );
}


