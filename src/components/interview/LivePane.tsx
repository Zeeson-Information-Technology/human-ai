"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
// import { SectionCard } from "@/components/interview/atoms";
import { useChimeClient } from "@/lib/use-chime";
import { useTranscribe } from "@/lib/use-transcribe";
import { useTurnQueue } from "@/components/interview/useTurnQueue";
import type { ZuriHistoryTurn } from "@/lib/zuri-transport";
import { ScreenShare } from "@/components/interview/steps/screen-share";
import AvatarSpeaking from "@/components/interview/AvatarSpeaking";
import { BRAND_FULL } from "@/lib/brand";
import { useInterviewTimer } from "@/components/interview/timer/useInterviewTimer";
import { TimerBadge } from "@/components/interview/timer/TimerBadge";
import { PreBriefOverlay } from "@/components/modal/PreBriefOverlay";
import { EntireScreenEnforcementModal } from "@/components/modal/EntireScreenEnforcementModal";
import { RequireShareModal } from "@/components/modal/RequireShareModal";
import { ResumeModal } from "@/components/modal/ResumeModal";
import { ConnectingOverlay } from "@/components/modal/ConnectingOverlay";
import { EndInterviewModal } from "@/components/modal/EndInterviewModal";

type LivePaneProps = {
  dark?: boolean;
  companyName?: string;
  initialQuestion: string;
  sessionId: string;
  token: string;
  jobContext?: string;
  resumeSummary?: string;
  primarySkill?: string;
  onConnected?: () => void;
};

