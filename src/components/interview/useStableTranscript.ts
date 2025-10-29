import { useEffect, useRef } from "react";

export function useStableTranscript({
  text,
  waitMs = 1200,
  minWords = 3,
  suppressWhen,
  onFinal,
}: {
  text: string | undefined;
  waitMs?: number;
  minWords?: number;
  suppressWhen?: () => boolean;
  onFinal: (finalText: string) => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRef = useRef("");

  useEffect(() => {
    const t = (text || "").trim();
    if (!t || suppressWhen?.()) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    lastRef.current = t;
    timerRef.current = setTimeout(() => {
      if (lastRef.current.split(/\s+/).filter(Boolean).length >= minWords) {
        onFinal(lastRef.current);
      }
    }, waitMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, waitMs, minWords, suppressWhen, onFinal]);
}
