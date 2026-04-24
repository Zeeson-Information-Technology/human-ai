"use client";

import { useState } from "react";
import { Spinner } from "@/components/spinner";

type Status = "idle" | "sending" | "sent" | "error";

export default function CTA() {
  const [status, setStatus] = useState<Status>("idle");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") || "").trim(),
      email: String(form.get("email") || "").trim(),
      company: String(form.get("company") || "").trim(),
      message: String(form.get("message") || "").trim(),
      website: String(form.get("website") || ""),
    };

    if (payload.website) return;

    if (
      !payload.name ||
      !payload.email ||
      !payload.company ||
      payload.message.length < 10
    ) {
      setErr("Please fill all fields (message must be at least 10 characters).");
      return;
    }

    try {
      setStatus("sending");
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("sent");
      (e.target as HTMLFormElement).reset();
    } catch {
      setStatus("error");
      setErr("Could not send. Please try again.");
    }
  }

  const disabled = status === "sending";

  return (
    <div className="rounded-2xl border bg-white/60 p-6 shadow-sm backdrop-blur">
      <h3 className="text-lg font-semibold">Request proposal support</h3>
      <p className="mt-1 text-sm text-gray-600">
        Share the opportunity, the timeline, and the context. We will review it
        and recommend the most effective way to move the response ahead.
      </p>

      <form onSubmit={onSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          name="name"
          placeholder="Your name"
          className="rounded-xl border p-3"
          required
          disabled={disabled}
        />
        <input
          name="email"
          type="email"
          placeholder="Work email"
          className="rounded-xl border p-3"
          required
          disabled={disabled}
        />
        <input
          name="company"
          placeholder="Company"
          className="rounded-xl border p-3 sm:col-span-2"
          required
          disabled={disabled}
        />
        <textarea
          name="message"
          placeholder="Describe the opportunity, deadline, internal challenges, and any review, compliance, or SME coordination needs."
          className="min-h-[110px] rounded-xl border p-3 sm:col-span-2"
          required
          disabled={disabled}
        />
        <input
          name="website"
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />

        <button
          type="submit"
          disabled={disabled}
          aria-busy={disabled}
          className={[
            "group relative inline-flex items-center justify-center gap-2 sm:col-span-2",
            "rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-600 px-5 py-3 text-sm font-semibold text-white",
            "shadow-xl ring-1 ring-black/10 transition hover:shadow-2xl",
            "cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-60",
          ].join(" ")}
        >
          {disabled ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <svg
              className="h-4 w-4 opacity-90"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M10.894 2.553a1 1 0 0 0-1.788 0l-7 14A1 1 0 0 0 3 18h14a1 1 0 0 0 .894-1.447l-7-14Z" />
            </svg>
          )}
          {disabled ? "Sending..." : "Send request"}
        </button>

        <div className="sm:col-span-2" aria-live="polite">
          {status === "sent" && (
            <p className="mt-2 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              <svg
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M16.704 5.29a1 1 0 0 0-1.408-1.42L7.5 11.08 4.7 8.29a1 1 0 1 0-1.4 1.42l3.5 3.5a1 1 0 0 0 1.42 0l8.484-8.92Z" />
              </svg>
              Thanks. We will reply within 24 hours.
            </p>
          )}
          {(status === "error" || err) && (
            <p className="mt-2 inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              <svg
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M10 3.5a1 1 0 0 1 .894.553l6 12A1 1 0 0 1 16 17.5H4a1 1 0 0 1-.894-1.447l6-12A1 1 0 0 1 10 3.5Zm0 4a1 1 0 0 0-1 1v3.5a1 1 0 1 0 2 0V8.5a1 1 0 0 0-1-1Zm0 7a1.25 1.25 0 1 0 0 2.5A1.25 1.25 0 0 0 10 14.5Z" />
              </svg>
              {err ?? "Something went wrong."}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
