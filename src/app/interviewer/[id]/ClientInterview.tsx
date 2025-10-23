"use client";

import { useCallback, useEffect, useState } from "react";
import { HeaderBar } from "@/components/interview/atoms";
import ConsentStep from "@/components/interview/steps/ConsentStep";
import MicStep from "@/components/interview/steps/MicStep";
import ScreenStep from "@/components/interview/steps/ScreenStep";
import CameraStep from "@/components/interview/steps/CameraStep";
import FocusStep from "@/components/interview/steps/FocusStep";
import IntroStep from "@/components/interview/steps/IntroStep";
import DetailsStep from "@/components/interview/steps/DetailsStep";
import LivePane from "@/components/interview/LivePane";
import { type Step, type Prefill } from "@/components/interview/types";

type Props = {
  sessionId: string;
  token: string;
  jobContext: string;
  initialQuestion: string;
  resumeSummary?: string;
  /** From page.tsx: session.company?.name || session.org?.name || "Equatoria • Zuri" */
  companyName?: string;
};

export default function ClientInterview({
  sessionId,
  token,
  jobContext,
  initialQuestion,
  resumeSummary = "",
  companyName: companyNameProp = "", // Remove default Equatoria value
}: Props) {
  const [companyName, setCompanyName] = useState<string>(companyNameProp || "");

  // stepper
  const [step, setStep] = useState<Step>("consent");
  const next = useCallback(() => {
    const order: Step[] = [
      "consent",
      "mic",
      "screen",
      "camera",
      "focus",
      "intro",
      "details",
      "live",
    ];
    setStep((s) => order[Math.min(order.indexOf(s) + 1, order.length - 1)]);
  }, []);
  const back = useCallback(() => {
    const order: Step[] = [
      "consent",
      "mic",
      "screen",
      "camera",
      "focus",
      "intro",
      "details",
      "live",
    ];
    setStep((s) => order[Math.max(order.indexOf(s) - 1, 0)]);
  }, []);

  // prefill from session
  const [loadingPrefill, setLoadingPrefill] = useState(true);
  const [prefill, setPrefill] = useState<Prefill>({
    name: "",
    email: "",
    phone: "",
    inviteLockedEmail: false,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoadingPrefill(true);
        const r = await fetch(
          `/api/zuri/sessions/${encodeURIComponent(
            sessionId
          )}?t=${encodeURIComponent(token)}&view=prefill`,
          { cache: "no-store" }
        );
        const j = await r.json();
        if (!active) return;
        if (r.ok && j?.ok) {
          const s = j.session || {};
          setPrefill({
            name: s?.candidate?.name || "",
            email: s?.candidate?.email || "",
            phone: s?.candidate?.phone || "",
            inviteLockedEmail: Boolean(s?.meta?.inviteToken),
          });
          const serverCompany =
            s?.company?.name ||
            s?.org?.name ||
            s?.employer?.name ||
            s?.clientName ||
            s?.companyName ||
            "";
          if (serverCompany) setCompanyName(serverCompany);
        }
      } catch {
        // ignore
      } finally {
        if (active) setLoadingPrefill(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [sessionId, token]);

  // per-step local state
  const [agree, setAgree] = useState(false);
  const [screenOK, setScreenOK] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  // details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // hydrate details from prefill once
  useEffect(() => {
    if (!loadingPrefill) {
      setName(prefill.name);
      setEmail(prefill.email);
      setPhone(prefill.phone);
    }
  }, [loadingPrefill, prefill]);

  const [err, setErr] = useState("");

  const savePrefightAndStart = useCallback(async () => {
    try {
      setErr("");
      const form = new FormData();
      form.set("name", name);
      form.set("email", email);
      form.set("phone", phone);
      form.set("consent", agree ? "true" : "false");
      if (resumeFile) form.set("resume", resumeFile);

      const r = await fetch(
        `/api/zuri/sessions/${encodeURIComponent(
          sessionId
        )}/prefight?t=${encodeURIComponent(token)}`,
        { method: "POST", body: form }
      );
      if (!r.ok) throw new Error("Could not save details");
      setStep("live");
    } catch (e: any) {
      setErr(e?.message || "Preflight failed. Please try again.");
    }
  }, [agree, email, name, phone, resumeFile, sessionId, token]);

  return (
    <div className="min-h-[100svh] w-full bg-slate-950 text-slate-100">
      {step !== "live" && (
        <HeaderBar
          brandInitial={(companyName?.[0] || "Z").toUpperCase()}
          brandName={companyName}
          onBack={step !== "consent" ? back : undefined}
          dark
        />
      )}

      {/* Wizard */}
      {step !== "live" && (
        <main className="mx-auto w-full max-w-6xl px-4 pb-16 flex flex-col items-center">
          {step === "consent" && (
            <ConsentStep
              dark
              agree={agree}
              onAgree={setAgree}
              onContinue={next}
            />
          )}

          {step === "mic" && <MicStep dark onContinue={next} />}

          {step === "screen" && (
            <ScreenStep
              dark
              screenOK={screenOK}
              setScreenOK={setScreenOK}
              onContinue={next}
            />
          )}

          {step === "camera" && (
            <CameraStep
              dark
              active={cameraActive}
              setActive={setCameraActive}
              onContinue={next}
            />
          )}

          {step === "focus" && (
            <FocusStep
              dark
              jobContext={jobContext}
              resumeSummary={resumeSummary}
              onContinue={next}
            />
          )}

          {step === "intro" && (
            <IntroStep dark companyName={companyName} onContinue={next} />
          )}

          {step === "details" && (
            <DetailsStep
              dark
              name={name}
              email={email}
              phone={phone}
              inviteLockedEmail={prefill.inviteLockedEmail}
              onName={setName}
              onEmail={setEmail}
              onPhone={setPhone}
              onResume={setResumeFile}
              error={err}
              onSubmit={savePrefightAndStart}
            />
          )}
        </main>
      )}

      {/* Live */}
      {step === "live" && (
        <LivePane
          dark
          companyName={companyName}
          initialQuestion={initialQuestion}
          sessionId={sessionId}
          token={token}
          jobContext={jobContext}
          resumeSummary={resumeSummary}
        />
      )}

      <footer className="py-6 text-center text-xs text-slate-500">
        Powered by Zuri
      </footer>
    </div>
  );
}
