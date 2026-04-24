"use client";

import PremiumToast from "@/components/feedback/PremiumToast";
import { useTimedToast } from "@/components/feedback/useTimedToast";
import PasswordField from "@/components/forms/PasswordField";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const adminAreaRoles = new Set(["admin", "company", "staff", "recruiter", "manager"]);

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast, showToast } = useTimedToast(3000);

  useEffect(() => {
    let cancelled = false;

    async function redirectIfSignedIn() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) return;

        const data = await res.json().catch(() => null);
        const role = String(data?.user?.role || data?.role || "").toLowerCase();
        if (!cancelled && adminAreaRoles.has(role)) {
          const next = params.get("next");
          router.replace(next?.startsWith("/") ? next : "/admin");
        }
      } catch {
        // Stay on the login page if the session check fails.
      }
    }

    redirectIfSignedIn();
    return () => {
      cancelled = true;
    };
  }, [params, router]);

  function validate() {
    if (!email || !password) {
      setErr("Enter your email and password.");
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

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErr(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          area: "admin",
          email,
          password,
          remember,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        const message = data?.error || "Login failed.";
        setErr(message);
        showToast(message, "error");
        return;
      }

      const role = String(data?.user?.role || "").toLowerCase();
      if (!adminAreaRoles.has(role)) {
        const message = "This login is for Euman Intelligence team access.";
        setErr(message);
        showToast(message, "error");
        return;
      }

      if (data.user.mustChangePassword) {
        router.replace(
          `/zuri/start/reset-password?email=${encodeURIComponent(data.user.email)}`
        );
        return;
      }

      const next = params.get("next");
      const destination = next?.startsWith("/") ? next : "/admin";
      showToast("Login successful. Redirecting...", "success");
      setTimeout(() => router.replace(destination), 500);
    } catch {
      setErr("Login failed.");
      showToast("Login failed.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#05070b] px-4 py-8 text-white">
      {toast ? <PremiumToast message={toast.msg} type={toast.type} /> : null}

      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(circle at 18% 14%, rgba(20,184,166,0.22), transparent 32%), radial-gradient(circle at 82% 10%, rgba(148,163,184,0.14), transparent 30%)",
        }}
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <section className="hidden lg:block">
            <Link href="/" aria-label="Back to homepage" className="inline-block">
              <Image
                src="/euman_logo.png"
                alt="Euman Intelligence"
                width={137}
                height={32}
                priority
              />
            </Link>
            <div className="mt-12 max-w-xl">
              <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                Internal access
              </div>
              <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
                Proposal operations for the Euman Intelligence team.
              </h1>
              <p className="mt-5 text-white/65">
                Admins and invited team members sign in here to manage proposal
                inquiries, opportunities, workbench tasks, participant reviews,
                and team assignments.
              </p>
            </div>
          </section>

          <section className="mx-auto w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur sm:p-8">
            <div className="mb-8 lg:hidden">
              <Link href="/" aria-label="Back to homepage" className="inline-block">
                <Image
                  src="/euman_logo.png"
                  alt="Euman Intelligence"
                  width={137}
                  height={32}
                  priority
                />
              </Link>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                Login
              </div>
              <h2 className="mt-3 text-3xl font-bold">Team access</h2>
              <p className="mt-2 text-sm leading-6 text-white/60">
                Use your admin or invited team member email.
              </p>
            </div>

            <form onSubmit={onSubmit} className="mt-7 grid gap-4">
              <label className="grid gap-2 text-sm font-medium text-white/80">
                Email address
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  type="email"
                  className="rounded-xl border border-white/10 bg-white px-3 py-3 text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/30"
                  required
                />
              </label>

              <div className="text-white/80">
                <PasswordField
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="border-white/10 bg-white text-gray-950 outline-none placeholder:text-gray-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/30"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-white/65">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 accent-emerald-500"
                />
                Remember me
              </label>

              {err ? (
                <div className="rounded-xl border border-rose-300/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-100">
                  {err}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-white px-5 py-3 font-semibold text-gray-950 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                aria-busy={loading}
              >
                {loading ? "Logging in..." : "Log in"}
              </button>
            </form>

            <div className="mt-5 flex flex-col gap-2 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/zuri/start/reset-password"
                className="underline underline-offset-4 hover:text-white"
              >
                Forgot password?
              </Link>
              <span>Need access? Ask an admin for an invite.</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
