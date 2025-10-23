"use client";
import { useCallback, useRef } from "react";
import {
  SectionCard,
  PrimaryButton,
  GhostButton,
} from "@/components/interview/atoms";

export default function CameraStep({
  dark = false,
  active,
  setActive,
  onContinue,
}: {
  dark?: boolean;
  active: boolean;
  setActive: (v: boolean) => void;
  onContinue: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720 },
      audio: false,
    });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setActive(true);
    }
  }, [setActive]);

  const stop = useCallback(() => {
    const v = videoRef.current;
    if (v && v.srcObject) {
      (v.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      v.srcObject = null;
    }
    setActive(false);
  }, [setActive]);

  return (
    <div className="w-full flex flex-col items-center justify-center text-center mt-10">
      <h1 className="text-3xl font-semibold mb-2">Check your camera</h1>
      <p className="text-slate-400 mb-6 max-w-md">
        Your camera will record the interview for assessment and proctoring.
      </p>

      <SectionCard dark={dark}>
        <div className="flex flex-col items-center justify-center gap-6">
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full max-w-2xl aspect-video rounded-xl bg-slate-800 border border-slate-700"
          />

          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {!active ? (
              <GhostButton dark={dark} onClick={start}>
                Enable camera
              </GhostButton>
            ) : (
              <GhostButton dark={dark} onClick={stop}>
                Disable camera
              </GhostButton>
            )}
            <PrimaryButton dark={dark} onClick={onContinue}>
              Continue
            </PrimaryButton>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
