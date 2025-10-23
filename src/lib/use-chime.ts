// src/lib/use-chime.ts
import { useEffect, useRef, useState } from "react";
import {
  ConsoleLogger,
  DefaultDeviceController,
  DefaultMeetingSession,
  LogLevel,
  MeetingSessionConfiguration,
  type AudioVideoFacade,
} from "amazon-chime-sdk-js";

type MeetingData = {
  Meeting: any;
  Attendee: any;
};

export function useChimeClient() {
  const [meetingSession, setMeetingSession] =
    useState<DefaultMeetingSession | null>(null);
  const [audioVideo, setAudioVideo] = useState<AudioVideoFacade | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const deviceController = useRef<DefaultDeviceController | null>(null);
  const localTileIdRef = useRef<number | null>(null);

  /** Join the meeting and start audio subsystem */
  async function joinMeeting(meetingData: MeetingData) {
    try {
      const logger = new ConsoleLogger("ChimeSDK", LogLevel.INFO);

      // correct construction order
      if (!deviceController.current) {
        deviceController.current = new DefaultDeviceController(logger);
      }

      const configuration = new MeetingSessionConfiguration(
        meetingData.Meeting,
        meetingData.Attendee
      );

      const session = new DefaultMeetingSession(
        configuration,
        logger,
        deviceController.current
      );

      setMeetingSession(session);
      setAudioVideo(session.audioVideo);

      const av: any = session.audioVideo;

      // pick default mic
      const mics = await av.listAudioInputDevices?.();
      const mic = mics?.[0];
      if (mic) await av.chooseAudioInputDevice?.(mic.deviceId ?? mic);

      // start audio
      await av.start?.();
    } catch (err) {
      setError(err as Error);
      console.error("Failed to join meeting:", err);
      throw err;
    }
  }

  /** Start local camera and bind to a <video> element */
  async function startLocalVideo(videoEl: HTMLVideoElement | null) {
    if (!audioVideo) return;
    const av: any = audioVideo;

    const cams = await av.listVideoInputDevices?.();
    const cam = cams?.[0];
    if (cam) await av.chooseVideoInputDevice?.(cam.deviceId ?? cam);

    const tileId: number = av.startLocalVideoTile?.();
    localTileIdRef.current = tileId;
    if (videoEl && tileId != null) av.bindVideoElement?.(tileId, videoEl);
  }

  /** Stop local camera */
  function stopLocalVideo() {
    try {
      const av: any = audioVideo;
      av?.stopLocalVideoTile?.();
      if (localTileIdRef.current != null) {
        av?.unbindVideoElement?.(localTileIdRef.current);
      }
      localTileIdRef.current = null;
    } catch {
      /* noop */
    }
  }

  /** Retrieve the active mic MediaStream (for STT) */
  async function getMicStream(): Promise<MediaStream | null> {
    try {
      const av: any = audioVideo;
      const s: MediaStream | undefined =
        await av?.deviceController?.acquireAudioInputStream?.();
      return s ?? null;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    return () => {
      try {
        stopLocalVideo();
        const av: any = audioVideo;
        av?.stop?.();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingSession]);

  return {
    meetingSession,
    audioVideo,
    error,
    joinMeeting,
    startLocalVideo,
    stopLocalVideo,
    getMicStream,
  };
}
