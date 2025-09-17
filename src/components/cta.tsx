// src/components/cta.tsx
"use client";

import { useState } from "react";

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
      website: String(form.get("website") || ""), // honeypot
    };

    if (payload.website) return; // bot caught

    if (
      !payload.name ||
      !payload.email ||
      !payload.company ||
      payload.message.length < 10
    ) {
      setErr("Please fill all fields (message ≥ 10 chars).");
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

  return (
    <div className="rounded-2xl border bg-white/60 p-6 shadow-sm backdrop-blur">
      <h3 className="text-lg font-semibold">Request a pilot / consultation</h3>
      <p className="mt-1 text-sm text-gray-600">
        Enterprise-focused. We’ll sign NDA and scope a 1–2 week pilot with clear
        success metrics.
      </p>

      <form onSubmit={onSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          name="name"
          placeholder="Your name"
          className="rounded-xl border p-3"
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Work email"
          className="rounded-xl border p-3"
          required
        />
        <input
          name="company"
          placeholder="Company"
          className="rounded-xl border p-3 sm:col-span-2"
          required
        />
        <textarea
          name="message"
          placeholder="Project needs (e.g., LLM eval in Hausa, KYC OCR, ASR accent coverage)"
          className="min-h-[110px] rounded-xl border p-3 sm:col-span-2"
          required
        />
        {/* Honeypot */}
        <input
          name="website"
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />

        <button
          type="submit"
          disabled={status === "sending"}
          aria-busy={status === "sending"}
          className="sm:col-span-2 rounded-xl bg-black px-4 py-3 font-medium text-white transition
                     hover:opacity-90 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {status === "sending" ? "Sending…" : "Send request"}
        </button>

        {status === "sent" && (
          <p className="sm:col-span-2 text-sm text-green-600">
            Thanks! We’ll reply within 24 hours.
          </p>
        )}
        {(status === "error" || err) && (
          <p className="sm:col-span-2 text-sm text-red-600">
            {err ?? "Something went wrong."}
          </p>
        )}
      </form>
    </div>
  );
}
