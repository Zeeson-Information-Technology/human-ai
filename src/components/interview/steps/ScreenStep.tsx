"use client";
import { useCallback } from "react";
import {
  SectionCard,
  PrimaryButton,
  GhostButton,
} from "@/components/interview/atoms";

export default function ScreenStep({
  dark = false,
  screenOK,
  setScreenOK,
  onContinue,
}: {
  dark?: boolean;
  screenOK: boolean;
  setScreenOK: (v: boolean) => void;
  onContinue: () => void;
}) {
  const requestScreen = useCallback(async () => {
    try {
      // @ts-ignore
      const scr = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      scr.getTracks().forEach((t: MediaStreamTrack) => t.stop());
      setScreenOK(true);
    } catch {
      setScreenOK(false);
    }
  }, [setScreenOK]);

  return (
    <>
      <h1 className="text-3xl font-semibold mt-8 mb-2">Share your screen</h1>
      <p className="text-slate-400 mb-4">
        We’ll request permission for proctoring (you can stop sharing anytime).
      </p>
      <SectionCard dark={dark}>
        <div className="flex items-center justify-between gap-4">
          <div className="text-slate-300">
            {screenOK
              ? "Screen-share permission granted ✅"
              : "Permission pending…"}
          </div>
          <div className="flex gap-3">
            <GhostButton dark={dark} onClick={requestScreen}>
              Request permission
            </GhostButton>
            <PrimaryButton
              dark={dark}
              disabled={!screenOK}
              onClick={onContinue}
            >
              Continue
            </PrimaryButton>
          </div>
        </div>
      </SectionCard>
    </>
  );
}
