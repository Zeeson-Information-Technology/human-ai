import { useState, useCallback, useRef } from "react";

interface TranscribeConfig {
  /** If you already have a mic stream (e.g., from Chime), pass it and we won't call getUserMedia */
  inputStream?: MediaStream | null;
  language?: string;
  sampleRate?: number;
  onTranscript?: (text: string) => void;
  /** Called when a final (utterance-complete) transcript is produced */
  onFinalTranscript?: (text: string) => void;
  /** Optional WS URL to a real-time transcription backend; if omitted we try Web Speech API */
  wsUrl?: string;
}

export function useTranscribe(config: TranscribeConfig = {}) {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [error, setError] = useState<Error | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const webSpeechStopRef = useRef<null | (() => void)>(null);

  const startTranscription = useCallback(async () => {
    try {
      setError(null);

      // Reuse provided stream (from Chime) or capture a new one
      let stream = config.inputStream || null;
      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
      }
      streamRef.current = stream;

      // If a WS endpoint is provided, send chunks there
      if (config.wsUrl) {
        const ws = new WebSocket(config.wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          // send an init message with metadata
          ws.send(
            JSON.stringify({
              type: "init",
              language: config.language || "en-GB",
              sampleRate: config.sampleRate || 48000,
            })
          );
        };

        ws.onmessage = (ev) => {
          try {
            const msg = JSON.parse(ev.data);
            if (msg.type === "partial" || msg.type === "final") {
              setCurrentTranscript(msg.text || "");
              config.onTranscript?.(msg.text || "");
              if (msg.type === "final" && msg.text) {
                config.onFinalTranscript?.(msg.text);
              }
            }
          } catch {
            // ignore text frames
          }
        };

        ws.onerror = () => setError(new Error("Transcribe WS error"));
        ws.onclose = () => {
          /* noop */
        };

        // Record PCM/opus chunks and forward to WS
        const mr = new MediaRecorder(stream!, {
          mimeType: "audio/webm;codecs=opus",
        });
        mediaRecorderRef.current = mr;

        mr.ondataavailable = (event) => {
          if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
            ws.send(event.data);
          }
        };

        mr.start(500); // 500ms chunks
        setIsTranscribing(true);
        return;
      }

      // Otherwise: try Web Speech API (browser STT) as a no-server fallback
      const SpeechRecognition: any =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.lang = config.language || "en-GB";
        rec.continuous = true;
        rec.interimResults = true;

        rec.onresult = (e: any) => {
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const r = e.results[i];
            const text = r[0]?.transcript || "";
            setCurrentTranscript(text);
            config.onTranscript?.(text);
            if (r.isFinal && text.trim()) {
              config.onFinalTranscript?.(text.trim());
            }
          }
        };
        rec.onerror = (ev: any) => {
          console.warn("WebSpeech error", ev);
          setError(new Error("WebSpeech error"));
        };
        rec.onend = () => {
          // Keep running unless explicitly stopped
          try {
            rec.start();
          } catch {}
        };
        rec.start();
        webSpeechStopRef.current = () => {
          try {
            rec.onend = null;
            rec.stop();
          } catch {}
        };
        setIsTranscribing(true);
        return;
      }

      // As a last resort, simple placeholder/mock (keeps UI responsive)
      const mr = new MediaRecorder(stream!);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = () => {
        const msg = "Mic active (no STT backend)";
        setCurrentTranscript(msg);
        config.onTranscript?.(msg);
      };
      mr.start(1000);
      setIsTranscribing(true);
    } catch (err) {
      console.error("Failed to start transcription:", err);
      setError(err as Error);
    }
  }, [config]);

  const stopTranscription = useCallback(() => {
    try {
      mediaRecorderRef.current?.stop();
    } catch {}
    try {
      wsRef.current?.close();
    } catch {}
    try {
      webSpeechStopRef.current?.();
      webSpeechStopRef.current = null;
    } catch {}
    if (!config.inputStream && streamRef.current) {
      // Only stop tracks if we created the stream ourselves
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    setIsTranscribing(false);
  }, [config.inputStream]);

  return {
    isTranscribing,
    currentTranscript,
    error,
    startTranscription,
    stopTranscription,
  };
}
