"use client";

import { useState, forwardRef } from "react";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  error?: string | null;
};

const PasswordField = forwardRef<HTMLInputElement, Props>(
  function PasswordField({ label = "Password", error, ...props }, ref) {
    const [show, setShow] = useState(false);

    return (
      <div>
        {label && (
          <label className="block text-sm font-medium mb-1">{label}</label>
        )}
        <div className="relative">
          <input
            ref={ref}
            {...props}
            type={show ? "text" : "password"}
            className={[
              "rounded-xl border p-3 pr-10 w-full",
              error ? "border-rose-500" : "",
            ].join(" ")}
            aria-invalid={!!error}
            aria-describedby={error ? `${props.name}-error` : undefined}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 right-2 my-auto h-8 w-8 grid place-items-center rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? (
              // eye-off
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M3 3l18 18"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10.6 10.6A3 3 0 0012 15a3 3 0 002.4-1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.9 5.1A10.6 10.6 0 0121 12a10.6 10.6 0 01-3.5 3.9M6.5 6.6A10.6 10.6 0 003 12a10.6 10.6 0 007.1 5.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              // eye
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
        {error && (
          <p id={`${props.name}-error`} className="mt-1 text-xs text-rose-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

export default PasswordField;
