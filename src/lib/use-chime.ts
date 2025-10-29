// src/lib/use-chime.ts
import { useEffect, useRef, useState } from "react";
import {
  ConsoleLogger,
  DefaultDeviceController,
  DefaultMeetingSession,
  MeetingSessionConfiguration,
  LogLevel,
  VideoTileState,
  MeetingSessionStatusCode,
  type AudioVideoFacade,
  type AudioVideoObserver,
  type MeetingSessionStatus,
} from "amazon-chime-sdk-js";

/**
 * Lightweight useChimeClient shim for local preview + mic stream.
 * - joinMeeting(meetingData) is a no-op placeholder (server join is handled elsewhere).
 * - startLocalVideo(videoEl) binds navigator.mediaDevices.getUserMedia({video}) to the element.
 * - stopLocalVideo() stops local camera.
 * - getMicStream() returns a live audio MediaStream for VU meter / transcription.
 *
 * This keeps the candidate preview + mic VU working in the browser while server-side
 * or AWS/Chime integration is implemented/confirmed.
 */
export function useChimeClient() {
  const [meetingSession, setMeetingSession] =
    useState<DefaultMeetingSession | null>(null);
  const [audioVideo, setAudioVideo] = useState<AudioVideoFacade | null>(null);
  const [localTileId, setLocalTileId] = useState<number | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  // Join meeting and create session
  async function joinMeeting(meetingData: {
    Meeting: unknown;
    Attendee: unknown;
  }) {
    const logger = new ConsoleLogger("ChimeLogs", LogLevel.ERROR);
    const deviceController = new DefaultDeviceController(logger);

    const config = new MeetingSessionConfiguration(
      meetingData.Meeting,
      meetingData.Attendee
    );
    const session = new DefaultMeetingSession(config, logger, deviceController);
    setMeetingSession(session);
    setAudioVideo(session.audioVideo);
    // Start audio with small backoff and attach an observer to retry on capacity
    const av = session.audioVideo;
    let starting = false;
    async function startWithRetry() {
      if (starting) return;
      starting = true;
      let attempt = 0;
      while (attempt < 3) {
        try {
          await av.start?.();
          break;
        } catch (e: unknown) {
          attempt++;
          const msg = String(
            (e as { message?: string } | undefined)?.message || ""
          );
          if (
            /AudioCallAtCapacity|capacity|unavailable|media host/i.test(msg) &&
            attempt < 3
          ) {
            try {
              await av.stop?.();
            } catch {}
            const wait =
              800 * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 300);
            logger.warn(
              `Chime start failed (capacity). Retrying in ${wait}ms...`
            );
            await new Promise((r) => setTimeout(r, wait));
            continue;
          }
        }
      }
      starting = false;
    }
    try {
      await startWithRetry();
    } catch {}

    // Observer to retry when audio stops due to capacity
    const observer: AudioVideoObserver = {
      audioVideoDidStop: (sessionStatus: MeetingSessionStatus) => {
        try {
          const code =
            typeof sessionStatus?.statusCode === "function"
              ? sessionStatus.statusCode()
              : undefined;
          if (code === MeetingSessionStatusCode.AudioCallAtCapacity) {
            logger.warn("Audio at capacity; retrying start...");
            startWithRetry();
          }
        } catch {}
      },
      videoTileDidUpdate: (tileState: VideoTileState) => {
        // maintain compatibility with existing video handling
      },
    };
    try {
      session.audioVideo.addObserver(observer);
    } catch {}
    return session;
  }

  // Start local video and bind to element
  async function startLocalVideo(videoEl?: HTMLVideoElement | null) {
    if (!audioVideo) return;
    await audioVideo.startLocalVideoTile();
    const localTile = audioVideo.getLocalVideoTile();
    const tileId = localTile
      ? typeof (localTile as any).tileId === "function"
        ? (localTile as any).tileId()
        : typeof (localTile as any).state === "function"
        ? (localTile as any).state().tileId
        : undefined
      : undefined;
    setLocalTileId(tileId ?? null);
    if (videoEl && tileId != null) {
      audioVideo.bindVideoElement(tileId, videoEl);
    }
  }

  // Stop local video
  async function stopLocalVideo() {
    if (audioVideo) {
      audioVideo.stopLocalVideoTile();
    }
    setLocalTileId(null);
  }

  // Get mic stream (Chime manages this internally, but for VU meter you can use getUserMedia)
  async function getMicStream() {
    return await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
  }

  // Stop mic stream (for VU meter only)
  async function stopMicStream() {
    // No-op for Chime SDK, but you can stop your own VU meter stream if needed
  }

  // Bind local video tile to a <video> element (call this in your component)
  function bindLocalVideoElement(videoEl: HTMLVideoElement) {
    if (audioVideo && localTileId) {
      audioVideo.bindVideoElement(localTileId, videoEl);
    }
    videoElementRef.current = videoEl;
  }

  // Listen for tile updates and re-bind if needed
  useEffect(() => {
    if (!audioVideo) return;
    const observer = {
      videoTileDidUpdate: (tileState: VideoTileState) => {
        if (
          tileState.localTile &&
          tileState.boundVideoElement &&
          tileState.tileId
        ) {
          setLocalTileId(tileState.tileId);
        }
      },
    };
    audioVideo.addObserver(observer);
    return () => {
      audioVideo.removeObserver(observer);
    };
  }, [audioVideo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLocalVideo();
      stopMicStream();
    };
    // eslint-disable-next-line
  }, []);

  return {
    joinMeeting,
    startLocalVideo,
    stopLocalVideo,
    getMicStream,
    stopMicStream,
    bindLocalVideoElement,
    audioVideo,
    meetingSession,
    videoElementRef,
    localTileId,
  };
}
