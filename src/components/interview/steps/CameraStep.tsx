"use client";
import { useEffect, useRef, useState } from "react";
import { SectionCard, PrimaryButton } from "@/components/interview/atoms";

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
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [previewReady, setPreviewReady] = useState(false);

  useEffect(() => {
    // Load devices
    navigator.mediaDevices
      ?.enumerateDevices?.()
      .then((list) => {
        const cams = (list || []).filter((d) => d.kind === "videoinput");
        setDevices(cams);
        if (cams.length && !selected) setSelected(cams[0].deviceId || "");
      })
      .catch(() => {});
  }, [selected]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    setPreviewReady(false);
    if (active) {
      const constraints: MediaStreamConstraints = {
        video: selected ? { deviceId: { exact: selected } } : true,
        audio: false,
      };
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current
              .play()
              .then(() => setPreviewReady(true))
              .catch(() => setPreviewReady(true));
          }
        })
        .catch(() => {
          setError("Could not access camera. Please allow camera access.");
          setPreviewReady(false);
        });
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [active, selected]);

  return (
    <SectionCard dark={dark}>
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-xl font-semibold mb-2">Camera Check</h2>
        <p className="text-slate-400 mb-2">
          Please enable your camera to continue. You should see yourself below.
        </p>
        <div className="rounded-xl border bg-black overflow-hidden w-full max-w-xs aspect-video flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ background: "#000" }}
          />
        </div>
        {error && (
          <div className="text-red-500 text-sm mt-2">{error}</div>
        )}
        <div className="flex gap-3 mt-4 items-center">
          {devices.length > 0 && (
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="text-xs bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
              title="Select camera"
            >
              {devices.map((d, idx) => (
                <option key={d.deviceId || idx} value={d.deviceId || ""}>
                  {d.label || `Camera ${idx + 1}`}
                </option>
              ))}
            </select>
          )}
          {!active ? (
            <PrimaryButton dark={dark} onClick={() => setActive(true)}>
              Enable Camera
            </PrimaryButton>
          ) : (
            <PrimaryButton
              dark={dark}
              onClick={onContinue}
              disabled={!previewReady}
              className={!previewReady ? "opacity-50 cursor-not-allowed" : ""}
              title={!previewReady ? "Wait for camera preview" : undefined}
            >
              Continue
            </PrimaryButton>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
