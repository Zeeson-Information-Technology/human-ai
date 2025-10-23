"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SectionCard } from "@/components/interview/atoms";
import { useChimeClient } from "@/lib/use-chime";
import { useTranscribe } from "@/lib/use-transcribe";

type LivePaneProps = {
  dark?: boolean;
  companyName?: string;
  initialQuestion: string;
  sessionId: string;
  token: string;
  jobContext?: string;
  resumeSummary?: string;
};

export default function LivePane({
  dark = false,
  companyName = "Equatoria • Zuri",
  initialQuestion,
  sessionId,
  token,
  jobContext = "",
  resumeSummary = "",
}: LivePaneProps) {
  const [timer, setTimer] = useState(7 * 60 + 30);
  const tRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();
  const endedRef = useRef(false);

  const [messages, setMessages] = useState<
    Array<{ role: "assistant" | "user"; content: string }>
  >([{ role: "assistant", content: initialQuestion }]);

  const [isConnected, setIsConnected] = useState(false);
  const [hasWelcomed, setHasWelcomed] = useState(false);
  const [ready, setReady] = useState(false); // when to start the clock
  const isSpeakingRef = useRef(false); // suppress ASR while TTS playing
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showEndModal, setShowEndModal] = useState(false);

  // Local video (self), optional screen share PiP, and audio for TTS
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const shareVideoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  // Chime
  const {
    joinMeeting,
    startLocalVideo,
    stopLocalVideo,
    getMicStream,
    audioVideo,
  } = useChimeClient();

  // Transcribe (reusing Chime mic stream)
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const {
    startTranscription,
    stopTranscription,
    currentTranscript,
    isTranscribing,
    error: transcribeError,
  } = useTranscribe({
    inputStream: micStream,
    language: process.env.NEXT_PUBLIC_TRANSCRIBE_LANG || "en-GB",
    wsUrl: process.env.NEXT_PUBLIC_TRANSCRIBE_WS || undefined,
    onFinalTranscript: async (finalText) => {
      if (isSpeakingRef.current) return; // ignore TTS echo
      const text = (finalText || "").trim();
      if (!text) return;
      setMessages((prev) => [...prev, { role: "user", content: text }]);
      try {
        await sendAnswer(text);
      } catch (e) {
        console.error("sendAnswer failed", e);
      }
    },
  });

  const historyForTurn = useMemo(
    () =>
      messages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    [messages]
  );

  async function speak(text: string) {
    try {
      isSpeakingRef.current = true;
      const r = await fetch(
        `/api/zuri/tts/say?text=${encodeURIComponent(text)}`
      );
      if (!r.ok) throw new Error("TTS failed");
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        await audioRef.current.play();
        audioRef.current.onended = () => {
          isSpeakingRef.current = false;
        };
      } else {
        isSpeakingRef.current = false;
      }
    } catch (e) {
      isSpeakingRef.current = false;
      console.warn("speak() failed", e);
    }
  }

  async function appendAIStep(text: string, followupHint?: string) {
    try {
      await fetch(
        `/api/zuri/sessions/${encodeURIComponent(
          sessionId
        )}/append-step?t=${encodeURIComponent(token)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qText: text, followupHint, source: "ai" }),
        }
      );
    } catch (e) {
      console.warn("append-step failed", e);
    }
  }

  async function sendAnswer(answer: string) {
    const payload = {
      sessionId,
      token,
      jobContext,
      resumeSummary,
      history: historyForTurn,
      answer,
    } as any;
    const r = await fetch("/api/zuri/bedrock/turn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j?.ok) throw new Error(j?.error || "turn failed");
    const nextText: string = (j.next?.text || "").trim();
    if (nextText) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: nextText },
      ]);
      appendAIStep(nextText, (j.next?.followups || [])[0]);
      await speak(nextText);
    }
  }

  // Join Chime + start camera + STT
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(
          `/api/chime/join?sessionId=${encodeURIComponent(
            sessionId
          )}&token=${encodeURIComponent(token)}`
        );
        const j = await res.json();
        if (!j?.ok) throw new Error(j?.error || "join failed");

        await joinMeeting(j.meetingData);
        if (!mounted) return;

        try {
          await startLocalVideo(videoRef.current);
          setCameraError(null);
        } catch (e) {
          console.warn("Camera start failed", e);
          setCameraError("Unable to access camera. Click to retry.");
        }
        if (!mounted) return;

        setIsConnected(true);

        const s = await getMicStream();
        setMicStream(s);
        await startTranscription();

        // Try to bind content share tiles to the share PiP when present
        try {
          const av: any = audioVideo as any;
          av?.addObserver?.({
            videoTileDidUpdate: (tile: any) => {
              if (!tile?.tileId) return;
              if (tile?.isContent && shareVideoRef.current) {
                try {
                  av.bindVideoElement?.(tile.tileId, shareVideoRef.current);
                } catch {}
              }
            },
          });
        } catch {}
      } catch (err) {
        console.error("LivePane init error:", err);
      }
    })();

    return () => {
      mounted = false;
      try {
        stopLocalVideo();
      } catch {}
      try {
        stopTranscription();
      } catch {}
      if (tRef.current) clearInterval(tRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, token]);

  // Start the clock only when everything is ready (connected + STT running + greeted OR greeting failed)
  useEffect(() => {
    if (ready) return;
    if (isConnected && isTranscribing && hasWelcomed) {
      setReady(true);
      tRef.current = setInterval(
        () => setTimer((t) => (t > 0 ? t - 1 : 0)),
        1000
      );
    }
    return () => {
      if (!ready && tRef.current) clearInterval(tRef.current);
    };
  }, [isConnected, isTranscribing, hasWelcomed, ready]);

  // Greeting (TTS) once connected and ASR running; suppress ASR echo while it plays
  useEffect(() => {
    if (!isConnected || !isTranscribing || hasWelcomed) return;
    (async () => {
      try {
        await appendAIStep(initialQuestion);
        const greeting = `Welcome to your interview for ${companyName}. ${initialQuestion}`;
        await speak(greeting);
      } catch (e) {
        console.warn("TTS greeting failed.", e);
      } finally {
        setHasWelcomed(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, isTranscribing, hasWelcomed]);

  function stopAllAv() {
    try {
      stopTranscription();
    } catch {}
    try {
      stopLocalVideo();
    } catch {}
    try {
      (audioVideo as any)?.stopContentShare?.();
    } catch {}
    try {
      (audioVideo as any)?.stopLocalVideoTile?.();
    } catch {}
    try {
      (audioVideo as any)?.stopVideoInput?.();
    } catch {}
    try {
      (audioVideo as any)?.stop?.();
    } catch {}
    if (videoRef.current) {
      try {
        videoRef.current.srcObject = null;
      } catch {}
    }
  }

  // End interview when timer hits zero
  useEffect(() => {
    if (timer > 0 || endedRef.current) return;
    endedRef.current = true;
    (async () => {
      stopAllAv();
      try {
        await fetch(
          `/api/zuri/sessions/${encodeURIComponent(
            sessionId
          )}/finalize?t=${encodeURIComponent(token)}`,
          { method: "POST" }
        );
      } catch (e) {
        console.error("finalize failed", e);
      }
      try {
        router.push("/interviewer/start");
      } catch {}
    })();
  }, [timer, audioVideo, router, sessionId, token, stopTranscription]);

  async function endInterviewNow() {
    if (endedRef.current) return;
    endedRef.current = true;
    stopAllAv();
    try {
      await fetch(
        `/api/zuri/sessions/${encodeURIComponent(
          sessionId
        )}/finalize?t=${encodeURIComponent(token)}`,
        { method: "POST" }
      );
    } catch (e) {
      console.error("finalize failed", e);
    }
    try {
      router.push("/interviewer/start");
    } catch {}
  }

  // Minimal content share toggles
  async function startShare() {
    try {
      (audioVideo as any)?.startContentShareFromScreenCapture?.();
      setIsSharing(true);
    } catch (e) {
      console.warn("start share failed", e);
    }
  }
  function stopShare() {
    try {
      (audioVideo as any)?.stopContentShare?.();
      setIsSharing(false);
    } catch {}
  }
  return (
    <main className="relative mx-auto w-full max-w-5xl px-4 pb-10">
      <audio ref={audioRef} />

      {/* Minimal header: end/share/timer */}
      <div className="absolute right-4 top-4 flex items-center gap-2 z-20">
        <button
          onClick={() => setShowEndModal(true)}
          className="px-3 py-1 rounded bg-slate-800 text-xs hover:bg-slate-700 border border-slate-700"
        >
          End
        </button>
        <button
          onClick={isSharing ? stopShare : startShare}
          className="px-3 py-1 rounded bg-slate-800 text-xs hover:bg-slate-700 border border-slate-700"
        >
          {isSharing ? "Stop Share" : "Share Screen"}
        </button>
        <div className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-200">
          {Math.floor(timer / 60)
            .toString()
            .padStart(2, "0")}
          :{(timer % 60).toString().padStart(2, "0")}
        </div>
      </div>

      {/* Main content: AI messages and live transcript */}
      <SectionCard dark={dark}>
        <div className="min-h-[60vh] p-2">
          <div className="text-sm text-slate-400 mb-3">
            {companyName || "Equatoria • Zuri"} • AI Interviewer
          </div>
          <div className="mb-4 rounded-xl overflow-hidden border border-slate-800 aspect-video bg-slate-900 grid place-items-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-4 mb-6">
            {messages.map((msg, i) => (
              <div key={i} className="text-lg whitespace-pre-wrap">
                {msg.content}
              </div>
            ))}
          </div>
          {currentTranscript && (
            <div className="text-base text-slate-300 italic">
              {currentTranscript}
            </div>
          )}
        </div>
      </SectionCard>

      {/* Bottom-left PiP: screen share + self */}
      <div className="fixed bottom-4 left-4 z-30">
        <video
          ref={shareVideoRef}
          autoPlay
          playsInline
          muted
          className="w-56 h-32 rounded-lg border border-slate-700 bg-slate-900 object-cover"
        />
      </div>

      {/* Connecting overlay */}
      {(!isConnected || !isTranscribing || !hasWelcomed) && (
        <div className="absolute inset-0 grid place-items-center bg-slate-950/70 z-40">
          <div className="flex items-center gap-3 text-slate-200">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
            <span>Connecting to your interview�</span>
          </div>
        </div>
      )}

      {/* End Interview Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60">
          <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-4 text-slate-100">
            <div className="text-lg font-semibold mb-2">End Interview?</div>
            <div className="text-sm text-slate-300 mb-4">
              Your recruiter may prefer you complete the full time. You can
              still end now.
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowEndModal(false)}
                className="px-3 py-1 rounded bg-slate-800 border border-slate-700 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowEndModal(false);
                  await endInterviewNow();
                }}
                className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-sm"
              >
                End Now
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
