"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { computeRemainingMs } from "./math";

type UseInterviewTimerOptions = {
  durationMs: number;
  onExpire?: () => void | Promise<void>;
  tickMs?: number;
};

export function useInterviewTimer({
  durationMs,
  onExpire,
  tickMs = 250,
}: UseInterviewTimerOptions) {
  const [remainingMs, setRemainingMs] = useState<number>(durationMs);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const startedAtRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const expiredRef = useRef<boolean>(false);

  const stopInternal = useCallback(() => {
    try {
      if (intervalRef.current) clearInterval(intervalRef.current);
    } catch {}
    intervalRef.current = null;
    setIsRunning(false);
  }, []);

  const tick = useCallback(() => {
    const startedAt = startedAtRef.current || Date.now();
    const next = computeRemainingMs(startedAt, Date.now(), durationMs);
    setRemainingMs(next);
    if (next <= 0 && !expiredRef.current) {
      expiredRef.current = true;
      stopInternal();
      onExpire?.();
    }
  }, [durationMs, onExpire, stopInternal]);

  const start = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    expiredRef.current = false;
    if (!startedAtRef.current) startedAtRef.current = Date.now();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(tick, tickMs);
    // fire an immediate tick for snappy UI
    tick();
  }, [isRunning, tick, tickMs]);

  const stop = useCallback(() => {
    stopInternal();
  }, [stopInternal]);

  const reset = useCallback(() => {
    startedAtRef.current = null;
    expiredRef.current = false;
    setRemainingMs(durationMs);
    setIsRunning(false);
    try {
      if (intervalRef.current) clearInterval(intervalRef.current);
    } catch {}
    intervalRef.current = null;
  }, [durationMs]);

  useEffect(() => () => stopInternal(), [stopInternal]);

  return { remainingMs, isRunning, start, stop, reset } as const;
}
