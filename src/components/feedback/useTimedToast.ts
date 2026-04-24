"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ToastType } from "./PremiumToast";

export type ToastState = {
  msg: string;
  type: ToastType;
} | null;

export function useTimedToast(duration = 3500) {
  const [toast, setToast] = useState<ToastState>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearToast = useCallback(() => {
    setToast(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const showToast = useCallback(
    (msg: string, type: ToastType = "info") => {
      setToast({ msg, type });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setToast(null), duration);
    },
    [duration]
  );

  useEffect(() => clearToast, [clearToast]);

  return { toast, showToast, clearToast };
}