export default function LivePane({
  dark = false,
  companyName = BRAND_FULL,
  initialQuestion,
  sessionId,
  token,
  jobContext = "",
  resumeSummary = "",
  primarySkill = "",
  onConnected,
}: LivePaneProps) {
  const INTERVIEW_DURATION_MS = 7 * 60 * 1000 + 30 * 1000;
  const tRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();
  const endedRef = useRef(false);

  const [messages, setMessages] = useState<
    Array<{ role: "assistant" | "user"; content: string }>
  >([]);

  const [isConnected, setIsConnected] = useState(false);
  const [hasWelcomed, setHasWelcomed] = useState(false);
  const [ready, setReady] = useState(false); // when to start the clock
  const isSpeakingRef = useRef(false); // suppress ASR while TTS playing
  const lastAiSpokeAtRef = useRef(0);
  const bufferedAnswerRef = useRef<string>("");
  const debounceFlushRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showEndModal, setShowEndModal] = useState(false);
  const [pendingAnswer, setPendingAnswer] = useState("");
  const [showPrebrief, setShowPrebrief] = useState(true);
  const [showResume, setShowResume] = useState(false);
  const [shareSurface, setShareSurface] = useState<string>("unknown");
  const autoShareTriedRef = useRef(false);
  const [speaking, setSpeaking] = useState(false);
  const [micLevel, setMicLevel] = useState(0); // 0..1 mic visual

  // Local video (self), optional screen share PiP, and audio for TTS
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const shareVideoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamId, setSelectedCamId] = useState<string>("");

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
      // Filter out very short/noisy finals to prevent spurious turns
      const isShort = text.length < 5;
      const hasEndPunct = /[.!?]$/.test(text);
      const hasSpace = /\s/.test(text);
      if (isShort && !hasEndPunct && !hasSpace) {
        return;
      }
      setMessages((prev) => [...prev, { role: "user", content: text }]);
      // Debounced endpointing: accumulate finals and flush after pause
      const endPunct = /[.!?]$/;
      if (bufferedAnswerRef.current) {
        bufferedAnswerRef.current +=
          (endPunct.test(bufferedAnswerRef.current) ? " " : " ") + text;
      } else {
        bufferedAnswerRef.current = text;
      }
      if (debounceFlushRef.current) clearTimeout(debounceFlushRef.current);
      debounceFlushRef.current = setTimeout(() => {
        // Delay send if AI is speaking or within grace window
        const tryFlush = () => {
          if (isSpeakingRef.current) {
            debounceFlushRef.current = setTimeout(tryFlush, 300);
            return;
          }
          const sinceAi = Date.now() - (lastAiSpokeAtRef.current || 0);
          if (sinceAi < 600) {
            debounceFlushRef.current = setTimeout(tryFlush, 600 - sinceAi);
            return;
          }
          const ans = (bufferedAnswerRef.current || "").trim();
          if (!ans) return;
          bufferedAnswerRef.current = "";
          enqueueTurn({ history: historyForTurn, answer: ans });
        };
        tryFlush();
      }, 1200);
    },
  });

  const historyForTurn: ZuriHistoryTurn[] = useMemo(() => {
    return messages.map((m) => ({
      role: (m.role === "assistant" ? "assistant" : "user") as ZuriHistoryTurn["role"],
      content: m.content,
    }));
  }, [messages]);

  const { enqueueTurn } = useTurnQueue({
    sessionId,
    token,
    jobContext,
    resumeSummary,
    onAssistant: async (text: string, followups?: string[]) => {
      const t = (text || "").trim();
      if (!t) return;
      setMessages((prev) => [...prev, { role: "assistant", content: t }]);
      try {
        await appendAIStep(t, followups?.[0]);
      } catch {}
      await speak(t);
    },
  });

  // Trigger queued turn when we have a fresh final transcript
  useEffect(() => {
    const t = (pendingAnswer || "").trim();
    if (!t) return;
    enqueueTurn({ history: historyForTurn, answer: t });
    setPendingAnswer("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAnswer]);

  // Mic visualizer (VU meter) from active mic stream
  useEffect(() => {
    if (!micStream) return;
    let raf = 0;
    let ctx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = ctx.createMediaStreamSource(micStream);
      analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const loop = () => {
        analyser!.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        const avg = sum / (data.length * 255);
        setMicLevel(avg);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    } catch {
      // ignore visualizer errors
    }
    return () => {
      if (raf) cancelAnimationFrame(raf);
      try {
        ctx?.close();
      } catch {}
    };
  }, [micStream]);

  async function speak(text: string) {
    try {
      isSpeakingRef.current = true;
      setSpeaking(true);
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), 7000);
      const r = await fetch(
        `/api/zuri/tts/say?text=${encodeURIComponent(text)}`,
        { signal: ctrl.signal }
      ).catch((e) => {
        throw e;
      });
      clearTimeout(to);
      if (!r.ok) throw new Error("TTS failed");
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        await audioRef.current.play();
        audioRef.current.onended = () => {
          isSpeakingRef.current = false;
          lastAiSpokeAtRef.current = Date.now();
          setSpeaking(false);
        };
      } else {
        isSpeakingRef.current = false;
        lastAiSpokeAtRef.current = Date.now();
        setSpeaking(false);
      }
    } catch (e) {
      isSpeakingRef.current = false;
      lastAiSpokeAtRef.current = Date.now();
      console.warn("speak() failed", e);
      setSpeaking(false);
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

  // Join Chime + start camera (bind to main until share) + STT
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
          const av: any = audioVideo as any;
          let bound = false;
          // Prefer normal Chime device flow
          try {
            const cams = await av?.listVideoInputDevices?.();
            const cam = cams?.[0];
            if (cam) {
              await av?.chooseVideoInputDevice?.(cam.deviceId ?? cam);
              const tileId: number = av?.startLocalVideoTile?.();
              if (tileId != null && videoRef.current) {
                av?.bindVideoElement?.(tileId, videoRef.current);
                bound = true;
              }
            }
          } catch {}
          // Fallback: capture preview and pass stream to Chime
          if (!bound) {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false,
            });
            if (videoRef.current) {
              try {
                (videoRef.current as HTMLVideoElement).srcObject = stream;
                await (videoRef.current as HTMLVideoElement)
                  .play()
                  .catch(() => {});
              } catch {}
            }
            try {
              await av?.chooseVideoInputDevice?.(stream as any);
              const tileId2: number = av?.startLocalVideoTile?.();
              if (tileId2 != null && videoRef.current) {
                av?.bindVideoElement?.(tileId2, videoRef.current);
              }
            } catch {}
          }
          setCameraError(null);
        } catch (e) {
          console.warn("Camera start failed", e);
          setCameraError("Unable to access camera. Click to retry.");
        }
        if (!mounted) return;

        setIsConnected(true);
        try {
          onConnected?.();
        } catch {}

        const s = await getMicStream();
        setMicStream(s);
        // Moved ASR start to beginInterview() so it starts on user gesture
        // Ensure we have a live mic stream for visualizer even if Chime path fails
        try {
          if (!s) {
            let fallback = await getMicStream();
            if (!fallback) {
              fallback = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false,
              });
            }
            if (fallback) setMicStream(fallback);
          }
        } catch {}

        // Bind tiles from Chime updates (self and content)
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
              if (!tile?.isContent && tile?.localTile && videoRef.current) {
                try {
                  av.bindVideoElement?.(tile.tileId, videoRef.current);
                } catch {}
              }
            },
            contentShareDidStop: () => {
              try {
                setIsSharing(false);
                setShareSurface("unknown");
              } catch {}
            },
          });
        } catch {}
        // Auto-start content share if pre-authorized in the wizard
        try {
          const pre = ScreenShare.get();
          if (pre && (audioVideo as any)?.startContentShare) {
            const track = pre.getVideoTracks?.()[0];
            const settings = (track?.getSettings?.() ||
              {}) as MediaTrackSettings & { displaySurface?: string };
            setShareSurface(String(settings.displaySurface || "unknown"));
            if (String(settings.displaySurface) === "monitor") {
              (audioVideo as any)?.startContentShare?.(pre);
              setIsSharing(true);
              try {
                await startLocalVideo(videoRef.current);
              } catch {}
            }
          }
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
      try {
        localStorage.removeItem(`zuri_resume:${sessionId}`);
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, token]);

  // Populate camera devices
  useEffect(() => {
    (async () => {
      try {
        const av: any = audioVideo as any;
        if (!av) return;
        const cams: MediaDeviceInfo[] =
          (await av.listVideoInputDevices?.()) || [];
        setVideoDevices(cams);
        if (cams.length && !selectedCamId)
          setSelectedCamId(cams[0].deviceId || "");
      } catch {}
    })();
  }, [audioVideo, selectedCamId]);

  async function switchCamera(camId: string) {
    try {
      setSelectedCamId(camId);
      const av: any = audioVideo as any;
      if (!av) return;
      await av.chooseVideoInputDevice?.(camId);
      const tileId: number = av.startLocalVideoTile?.();
      if (tileId != null && videoRef.current)
        av.bindVideoElement?.(tileId, videoRef.current);
    } catch (e) {
      console.warn("switchCamera failed", e);
    }
  }

  // Timer: dedicated hook, finalize on expiry
  const {
    remainingMs,
    start: startTimer,
    stop: stopTimer,
    reset: resetTimer,
  } = useInterviewTimer({
    durationMs: INTERVIEW_DURATION_MS,
    onExpire: async () => {
      if (endedRef.current) return;
      endedRef.current = true;
      try {
        stopAllAv();
      } catch {}
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
        router.push("/zuri/start");
      } catch {}
    },
    tickMs: 250,
  });

  // Explicit starter to ensure timer begins right after user clicks Start
  function startTimerOnce() {
    if (ready) return;
    setReady(true);
    startTimer();
  }

  // Failsafe: if welcomed is set but timer hasn't started, kick it off
  useEffect(() => {
    if (hasWelcomed && !ready) {
      startTimerOnce();
    }
  }, [hasWelcomed, ready]);

  // Resume guard flag and beforeunload
  useEffect(() => {
    try {
      const k = `zuri_resume:${sessionId}`;
      const existing = localStorage.getItem(k);
      if (existing) setShowResume(true);
      localStorage.setItem(k, String(Date.now()));
    } catch {}
  }, [sessionId]);
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  // Attempt to auto-open share picker on landing (may be blocked by browser; falls back to overlay)
  useEffect(() => {
    (async () => {
      if (isConnected && !isSharing && !autoShareTriedRef.current) {
        autoShareTriedRef.current = true;
        try {
          await startShare();
        } catch {
          // user gesture likely required; overlay provides button
        }
      }
    })();
  }, [isConnected, isSharing]);

  async function beginInterview() {
    // Require entire-screen share before starting
    if (!isSharing || String(shareSurface) !== "monitor") {
      try {
        await startShare();
      } catch {}
      return;
    }
    // Hide pre-brief and start the timer immediately on Start
    setHasWelcomed(true);
    setShowPrebrief(false);
    startTimerOnce();
    // Start ASR on user gesture to avoid blocking the pre-brief
    try {
      await startTranscription();
    } catch {}
    try {
      // Record the initial question server-side
      await appendAIStep(initialQuestion);
      // Render the AI's first question immediately (no TTS blocking)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: initialQuestion },
      ]);
      // Fire-and-forget a short spoken welcome to reduce latency risk
      const greeting = `Welcome to your interview for ${companyName}.`;
      speak(greeting);
    } catch (e) {
      console.warn("TTS greeting failed.", e);
    }
  }

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

  // Legacy safety: clear any leftover interval on unmount
  useEffect(() => {
    return () => {
      try {
        if (tRef.current) clearInterval(tRef.current);
      } catch {}
    };
  }, []);

  async function endInterviewNow() {
    if (endedRef.current) return;
    endedRef.current = true;
    try {
      stopTimer();
    } catch {}
    try {
      if (tRef.current) {
        clearInterval(tRef.current);
        tRef.current = null;
      }
    } catch {}
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
      router.push("/zuri/start");
    } catch {}
  }

  // Cleanup on unmount to avoid interval leaks
  useEffect(() => {
    return () => {
      try {
        if (tRef.current) clearInterval(tRef.current);
      } catch {}
    };
  }, []);

  // Minimal content share toggles
  async function startShare() {
    try {
      const stream: MediaStream = await (
        navigator.mediaDevices as any
      ).getDisplayMedia({
        video: {
          displaySurface: "monitor",
          monitorTypeSurfaces: "all",
          surfaceSwitching: "include",
        } as any,
        audio: false,
      });
      const track = stream.getVideoTracks?.()[0];
      const settings = (track?.getSettings?.() || {}) as MediaTrackSettings & {
        displaySurface?: string;
      };
      setShareSurface(String(settings.displaySurface || "unknown"));
      if (String(settings.displaySurface) !== "monitor") {
        try {
          stream.getTracks().forEach((t) => t.stop());
        } catch {}
        setIsSharing(false);
        return;
      }
      (audioVideo as any)?.startContentShare?.(stream);
      setIsSharing(true);
      try {
        await startLocalVideo(videoRef.current);
      } catch {}
    } catch (e) {
      console.warn("start share failed", e);
    }
  }
  function stopShare() {
    try {
      (audioVideo as any)?.stopContentShare?.();
      setIsSharing(false);
      setShareSurface("unknown");
      try {
        // Rebind local camera to PiP after stopping share
        startLocalVideo(videoRef.current);
      } catch {}
    } catch {}
  }
  return (
    <main className="relative mx-auto w-full max-w-5xl px-4 pb-10">
      <audio ref={audioRef} />

      {/* Minimal header: end/share/timer */}
      <div className="absolute right-4 top-4 flex items-center gap-2 z-20">
        <button
          onClick={() => setShowEndModal(true)}
          className="px-4 py-2 rounded-md bg-rose-600 text-sm hover:bg-rose-500 
          border border-rose-700 text-white cursor-pointer"
        >
          End
        </button>
        {(!isSharing || shareSurface !== "monitor") && (
          <button
            onClick={
              isSharing
                ? async () => {
                    stopShare();
                    await startShare();
                  }
                : startShare
            }
            className="px-3 py-1 rounded bg-slate-800 text-xs hover:bg-slate-700 
            border border-slate-700 cursor-pointer"
          >
            {isSharing && shareSurface !== "monitor"
              ? "Re-share Screen"
              : "Share Screen"}
          </button>
        )}
        {/* Camera selector removed to keep candidates focused during interview */}
      </div>
      {/* Meet-style tiles: AI (left) · Candidate (right) */}
      <div className="mx-auto w-full max-w-5xl min-h-[65vh] py-8 grid place-items-center">
        <div className="w-[min(90vw,1000px)] grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* AI interviewer tile */}
          <div className="relative aspect-video rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <AvatarSpeaking speaking={speaking} size={88} />
              <div className="px-4 text-base md:text-lg text-slate-200 text-center max-w-xl whitespace-pre-wrap">
                {messages
                  .filter((m) => m.role === "assistant")
                  .slice(-1)
                  .map((msg, i) => (
                    <span key={i}>{msg.content}</span>
                  ))}
              </div>
            </div>
          </div>
          {/* Candidate tile (self video) */}
          <div className="relative aspect-video rounded-xl border border-slate-800 bg-black overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {cameraError && (
              <div className="absolute inset-0 grid place-items-center bg-slate-950/60 text-slate-200 text-sm">
                <div>
                  {cameraError}
                  <div className="mt-2 text-center">
                    <button
                      onClick={() => startLocalVideo(videoRef.current)}
                      className="px-3 py-1 rounded bg-slate-800 border border-slate-700 text-xs"
                    >
                      Retry camera
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Bottom-left: countdown timer (camera preview hidden by design) */}
      <div className="fixed bottom-4 left-4 z-60">
        <TimerBadge remainingMs={remainingMs} />
      </div>

      {/* Pre-brief overlay (shows after join; ASR starts on Start click) */}
      {isConnected && showPrebrief && (
        <PreBriefOverlay
          companyName={companyName}
          isSharing={isSharing}
          shareSurface={shareSurface}
          onStartShare={startShare}
          onStartInterview={beginInterview}
        />
      )}

      {/* Entire-screen enforcement overlay */}
      {isSharing && shareSurface !== "monitor" && (
        <EntireScreenEnforcementModal
          onReshare={async () => {
            stopShare();
            await startShare();
          }}
        />
      )}

      {/* Must be sharing after interview starts */}
      {hasWelcomed && !isSharing && <RequireShareModal onShare={startShare} />}

      {/* Resume overlay */}
      {showResume && <ResumeModal onContinue={() => setShowResume(false)} />}

      {/* Connecting overlay */}
      {!isConnected && <ConnectingOverlay />}

      {/* End Interview Modal */}
      {showEndModal && (
        <EndInterviewModal
          onCancel={() => setShowEndModal(false)}
          onEndNow={async () => {
            setShowEndModal(false);
            await endInterviewNow();
          }}
        />
      )}
    </main>
  );
}
