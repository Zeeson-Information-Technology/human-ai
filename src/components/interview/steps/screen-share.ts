// components/interview/screen-share.ts
let screenStream: MediaStream | null = null;

export const ScreenShare = {
  get(): MediaStream | null {
    return screenStream;
  },
  set(s: MediaStream | null) {
    screenStream = s;
  },
  stop() {
    try {
      screenStream?.getTracks().forEach((t) => t.stop());
    } catch {}
    screenStream = null;
  },
  isActive(): boolean {
    return (
      !!screenStream &&
      screenStream.getVideoTracks().some((t) => t.readyState === "live")
    );
  },
};
