"use client";
import React from "react";

export default function ErrorBanner({
  message,
  details,
  errorId,
  onRetry,
  onDismiss,
}: {
  message: string;
  details?: string;
  errorId?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl rounded-xl border border-red-200/70 bg-red-50/60 p-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="font-medium">Oops — something went wrong</div>
          <div className="mt-1">{message}</div>
          {details ? (
            <div className="mt-1 text-red-700/80 dark:text-red-200/80">{details}</div>
          ) : null}
          {errorId ? (
            <div className="mt-1 text-xs text-red-700/70 dark:text-red-300/70">Error ID: {errorId}</div>
          ) : null}
        </div>
        <div className="flex flex-shrink-0 gap-2">
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-lg bg-red-600/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
            >
              Retry
            </button>
          ) : null}
          {onDismiss ? (
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-lg border border-red-400/60 px-3 py-1.5 text-xs text-red-700 hover:bg-red-100 dark:border-red-500/40 dark:text-red-200 dark:hover:bg-red-500/20"
            >
              Dismiss
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

