// components/interview/steps/ScreenStep.tsx
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  SectionCard,
  PrimaryButton,
  GhostButton,
} from "@/components/interview/atoms";
import { ScreenShare } from "@/components/interview/steps/screen-share";

type DisplayMediaStreamConstraints = MediaStreamConstraints & {
  video?:
    | boolean
    | (MediaTrackConstraints & {
        displaySurface?: "application" | "browser" | "monitor" | "window";
        preferCurrentTab?: boolean;
        // Chrome >=124 proposals; harmless on older
        surfaceSwitching?: "exclude" | "include";
        monitorTypeSurfaces?: "all" | "windowed";
      });
  audio?:
    | boolean
    | (MediaTrackConstraints & { suppressLocalAudioPlayback?: boolean });
};

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
  const streamRef = useRef<MediaStream | null>(null);

  const [displaySurface, setDisplaySurface] = useState<
    "monitor" | "window" | "browser" | "application" | "unknown"
  >("unknown");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const requestScreen = useCallback(
    async (forceEntire = false) => {
      setErrorMsg("");
      try {
        // If forceEntire=true, request "monitor" explicitly.
        // Otherwise, nudge user toward entire screen but allow them to pick.
        const constraints: DisplayMediaStreamConstraints = {
          video: forceEntire
            ? ({
                displaySurface: "monitor",
                monitorTypeSurfaces: "all",
                surfaceSwitching: "include",
              } as any)
            : ({ preferCurrentTab: true, surfaceSwitching: "include" } as any),
          audio: false,
        };

        const scr = await (navigator.mediaDevices as any).getDisplayMedia(
          constraints
        );
        streamRef.current = scr;
        ScreenShare.set(scr);

        const track = scr.getVideoTracks()[0];
        if (track) {
          const settings = (track.getSettings?.() ||
            {}) as MediaTrackSettings & { displaySurface?: string };
          const surface = (settings.displaySurface || "unknown") as any;
          setDisplaySurface(surface);

          // If user stops from Chrome UI:
          track.addEventListener("ended", () => {
            setScreenOK(false);
            ScreenShare.stop();
            streamRef.current = null;
          });
        }

        // Gate continue: only accept Entire screen (monitor) or Window
        if (trackOkForProctoring(scr)) {
          setScreenOK(true);
        } else {
          setScreenOK(false);
          setErrorMsg(
            "Please select “Entire screen” (recommended) or “Window”. “This tab” is not supported for proctoring in Chrome."
          );
          // auto-clean the wrong pick so the Continue button stays disabled
          try {
            scr.getTracks().forEach((t: MediaStreamTrack) => t.stop());
          } catch {}
          ScreenShare.set(null);
          streamRef.current = null;
        }
      } catch (e) {
        setScreenOK(false);
        ScreenShare.stop();
        streamRef.current = null;
      }
    },
    [setScreenOK]
  );

  // Do not stop tracks on unmount; let user/browser end it.
  useEffect(() => {
    return () => {
      // no-op
    };
  }, []);

  const hint = useMemo(() => {
    if (displaySurface === "browser") {
      return "Tip: “This tab” may break during interview steps. Choose “Entire screen” for a stable experience.";
    }
    return null;
  }, [displaySurface]);

  return (
    <>
      <h1 className="text-3xl font-semibold mt-8 mb-2">Share your screen</h1>
      <p className="text-slate-400 mb-4">
        For stable proctoring, please select{" "}
        <span className="font-semibold">Entire screen</span>. You can stop
        anytime.
      </p>

      <SectionCard dark={dark}>
        <div className="flex items-center justify-between gap-4">
          <div className="text-slate-300 space-y-1">
            <div>
              {screenOK
                ? "Screen-share permission granted ✅"
                : "Permission pending…"}
            </div>
            {hint && <div className="text-xs text-amber-300/90">{hint}</div>}
            {errorMsg && (
              <div className="text-xs text-rose-300/90">{errorMsg}</div>
            )}
          </div>
          <div className="flex gap-3">
            {/* <GhostButton dark={dark} onClick={() => requestScreen(false)}>
              Request permission
            </GhostButton> */}
            <GhostButton
              dark={dark}
              onClick={() => requestScreen(true)}
              title="Skip picker hint and demand Entire screen"
            >
              Share Entire screen
            </GhostButton>
            <PrimaryButton
              dark={dark}
              disabled={!screenOK || !ScreenShare.isActive()}
              onClick={onContinue}
              title={
                !screenOK || !ScreenShare.isActive()
                  ? "Grant screen access first"
                  : undefined
              }
            >
              Continue
            </PrimaryButton>
          </div>
        </div>
      </SectionCard>
    </>
  );
}

// Accept only Entire screen (monitor) for reliability.
function trackOkForProctoring(stream: MediaStream) {
  const t = stream.getVideoTracks()[0];
  if (!t) return false;
  const s = (t.getSettings?.() || {}) as MediaTrackSettings & {
    displaySurface?: string;
  };
  const surface = (s.displaySurface || "unknown") as string;
  return surface === "monitor";
}
