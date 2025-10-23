"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  SectionCard,
  PrimaryButton,
  GhostButton,
} from "@/components/interview/atoms";

export default function MicStep({
  dark = false,
  onContinue,
}: {
  dark?: boolean;
  onContinue: () => void;
}) {
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [level, setLevel] = useState(0);
  const [hasTested, setHasTested] = useState(false);

  const stopMic = useCallback(() => {
    if (analyserRef.current) analyserRef.current.disconnect();
    if (ctxRef.current) ctxRef.current.close().catch(() => {});
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    analyserRef.current = null;
    ctxRef.current = null;
  }, []);

  const startMic = useCallback(async () => {
    try {
      setHasTested(true);
      stopMic();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      streamRef.current = stream;
      const ctx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      ctxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyserRef.current = analyser;
      source.connect(analyser);

      const buf = new Uint8Array(analyser.frequencyBinCount);
      const loop = () => {
        analyser.getByteFrequencyData(buf);
        const avg = buf.reduce((a, v) => a + v, 0) / buf.length;
        setLevel(avg / 255);
        requestAnimationFrame(loop);
      };
      loop();
    } catch (err) {
      console.error("Mic access error:", err);
      setHasTested(false);
    }
  }, [stopMic]);

  const bars = useMemo(() => {
    const n = 24;
    const active = Math.round(level * n);
    return new Array(n)
      .fill(0)
      .map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-sm transition-all ${
            i < active ? "bg-indigo-400" : "bg-slate-700"
          }`}
        />
      ));
  }, [level]);

  return (
    <>
      <h1 className="text-3xl font-semibold mt-8 mb-2">Test your mic</h1>
      <p className="text-slate-400 mb-4">
        Click “Speak” and read the line below out loud.
      </p>
      <SectionCard dark={dark}>
        <div className="flex flex-col gap-4">
          <div className="rounded-xl bg-slate-800/70 p-4">
            <div className="text-center text-lg font-medium">
              “Testing. Do you hear me Zuri?”
            </div>
            <div className="mt-4 grid grid-cols-12 gap-1">{bars}</div>
          </div>
          <div className="flex gap-3">
            <GhostButton dark={dark} onClick={startMic}>
              Speak
            </GhostButton>
            <PrimaryButton
              dark={dark}
              onClick={onContinue}
              disabled={!hasTested}
              className={!hasTested ? "opacity-50 cursor-not-allowed" : ""}
            >
              Continue
            </PrimaryButton>
          </div>
          {!hasTested && (
            <p className="text-sm text-slate-400">
              Please test your microphone before continuing
            </p>
          )}
        </div>
      </SectionCard>
    </>
  );
}
