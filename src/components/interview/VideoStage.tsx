"use client";
import AvatarSpeaking from "@/components/interview/AvatarSpeaking";
import React from "react";

type Props = {
  speaking: boolean;
  latestText: string;
  videoRef: React.RefObject<HTMLVideoElement>;
  cameraError?: string | null;
  onRetryCamera?: () => void;
};

export default function VideoStage({
  speaking,
  latestText,
  videoRef,
  cameraError = null,
  onRetryCamera,
}: Props) {
  return (
    <div className="mx-auto w-full max-w-6xl py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AI interviewer tile */}
        <div className="relative aspect-video rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <AvatarSpeaking speaking={speaking} size={120} />
            <div className="px-4 text-base md:text-lg text-slate-200 text-center max-w-xl whitespace-pre-wrap">
              {latestText}
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
                    onClick={onRetryCamera}
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
  );
}

