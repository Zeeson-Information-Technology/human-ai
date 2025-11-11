"use client";
import React from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 flex items-center justify-center p-6">
          <div className="w-full max-w-lg rounded-2xl border border-red-200/70 bg-white p-6 shadow dark:border-red-500/30 dark:bg-neutral-900">
            <div className="text-lg font-semibold text-red-700 dark:text-red-300">Oops — something broke</div>
            <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
              We couldn’t render this page. Please try again. If the issue persists, contact support.
            </p>
            {error?.digest ? (
              <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">Error ID: {error.digest}</div>
            ) : null}
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                onClick={() => reset()}
              >
                Try again
              </button>
              <a href="/" className="rounded-xl border px-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800">
                Go home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

