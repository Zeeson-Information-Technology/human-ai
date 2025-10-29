"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/logo";
import PasswordField from "@/components/forms/PasswordField";

function PremiumToast({
  message,
  type,
}: {
  message: string;
  type: "success" | "error";
}) {
  return (
    <div
      className={`fixed top-6 left-1/2 z-50 -translate-x-1/2 rounded-xl px-4 py-3 shadow-lg text-sm font-medium ${
        type === "success"
          ? "bg-emerald-600 text-white"
          : "bg-rose-600 text-white"
      }`}
      role="alert"
      aria-live="polite"
    >
      {message}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();

  const [role, setRole] = useState<"admin" | "company" | "talent">("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  // Use ReturnType to avoid Node/browser typing mismatch in Next.js
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const r = params.get("role");
    // Accept admin/company/talent for clarity
    if (r === "admin" || r === "company" || r === "talent") setRole(r);
    // fallback for legacy "client" param
    else if (r === "client") setRole("admin");
    return () => {
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
    };
  }, [params]);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToast(null), 3000);
  }

  function validate() {
    if (!email || !password) {
      setErr("Please fill all required fields.");
      return false;
    }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      setErr("Enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return false;
    }
    setErr(null);
    return true;
  }

  function resolveRedirectPath(userRole: string | undefined | null) {
    const r = (userRole || "").toLowerCase();
    if (
      r === "admin" ||
      r === "company" ||
      r === "recruiter" ||
      r === "manager"
    ) {
      return "/admin";
    }
    // anything else, treat as talent (viewer/candidate)
    return "/talent";
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, email, password }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // ignore parse errors (e.g., empty body on 200)
      }

      if (res.ok && data.ok) {
        if (data.user.mustChangePassword) {
          router.replace(
            `/zuri/start/reset-password?email=${encodeURIComponent(
              data.user.email
            )}`
          );
          return;
        }

        // Best-effort: prefer backend-reported role; else try /api/auth/me; else fallback to selected tab.
        let userRole: string | undefined =
          data?.user?.role || data?.role || undefined;

        if (!userRole) {
          try {
            const meRes = await fetch("/api/auth/me", { cache: "no-store" });
            if (meRes.ok) {
              const me = await meRes.json().catch(() => null);
              userRole = me?.user?.role || me?.role;
            }
          } catch {
            // ignore
          }
        }

        // --- FIX: fallback must NOT use "client" ---
        if (!userRole) {
          // fallback: UI tab (admin/company -> admin; talent -> talent)
          userRole = role === "talent" ? "talent" : "admin";
        }

        const dest = resolveRedirectPath(userRole);

        // Optional: honor a ?next=/path param if present
        const next = params.get("next");
        const finalDest = next && next.startsWith("/") ? next : dest;

        showToast("Login successful! Redirecting...", "success");
        setTimeout(() => {
          router.replace(finalDest);
        }, 900);
        return;
      } else {
        setErr(data?.error || "Login failed");
        showToast(data?.error || "Login failed", "error");
      }
    } catch {
      setErr("Login failed");
      showToast("Login failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="absolute top-4 left-4">
        <Link href="/" aria-label="Back to homepage">
          <Logo />
        </Link>
      </header>
      <div className="max-w-md mx-auto mt-12 grid gap-4">
        {toast && <PremiumToast message={toast.msg} type={toast.type} />}
        {/* Toggle between Company/Admin and Talent */}
        <div className="flex gap-2 mb-2 justify-center">
          <button
            type="button"
            className={`rounded-full px-4 py-2 font-medium border cursor-pointer ${
              role === "admin" || role === "company"
                ? "bg-black text-white border-black"
                : "bg-white text-gray-800 border-gray-300"
            }`}
            onClick={() => setRole("admin")}
          >
            Admin / Company
          </button>
          <button
            type="button"
            className={`rounded-full px-4 py-2 font-medium border cursor-pointer ${
              role === "talent"
                ? "bg-black text-white border-black"
                : "bg-white text-gray-800 border-gray-300"
            }`}
            onClick={() => setRole("talent")}
          >
            Talent
          </button>
        </div>
        <h2 className="text-xl font-bold mb-2 text-center">
          {role === "talent" ? "Talent Login" : "Admin / Company Login"}
        </h2>
        <form onSubmit={onSubmit} className="grid gap-3">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={
              role === "talent"
                ? "Your email address"
                : "Your company/admin email address"
            }
            type="email"
            className="rounded-xl border p-3"
            required
          />
          <PasswordField
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button
            type="submit"
            className={[
              "rounded-2xl px-5 py-3 font-semibold text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-600 shadow-xl ring-1 ring-black/10 hover:shadow-2xl transition focus:outline-none focus:ring-2 focus:ring-emerald-400",
              "disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer",
            ].join(" ")}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="opacity-25"
                  />
                  <path
                    className="opacity-90"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z"
                  />
                </svg>
                Logging in…
              </span>
            ) : (
              "Log in"
            )}
          </button>
          {err && <div className="text-red-600">{err}</div>}
        </form>
        <div className="mt-2 text-sm text-gray-600 text-center">
          <Link
            href={`/zuri/start/reset-password`}
            className="underline cursor-pointer"
          >
            Forgot password?
          </Link>
        </div>
        <div className="mt-2 text-sm text-gray-600 text-center">
          New here?{" "}
          <Link
            href={`/zuri/start/register?role=${role}`}
            className="underline cursor-pointer"
          >
            {role === "talent"
              ? "Register as Talent"
              : "Register as Admin/Company"}
          </Link>
        </div>
      </div>
    </>
  );
}
