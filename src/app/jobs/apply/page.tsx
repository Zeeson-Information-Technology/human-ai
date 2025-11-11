// src/app/jobs/apply/page.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "@/lib/use-session";

// Add validation helpers
function isValidLinkedInUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    // Valid LinkedIn domains
    const validDomains = ["linkedin.com", "www.linkedin.com"];
    if (!validDomains.includes(parsed.hostname)) return false;

    // Valid path patterns:
    // - /in/username
    // - /username
    // - /profile/view?id=XXX
    const path = parsed.pathname.toLowerCase();
    const validPathPatterns = [
      // Has a path with at least 2 chars after the slash
      /^\/[a-z0-9-]+\/?$/i, // /username
      /^\/in\/[a-z0-9-]+\/?$/i, // /in/username
      /^\/profile\/view$/i, // /profile/view (with id param)
    ];

    return (
      validPathPatterns.some((pattern) => pattern.test(path)) ||
      (path === "/profile/view" && parsed.searchParams.has("id"))
    );
  } catch {
    return false;
  }
}

export default function JobApplyPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading: sessionLoading } = useSession();

  // URL params
  const code = (params?.get("code") || "").toUpperCase();
  const emailFromLink = (params?.get("email") || "").toLowerCase();
  const ivt = params?.get("ivt") || ""; // signed invite token
  const langParam = params?.get("lang") || "";

  // Local state
  const [job, setJob] = useState<any>(null);
  const [loadingJob, setLoadingJob] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState(emailFromLink);
  const [phone, setPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [language, setLanguage] = useState<string>("en");
  const [screenerAnswers, setScreenerAnswers] = useState<string[]>([]);
  const [screenerRuleAnswers, setScreenerRuleAnswers] = useState<any[]>([]);
  const [hasResume, setHasResume] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [showChromeBanner, setShowChromeBanner] = useState(false);

  // Lock email when invite ties it to a specific address
  const emailLocked = useMemo(
    () => !!emailFromLink && !!ivt,
    [emailFromLink, ivt]
  );

  // Gate: normal applicants must be logged in as talent, but invites skip the gate
  useEffect(() => {
    if (!ivt && !sessionLoading) {
      if (!user || String(user?.role) !== "talent") {
        router.replace("/zuri/start/login?role=talent");
      }
    }
  }, [ivt, user, sessionLoading, router]);

  // Recommend Chrome for best screen-sharing experience
  useEffect(() => {
    try {
      const ua = navigator.userAgent || "";
      const isChrome =
        /Chrome\//.test(ua) && !/Edg\//.test(ua) && !/OPR\//.test(ua);
      setShowChromeBanner(!isChrome);
    } catch {
      setShowChromeBanner(false);
    }
  }, []);

  // Fetch job (we do not auto-redirect on invite; creation happens on submit)
  useEffect(() => {
    async function fetchJob() {
      if (!code) {
        setJob(null);
        setLoadingJob(false);
        return;
      }
      setLoadingJob(true);
      try {
        const res = await fetch(`/api/public/jobs/${code}`);
        if (!res.ok) throw new Error("Job not found");
        const { job } = await res.json();
        setJob(job);

        if (Array.isArray(job?.screenerQuestions)) {
          setScreenerAnswers(Array(job.screenerQuestions.length).fill(""));
        }
        if (Array.isArray(job?.screenerRules)) {
          setScreenerRuleAnswers(
            job.screenerRules.map((r: any) => ({
              question: r.question,
              kind: r.kind,
              category: r.category,
              answer: "",
            }))
          );
        }

        const jobLangs: string[] = Array.isArray(job?.languages)
          ? job.languages
          : [];
        const chosen =
          (langParam && jobLangs.includes(langParam) && langParam) ||
          jobLangs[0] ||
          "en";
        setLanguage(chosen);
      } catch {
        setJob(null);
      } finally {
        setLoadingJob(false);
      }
    }
    fetchJob();
  }, [code, langParam]);

  // Pre-fill from session
  useEffect(() => {
    if (user) {
      setName((prev) => prev || user.name || "");
      setEmail((prev) => prev || user.email || "");
      if (user.linkedin) setLinkedin((prev) => prev || user.linkedin || "");
    }
  }, [user]);

  // Use existing resume if candidate already has one
  useEffect(() => {
    if (user && (user as any).resume?.url) {
      setHasResume(true);
      setResume(null);
    }
  }, [user]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setFormErrors({});

    // Validate fields
    const errors: { [key: string]: string } = {};

    if (!name.trim()) {
      errors.name = "Name is required";
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Valid email is required";
    }

    if (!linkedin.trim()) {
      errors.linkedin = "LinkedIn profile URL is required";
    } else if (!isValidLinkedInUrl(linkedin)) {
      errors.linkedin =
        "Please enter a valid LinkedIn profile URL (e.g., linkedin.com/in/username)";
    }

    // Validate screeners
    if (Array.isArray(job?.screenerQuestions)) {
      job.screenerQuestions.forEach((q: string, idx: number) => {
        if (!String(screenerAnswers[idx] || "").trim()) {
          errors[`screener_${idx}`] = "Required";
        }
      });
    }
    if (Array.isArray(job?.screenerRules)) {
      job.screenerRules.forEach((r: any, idx: number) => {
        const ans = screenerRuleAnswers[idx]?.answer;
        if (r.kind === "boolean") {
          if (
            ans !== true &&
            ans !== false &&
            ans !== "true" &&
            ans !== "false"
          ) {
            errors[`rule_${idx}`] = "Please select Yes or No";
          }
        } else if (!String(ans ?? "").trim()) {
          errors[`rule_${idx}`] = "Required";
        }
      });
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setBusy(true);
    try {
      // Use saved resume if available
      let resumeUrlToUse: string | undefined = (user as any)?.resume?.url;

      // If no saved resume, upload a new one
      if (!resumeUrlToUse) {
        if (!resume) throw new Error("Resume is required.");

        // 1) Sign
        const signRes = await fetch("/api/cloudinary/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder: "equatoria-demo" }),
        });
        if (!signRes.ok) throw new Error("Failed to get upload signature");
        const { ok, cloudName, apiKey, timestamp, folder, signature } =
          await signRes.json();
        if (!ok) throw new Error("Signature response invalid");

        // 2) Upload
        const form = new FormData();
        form.append("file", resume as File, (resume as File).name);
        form.append("api_key", apiKey);
        form.append("timestamp", String(timestamp));
        form.append("signature", signature);
        form.append("folder", folder);

        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;
        const upRes = await fetch(uploadUrl, { method: "POST", body: form });
        if (!upRes.ok) throw new Error("Resume upload failed");
        const json = await upRes.json();
        resumeUrlToUse = json.secure_url as string;
      }

      // 3) Create interview session (invite or standard)
      const res = await fetch("/api/zuri/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobCode: code,
          language,
          inviteToken: ivt || undefined,
          candidate: { name, email, phone, linkedin },
          resume: { url: resumeUrlToUse },
          screeners: {
            legacy: Array.isArray(job?.screenerQuestions)
              ? screenerAnswers.map((a, i) => ({
                  question: job.screenerQuestions[i],
                  answer: a,
                }))
              : [],
            rules: Array.isArray(job?.screenerRules)
              ? job.screenerRules.map((r: any, i: number) => ({
                  question: r.question,
                  kind: r.kind,
                  category: r.category,
                  answer: screenerRuleAnswers[i]?.answer,
                }))
              : [],
          },
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

  const langs: string[] = Array.isArray(job?.languages) ? job.languages : [];

  return (
    <div className="relative mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">
        {job?.title || "Apply / Start Interview"}
      </h1>

      {showChromeBanner && (
        <div className="mt-2 rounded-lg bg-amber-100 text-amber-900 p-3 text-sm">
          For the best experience, we recommend using Google Chrome.
        </div>
      )}

      {ivt && (
        <div className="mt-2 text-sm text-gray-600">
          You’re starting an interview via an invite link.
        </div>
      )}

      {/* Instructions / Checks */}
      <div className="mt-4 rounded-2xl border p-4 bg-white">
        <div className="text-sm text-gray-600 font-medium">
          Before you begin
        </div>
        <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 space-y-1">
          <li>Keep your camera and microphone available.</li>
          <li>Be ready to share your screen if asked.</li>
          <li>Use a quiet space and stable internet.</li>
          <li>
            We score what you say, not your accent. Be concise and concrete.
          </li>
        </ul>
      </div>

      {/* Form */}
      {!loadingJob && job && (
        <form onSubmit={onSubmit} className="mt-4 grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-sm text-gray-600">
              <div className="text-xs text-gray-500">Role</div>
              <div className="font-medium">{job.title}</div>
            </div>
            <div className="text-sm text-gray-600">
              <div className="text-xs text-gray-500">Company</div>
              <div className="font-medium">{job.company || ""}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-500">Language</div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="rounded-xl border px-3 py-2 bg-white text-gray-900"
              >
                {(langs.length ? langs : ["en"]).map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className={`rounded-xl border p-3 w-full ${
                formErrors.name ? "border-red-500" : ""
              }`}
              required
            />
            {formErrors.name && (
              <div className="mt-1 text-xs text-red-500">{formErrors.name}</div>
            )}
          </div>

          <div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your Email"
              type="email"
              className={`rounded-xl border p-3 w-full ${
                formErrors.email ? "border-red-500" : ""
              } ${emailLocked ? "bg-gray-100 text-gray-600" : ""}`}
              required
              disabled={emailLocked}
            />
            {formErrors.email && (
              <div className="mt-1 text-xs text-red-500">
                {formErrors.email}
              </div>
            )}
          </div>

          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone (optional)"
            className="rounded-xl border p-3"
            type="tel"
          />

          <div>
            <input
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="LinkedIn profile URL"
              type="url"
              className={`rounded-xl border p-3 w-full ${
                formErrors.linkedin ? "border-red-500" : ""
              }`}
              required
            />
            {formErrors.linkedin && (
              <div className="mt-1 text-xs text-red-500">
                {formErrors.linkedin}
              </div>
            )}
          </div>

          {Array.isArray(job.screenerQuestions) &&
            job.screenerQuestions.length > 0 && (
              <div className="rounded-xl border p-3">
                <div className="font-semibold text-sm mb-2">
                  Screener Questions
                </div>
                {job.screenerQuestions.map((q: string, idx: number) => (
                  <input
                    key={idx}
                    value={screenerAnswers[idx] || ""}
                    onChange={(e) => {
                      const arr = [...screenerAnswers];
                      arr[idx] = e.target.value;
                      setScreenerAnswers(arr);
                    }}
                    placeholder={q}
                    className={`mb-2 w-full rounded-lg border p-2 ${
                      formErrors[`screener_${idx}`] ? "border-red-500" : ""
                    }`}
                    required
                  />
                ))}
              </div>
            )}

          {Array.isArray((job as any)?.screenerRules) &&
            (job as any).screenerRules.length > 0 && (
              <div className="rounded-xl border p-3 mt-4">
                <div className="font-semibold text-sm mb-2">
                  Screening Questions
                </div>
                <div className="grid gap-3">
                  {(job as any).screenerRules.map((r: any, idx: number) => {
                    const errKey = `rule_${idx}`;
                    const hasErr = !!formErrors[errKey];
                    const setAns = (val: any) => {
                      setScreenerRuleAnswers((prev) => {
                        const next = [...prev];
                        next[idx] = {
                          question: r.question,
                          kind: r.kind,
                          category: r.category,
                          answer: val,
                        };
                        return next;
                      });
                    };
                    return (
                      <div key={idx} className="grid gap-1">
                        <label className="text-sm font-medium">
                          {r.question}
                        </label>
                        {r.kind === "select" && Array.isArray(r.options) && (
                          <select
                            value={String(
                              screenerRuleAnswers[idx]?.answer ?? ""
                            )}
                            onChange={(e) => setAns(e.target.value)}
                            className={`rounded-xl border p-2 ${
                              hasErr ? "border-red-500" : ""
                            }`}
                          >
                            <option value="">Select…</option>
                            {r.options.map((o: string) => (
                              <option key={o} value={o}>
                                {o}
                              </option>
                            ))}
                          </select>
                        )}
                        {(r.kind === "number" || r.kind === "currency") && (
                          <div className="relative">
                            <input
                              value={String(
                                screenerRuleAnswers[idx]?.answer ?? ""
                              )}
                              onChange={(e) =>
                                setAns(e.target.value.replace(/[^0-9]/g, ""))
                              }
                              className={`w-full rounded-xl border p-2 pr-16 ${
                                hasErr ? "border-red-500" : ""
                              }`}
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              placeholder={
                                r.unit ||
                                (r.kind === "currency" ? r.currency || "" : "")
                              }
                            />
                            {r.kind === "currency" && (
                              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
                                {r.currency || ""}
                              </span>
                            )}
                          </div>
                        )}
                        {r.kind === "boolean" && (
                          <select
                            value={String(
                              screenerRuleAnswers[idx]?.answer ?? ""
                            )}
                            onChange={(e) => setAns(e.target.value === "true")}
                            className={`rounded-xl border p-2 ${
                              hasErr ? "border-red-500" : ""
                            }`}
                          >
                            <option value="">Select…</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </select>
                        )}
                        {r.kind === "text" && (
                          <input
                            value={String(
                              screenerRuleAnswers[idx]?.answer ?? ""
                            )}
                            onChange={(e) => setAns(e.target.value)}
                            className={`rounded-xl border p-2 ${
                              hasErr ? "border-red-500" : ""
                            }`}
                            placeholder="Your answer"
                          />
                        )}
                        {hasErr && (
                          <div className="text-xs text-red-600">
                            {formErrors[errKey]}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          {!hasResume && (
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResume(e.target.files?.[0] || null)}
              className="rounded-xl border p-3 cursor-pointer"
              required
            />
          )}
          {hasResume && (
            <div className="text-sm text-emerald-700">
              Using your saved resume.{" "}
              <span
                className="underline cursor-pointer"
                onClick={() => setHasResume(false)}
              >
                Upload a different one
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-white px-4 py-3 font-medium text-black 
            hover:opacity-90 disabled:opacity-60 cursor-pointer"
          >
            {busy ? "Starting…" : "Start Interview"}
          </button>

          {err && <div className="text-red-600">{err}</div>}
        </form>
      )}

      {/* Loading / fallbacks */}
      {loadingJob && (
        <div className="mx-auto max-w-xl px-4 py-10 text-center">
          <div className="animate-pulse h-8 w-2/3 mx-auto bg-gray-200 rounded" />
        </div>
      )}

      {!loadingJob && !job && (
        <div className="mx-auto max-w-xl px-4 py-10 text-center text-red-600">
          Job not found or unavailable.
        </div>
      )}

      <div className="mt-4">
        <Link href="/jobs" className="text-sm text-gray-600 hover:underline">
          Back to jobs
        </Link>
      </div>

      {job?.interviewOnApply === false && (
        <div className="mt-6 rounded-xl border bg-gray-50 p-4 text-center text-gray-700">
          Thank you for applying! We&apos;ll review your application and get
          back to you soon.
        </div>
      )}

      {(sessionLoading || loadingJob) && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-black/40 backdrop-blur-sm"
          role="status"
          aria-live="polite"
          aria-label="Loading interview form"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="relative grid h-12 w-auto place-items-center">
              <Image
                src="/euman-logo.png"
                alt="Euman AI"
                width={160}
                height={36}
                priority
                className="h-9 w-auto animate-pulse"
              />
            </div>
            <div className="text-white/90 text-sm">
              Preparing your interview…
            </div>
          </div>
        </div>
      )}

      {busy && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-black/40 backdrop-blur-sm"
          role="status"
          aria-live="polite"
          aria-label="Starting interview"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="relative grid h-12 w-auto place-items-center">
              <Image
                src="/euman-logo.png"
                alt="Euman AI"
                width={160}
                height={36}
                priority
                className="h-9 w-auto animate-pulse"
              />
            </div>
            <div className="text-white/90 text-sm">Starting your session…</div>
          </div>
        </div>
      )}
    </div>
  );
}
