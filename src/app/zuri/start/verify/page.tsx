"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyPage() {
  const router = useRouter();
  const params = useSearchParams();

  // normalize the email param
  const emailParam = params.get("email") || "";
  const email = useMemo(() => emailParam.trim().toLowerCase(), [emailParam]);

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // optional resend cooldown
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!cooldown) return;
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [cooldown]);

  // if email is missing, bounce to register
  useEffect(() => {
    if (!email) {
      router.replace("/zuri/start/register");
    }
  }, [email, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (code.length !== 6) {
      setErr("Enter the 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email, // normalized
          code: code.trim(), // already digits only
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setSuccess(true);
        setTimeout(() => router.replace("/zuri/start/login"), 1200);
      } else {
        setErr(data?.error || "Invalid or expired code");
      }
    } catch {
      setErr("Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    if (!email || cooldown) return;
    setErr(null);
    try {
      // implement this API on your side to (re)generate+email a code
      const r = await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) {
        setErr(j?.error || "Could not resend code.");
        return;
      }
      setCooldown(30); // 30s cooldown before next resend
    } catch {
      setErr("Could not resend code.");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 grid gap-4">
      <h2 className="text-xl font-bold mb-2 text-center">Verify your email</h2>
      <p className="text-center text-gray-600 mb-2">
        We sent a 6-digit code to <span className="font-mono">{email}</span>.
        <br />
        Enter it below to activate your account.
      </p>
      <form onSubmit={onSubmit} className="grid gap-3">
        <input
          value={code}
          onChange={(e) =>
            setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          placeholder="6-digit code"
          className="rounded-xl border p-3 text-center tracking-widest text-lg font-mono"
          required
          maxLength={6}
          minLength={6}
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          disabled={loading || success}
        />
        <button
          type="submit"
          className="rounded-2xl px-5 py-3 font-semibold text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-600 shadow-xl ring-1 ring-black/10 hover:shadow-2xl transition focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          disabled={loading || code.length !== 6 || success}
          aria-busy={loading}
        >
          {loading ? "Verifying…" : "Verify"}
        </button>

        {/* Resend */}
        <div className="text-center text-sm">
          Didn’t get a code?{" "}
          <button
            type="button"
            onClick={resend}
            disabled={!email || !!cooldown || loading || success}
            className="underline cursor-pointer disabled:opacity-60"
          >
            Resend {cooldown ? `(${cooldown}s)` : ""}
          </button>
        </div>

        {err && <div className="text-red-600 text-center">{err}</div>}
        {success && (
          <div className="text-emerald-700 text-center">
            Verified! Redirecting to login…
          </div>
        )}
      </form>
    </div>
  );
}
