import { useCallback, useEffect, useRef, useState } from "react";

type UseTranscribeOpts = {
  language?: string;
  // inputStream is accepted for API compatibility but not required for WebSpeech
  inputStream?: MediaStream | null;
  wsUrl?: string | undefined;
  onFinalTranscript?: (text: string) => void;
  onInterim?: (text: string) => void;
  autoRestart?: boolean;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript?: string };
  }>;
};

type BrowserSpeechRecognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: (ev: SpeechRecognitionEventLike) => void;
  onerror: (e: unknown) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
};

export function useTranscribe(opts: UseTranscribeOpts = {}) {
  const {
    language = "en-US",
    onFinalTranscript,
    onInterim,
    autoRestart = true,
  } = opts;
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [error, setError] = useState<Error | null>(null);
  const recogRef = useRef<BrowserSpeechRecognition | null>(null);
  const stoppedRef = useRef(false);

  const startTranscription = useCallback(async () => {
    setError(null);
    stoppedRef.current = false;
    // Prefer browser Web Speech API
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: new () => BrowserSpeechRecognition; webkitSpeechRecognition?: new () => BrowserSpeechRecognition; }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: new () => BrowserSpeechRecognition; webkitSpeechRecognition?: new () => BrowserSpeechRecognition; }).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError(new Error("SpeechRecognition not supported in this browser"));
      return;
    }

    try {
      const r = new SpeechRecognition();
      r.lang = language;
      r.interimResults = true;
      r.continuous = true;

      r.onresult = (ev: SpeechRecognitionEventLike) => {
        let interim = "";
        let final = "";
        for (let i = ev.resultIndex; i < ev.results.length; ++i) {
          const res = ev.results[i];
          const txt = (res[0]?.transcript || "").trim();
          if (res.isFinal) {
            final += (final ? " " : "") + txt;
          } else {
            interim += (interim ? " " : "") + txt;
          }
        }
        if (interim) {
          setCurrentTranscript(interim);
          onInterim?.(interim);
        }
        if (final) {
          setCurrentTranscript(final);
          onFinalTranscript?.(final);
          // Clear interim after final
          setCurrentTranscript("");
        }
      };

      r.onerror = (e: unknown) => {
        const msg = typeof e === 'object' && e && 'error' in (e as any) ? String((e as any).error) : 'recognition error';
        setError(new Error(msg));
      };

      r.onend = () => {
        setIsTranscribing(false);
        if (autoRestart && !stoppedRef.current) {
          try {
            // Small delay avoids tight spin when Chrome auto-stops
            setTimeout(() => {
              try {
                if (!stoppedRef.current) {
                  r.start();
                  setIsTranscribing(true);
                }
              } catch {}
            }, 250);
          } catch {}
        }
      };

      recogRef.current = r;
      r.start();
      setIsTranscribing(true);
    } catch (e: unknown) {
      setError(e as Error);
    }
  }, [language, onFinalTranscript, onInterim, autoRestart]);

  const stopTranscription = useCallback(() => {
    try {
      stoppedRef.current = true;
      const r = recogRef.current;
      if (r) {
        try {
          r.stop();
        } catch {}
        recogRef.current = null;
      }
      setIsTranscribing(false);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    // cleanup on unmount
    return () => {
      try {
        stopTranscription();
      } catch {}
    };
  }, [stopTranscription]);

  return {
    isTranscribing,
    currentTranscript,
    error,
    startTranscription,
    stopTranscription,
  };
}
