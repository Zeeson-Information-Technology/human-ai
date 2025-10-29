"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const LANGS = [
  { code: "en", label: "English" },
  { code: "yo", label: "Yorùbá" },
  { code: "ha", label: "Hausa" },
  { code: "ig", label: "Igbo" },
  { code: "pcm", label: "Pidgin" },
];

export default function InterviewCandidateStartPage() {
  const params = useSearchParams();
  const codeFromUrl = (params?.get("job") || "").toUpperCase();
  const invitedEmail = (params?.get("e") || "").toLowerCase();
  const inviteToken = params?.get("i") || "";

  const [code, setCode] = useState(codeFromUrl);
  const [language, setLanguage] = useState("en");
  const [name, setName] = useState("");
  const [email, setEmail] = useState(invitedEmail);
  const [phone, setPhone] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [job, setJob] = useState<any>(null);

  const progress = 0.66; // Step 2 of 3

  const emailMismatch = useMemo(
    () => Boolean(invitedEmail) && email.toLowerCase() !== invitedEmail,
    [email, invitedEmail]
  );

  useEffect(() => {
    setCode(codeFromUrl);
  }, [codeFromUrl]);

  // Load job to constrain language options
  useEffect(() => {
    let alive = true;
    async function loadJob() {
      if (!code) {
        if (alive) setJob(null);
        return;
      }
      try {
        const res = await fetch(`/api/zuri/jobs/${code}`);
        const j = await res.json();
        if (alive) {
          if (res.ok && j.ok) {
            setJob(j.job);
            const langs: string[] = j.job.languages || [];
            if (langs.length) setLanguage(langs[0]);
          } else {
            setJob(null);
          }
        }
      } catch {
        if (alive) setJob(null);
      }
    }
    loadJob();
    return () => {
      alive = false;
    };
  }, [code]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setErr("Email is required.");
      return;
    }
    if (emailMismatch) {
      setErr("Please use the same email address that received the invite.");
      return;
    }

    setBusy(true);
    setErr(null);
    try {
      let uploaded: { url?: string } | undefined;
      if (resume) {
        const signRes = await fetch("/api/cloudinary/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder: "equatoria-demo" }),
        });
        if (!signRes.ok) throw new Error("Failed to get upload signature");
        const { ok, cloudName, apiKey, timestamp, folder, signature } =
          await signRes.json();
        if (!ok) throw new Error("Signature response invalid");

        const form = new FormData();
        form.append("file", resume);
        form.append("api_key", apiKey);
        form.append("timestamp", String(timestamp));
        form.append("signature", signature);
        form.append("folder", folder);
        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;
        const upRes = await fetch(uploadUrl, { method: "POST", body: form });
        if (!upRes.ok) throw new Error("Resume upload failed");
        const json = await upRes.json();
        uploaded = { url: json.secure_url as string };
      }

      const res = await fetch("/api/zuri/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobCode: code,
          language,
          candidate: { name, email, phone },
          resume: uploaded,
          inviteToken: inviteToken || undefined, // server should verify & bind
        }),
      });
      const j = await res.json();
      if (!res.ok || !j.ok)
        throw new Error(j.error || "Failed to create session");
      window.location.href = `/zuri/${j.id}?t=${j.token}`;
    } catch (e: any) {
      setErr(e.message || "Error");
    } finally {
      setBusy(false);
    }
  }

  const allowedLangs = job?.languages?.length
    ? job.languages
    : LANGS.map((l) => l.code);

  return (
    <div className="relative min-h-[80vh] overflow-hidden">
      {/* Background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(60rem 60rem at 10% 10%, rgba(59,130,246,0.12), transparent 45%)," +
            "radial-gradient(50rem 50rem at 90% 30%, rgba(16,185,129,0.12), transparent 45%)," +
            "radial-gradient(40rem 40rem at 50% 120%, rgba(99,102,241,0.12), transparent 45%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.25] dark:opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(127,127,127,0.15) 1px, transparent 1px)," +
            "linear-gradient(to bottom, rgba(127,127,127,0.15) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(80rem 80rem at 50% 35%, rgba(0,0,0,1), rgba(0,0,0,0.05))",
          WebkitMaskImage:
            "radial-gradient(80rem 80rem at 50% 35%, rgba(0,0,0,1), rgba(0,0,0,0.05))",
        }}
      />
      <div aria-hidden className="bg-grain absolute inset-0" />

      {/* Content */}
      <div className="relative mx-auto flex min-h-[80vh] w-full max-w-5xl flex-col px-4 py-12 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/zuri/start"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-sm text-gray-800 backdrop-blur hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-gray-100"
          >
            <span aria-hidden>←</span> Back
          </Link>
          <div className="w-48">
            <div className="mb-1 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
              <span>Step 2 of 3</span>
              <span>{Math.round(progress * 100)}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200/70 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-black dark:bg-white"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-black/10 bg-white/70 p-8 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-white/10">
          <h1 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Start Your AI Interview
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-gray-600 dark:text-gray-300">
            Enter your invite code and details to begin. Your data is handled
            per our policy.
          </p>

          <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Invite Code (e.g., 8XZ2M4)"
              className="rounded-xl border border-black/10 bg-white/80 p-3 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-white/10 dark:text-gray-100 dark:placeholder:text-gray-400"
              required
            />

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-xl border border-black/10 bg-white/80 p-3 text-gray-900 [color-scheme:light] focus:outline-none focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-white/10 dark:text-gray-100 dark:[color-scheme:dark]"
            >
              {allowedLangs.map((c: string) => {
                const label = LANGS.find((l) => l.code === c)?.label || c;
                return (
                  <option key={c} value={c}>
                    {label}
                  </option>
                );
              })}
            </select>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="rounded-xl border border-black/10 bg-white/80 p-3 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-white/10 dark:text-gray-100 dark:placeholder:text-gray-400"
              required
            />
            <div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={invitedEmail || "Your Email"}
                className={`w-full rounded-xl border p-3 focus:outline-none focus:ring-2 ${
                  emailMismatch
                    ? "border-red-500 focus:ring-red-300"
                    : "border-black/10 bg-white/80 text-gray-900 placeholder:text-gray-500 focus:ring-black/10 dark:border-white/10 dark:bg-white/10 dark:text-gray-100 dark:placeholder:text-gray-400"
                }`}
                type="email"
                required
              />
              {invitedEmail && (
                <p
                  className={`mt-1 text-xs ${
                    emailMismatch
                      ? "text-red-600"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  Please use the invited email:{" "}
                  <span className="font-mono">{invitedEmail}</span>
                </p>
              )}
            </div>

            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone (optional)"
              className="rounded-xl border border-black/10 bg-white/80 p-3 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-white/10 dark:text-gray-100 dark:placeholder:text-gray-400"
              type="tel"
            />

            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResume(e.target.files?.[0] || null)}
              className="rounded-xl border border-black/10 bg-white/80 p-3 text-gray-900 file:mr-3 file:rounded-md file:border file:border-black/10 file:bg-white file:px-3 file:py-1 file:text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-white/10 dark:text-gray-100 dark:file:border-white/10 dark:file:bg-white/10"
            />

            {job ? (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <strong>{job.title}</strong> • {job.company || "—"} • Languages:{" "}
                {(job.languages || []).join(", ")}
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                Paste the code you received. Your recruiter will share it if
                missing.
              </p>
            )}

            <div className="rounded-lg border border-black/10 bg-gray-50/80 p-3 text-xs text-gray-700 dark:border-white/10 dark:bg-white/10 dark:text-gray-300">
              By starting, you consent to audio recording for assessment
              purposes.
            </div>

            {err && <div className="text-red-600">{err}</div>}

            <button
              type="submit"
              disabled={busy || !name || !email || !code || emailMismatch}
              className="rounded-xl bg-black px-4 py-3 font-medium text-white 
              hover:opacity-90 disabled:opacity-60 dark:bg-white 
              dark:text-black cursor-pointer"
            >
              {busy ? "Starting…" : "Start Interview"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
/* eslint-disable @typescript-eslint/no-explicit-any */
