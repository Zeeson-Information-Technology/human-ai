"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();

  const [email, setEmail] = useState(params.get("email") || "");
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [success, setSuccess] = useState(false);

  // Eye logic
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    setErr(null);

    if (!password || password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setErr("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(token ? { token, password } : { email, password }),
      });
      const j = await res.json();
      if (!res.ok || !j.ok)
        throw new Error(j.error || "Failed to set password");

      // ✅ Clear sensitive inputs on success to avoid accidental resubmits
      setPassword("");
      setConfirm("");
      setShowPassword(false);
      setShowConfirm(false);

      setSuccess(true);
      setTimeout(() => {
        router.replace("/interviewer/start/login?reset=1");
      }, 2000);
    } catch (e: any) {
      setErr(e.message || "Error");
    } finally {
      setBusy(false);
    }
  }

  async function onRequestReset(e: React.FormEvent) {
    e.preventDefault();
    if (busy || requestSent) return;

    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) throw new Error("Failed to send reset email");

      // ✅ Clear the email and lock the form to prevent resending
      setRequestSent(true);
      setEmail("");
    } catch (e: any) {
      setErr(e.message || "Error");
    } finally {
      setBusy(false);
    }
  }

  if (!token) {
    // Forgot-password request UI
    return (
      <div className="max-w-md mx-auto mt-12 grid gap-4">
        <h2 className="text-xl font-bold mb-2 text-center">
          Reset your password
        </h2>
        <form onSubmit={onRequestReset} className="grid gap-3" noValidate>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            type="email"
            autoComplete="email"
            className="rounded-xl border p-3"
            required
            disabled={busy || requestSent}
          />
          <button
            type="submit"
            className="rounded-2xl px-5 py-3 font-semibold 
            text-white bg-gradient-to-r from-emerald-600 
            via-emerald-500 to-cyan-600 shadow-xl ring-1 ring-black/10 
            hover:shadow-2xl transition cursor-pointer disabled:opacity-60"
            disabled={busy || requestSent}
          >
            {busy ? "Sending…" : requestSent ? "Sent" : "Send reset link"}
          </button>
          {err && <div className="text-red-600">{err}</div>}
          {requestSent && (
            <div className="text-emerald-700" aria-live="polite" role="status">
              If your email exists, a reset link has been sent.
            </div>
          )}
        </form>
      </div>
    );
  }

  // Set-password UI (token present)
  return (
    <div className="max-w-md mx-auto mt-12 grid gap-4">
      <h2 className="text-xl font-bold mb-2 text-center">Set your password</h2>
      <form onSubmit={onSubmit} className="grid gap-3" noValidate>
        <div className="relative">
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            type={showPassword ? "text" : "password"}
            className="rounded-xl border p-3 w-full pr-12"
            required
            autoComplete="new-password"
            disabled={busy}
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            disabled={busy}
          >
            {showPassword ? (
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-5 0-9-4-9-7s4-7 9-7c1.13 0 2.21.19 3.22.54M19.07 4.93A9.97 9.97 0 0 1 21 12c0 1.61-.5 3.13-1.36 4.41M9.88 9.88a3 3 0 1 0 4.24 4.24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 3l18 18"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>

        <div className="relative">
          <input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm password"
            type={showConfirm ? "text" : "password"}
            className="rounded-xl border p-3 w-full pr-12"
            required
            autoComplete="new-password"
            disabled={busy}
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            onClick={() => setShowConfirm((v) => !v)}
            aria-label={showConfirm ? "Hide password" : "Show password"}
            disabled={busy}
          >
            {showConfirm ? (
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-5 0-9-4-9-7s4-7 9-7c1.13 0 2.21.19 3.22.54M19.07 4.93A9.97 9.97 0 0 1 21 12c0 1.61-.5 3.13-1.36 4.41M9.88 9.88a3 3 0 1 0 4.24 4.24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 3l18 18"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
          {confirm.length > 0 && (
            <div
              className={
                password && confirm && password === confirm
                  ? "mt-1 text-xs text-emerald-700"
                  : "mt-1 text-xs text-red-600"
              }
              aria-live="polite"
            >
              {password === confirm
                ? "Passwords match"
                : "Passwords do not match"}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="rounded-2xl px-5 py-3 font-semibold text-white 
          bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-600 
          shadow-xl ring-1 ring-black/10 hover:shadow-2xl transition cursor-pointer disabled:opacity-60"
          disabled={
            busy || !password || !confirm || password.length < 6 || password !== confirm
          }
        >
          {busy ? "Saving…" : "Set Password"}
        </button>

        {err && <div className="text-red-600">{err}</div>}

        {success && (
          <div
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700 text-center mt-2"
            aria-live="polite"
            role="status"
          >
            Password updated! You can now log in.
          </div>
        )}
      </form>
    </div>
  );
}
