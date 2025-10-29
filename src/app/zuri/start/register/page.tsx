"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/logo";
import PasswordField from "@/components/forms/PasswordField";
import IntlPhoneInput from "@/components/forms/IntlPhoneInput";

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

export default function RegisterPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [role, setRole] = useState<"client" | "talent">("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [phone, setPhone] = useState("");
  const digits = (s: string) => s.replace(/\D+/g, "");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const r = params.get("role");
    if (r === "client" || r === "talent") setRole(r);
  }, [params]);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToast(null), 3000);
  }

  function validate() {
    if (!email || !password || !name || (role === "client" && !company)) {
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
    if (name.length < 2) {
      setErr("Enter your full name.");
      return false;
    }
    if (role === "client" && company.length < 2) {
      setErr("Enter your company name.");
      return false;
    }
    if (!phone || digits(phone).length < 6) {
      setErr("Enter a valid phone number.");
      return false;
    }
    setErr(null);
    return true;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErr(null);
    try {
      const payload: any = {
        role,
        email,
        password,
        name,
        company,
        phone,
      };
      if (role === "talent") payload.linkedin = linkedin;
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        showToast(
          "Registration successful! Check your email for a 6-digit code.",
          "success"
        );
        setTimeout(() => {
          router.replace(
            `/zuri/start/verify?email=${encodeURIComponent(email)}`
          );
        }, 1200);
      } else {
        setErr(data?.error || "Registration failed");
        showToast(data?.error || "Registration failed", "error");
      }
    } catch {
      setErr("Registration failed");
      showToast("Registration failed", "error");
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
      {/* Toggle between Company and Talent */}
      <div className="flex gap-2 mb-2 justify-center">
        <button
          type="button"
          className={`rounded-full px-4 py-2 font-medium border cursor-pointer ${
            role === "client"
              ? "bg-black text-white border-black"
              : "bg-white text-gray-800 border-gray-300"
          }`}
          onClick={() => setRole("client")}
        >
          Company
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
        {role === "client" ? "Company Registration" : "Talent Registration"}
      </h2>
      <form onSubmit={onSubmit} className="grid gap-3">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={
            role === "client"
              ? "Your company email address"
              : "Your email address"
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
          // label="Password" // optional, you already imply with placeholder
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
          className="rounded-xl border p-3"
          required
        />
        <IntlPhoneInput value={phone} onChange={setPhone} />
        {role === "client" && (
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company Name"
            className="rounded-xl border p-3"
            required
          />
        )}
        {role === "talent" && (
          <input
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            placeholder="LinkedIn profile URL"
            className="rounded-xl border p-3"
            type="url"
            required
          />
        )}
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
              Registering…
            </span>
          ) : (
            "Register"
          )}
        </button>
        {err && <div className="text-red-600">{err}</div>}
        <div className="flex justify-center items-center mt-2">
          <div className="text-xs text-gray-600 text-center">
            By registering, you agree to our{" "}
            <Link
              href="/policies/terms"
              className="underline cursor-pointer text-blue-600 hover:text-blue-800 transition-colors"
              target="_blank"
            >
              Terms of Service
            </Link>
            , and{" "}
            <Link
              href="/policies/privacy"
              className="underline cursor-pointer text-blue-600 hover:text-blue-800 transition-colors"
              target="_blank"
            >
              Privacy Policy
            </Link>
            .
          </div>
        </div>
      </form>
      <div className="mt-2 text-sm text-gray-600 text-center">
        Already have an account?{" "}
        <Link
          href={`/zuri/start/login?role=${role}`}
          className="underline cursor-pointer"
        >
          {role === "client" ? "Company Login" : "Talent Login"}
        </Link>
      </div>
    </div>
    </>
  );
}
