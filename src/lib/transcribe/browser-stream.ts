// Lightweight browser helper to stream mic audio to Amazon Transcribe Streaming over WebSocket
// and parse AWS event-stream responses to surface interim/final transcripts.
// This expects you to connect to a presigned URL that includes language-code, media-encoding, sample-rate, session-id.

export type TranscriptHandler = (opts: {
  alternatives: string[];
  isFinal: boolean;
}) => void;

export type StartOptions = {
  presignedUrl: string;
  mediaMime?: string; // e.g., 'audio/ogg; codecs=opus'
  chunkMs?: number; // MediaRecorder timeslice
  onTranscript?: TranscriptHandler;
};

// Attempt to import the event stream codec from v3 packages
type EventHeader = { type: string; value: string };
type EventMessage = {
  headers?: Record<string, EventHeader>;
  body?: Uint8Array;
};
interface EventStreamCodecLike {
  encode(input: {
    headers: Record<string, EventHeader>;
    body: Uint8Array;
  }): Uint8Array;
  decode(buf: Uint8Array): EventMessage | EventMessage[];
}

async function loadEventStreamCodec(): Promise<EventStreamCodecLike | null> {
  try {
    // New smithy codec
    const mod = await import("@smithy/eventstream-codec");
    const utf8 = await import("@smithy/util-utf8");
    // Constructor expects (toUtf8: Uint8Array -> string, fromUtf8: string -> Uint8Array)
    return new mod.EventStreamCodec(
      utf8.toUtf8,
      utf8.fromUtf8
    ) as unknown as EventStreamCodecLike;
  } catch {}
  try {
    // Legacy aws-sdk v3 codec
    // @ts-expect-error legacy optional dependency type
    const mod = await import("@aws-sdk/eventstream-codec");
    const utf8 = await import("@aws-sdk/util-utf8-browser");
    return new mod.EventStreamCodec(
      utf8.toUtf8,
      utf8.fromUtf8
    ) as unknown as EventStreamCodecLike;
  } catch {}
  return null;
}

export async function startTranscribeStreaming(opts: StartOptions) {
  const {
    presignedUrl,
    mediaMime = "audio/ogg; codecs=opus",
    chunkMs = 250,
    onTranscript,
  } = opts;
  if (!navigator.mediaDevices || !("MediaRecorder" in window))
    throw new Error("Media APIs unavailable");

  const codec = await loadEventStreamCodec();
  if (!codec)
    throw new Error(
      "AWS event-stream codec not available. Install @smithy/eventstream-codec or @aws-sdk/eventstream-codec"
    );
  const esCodec: EventStreamCodecLike = codec;

  const ws = new WebSocket(presignedUrl);
  ws.binaryType = "arraybuffer";

  const mic = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });
  const mr = new MediaRecorder(mic, {
    mimeType: mediaMime,
  } as MediaRecorderOptions);

  function wrapAudioEvent(bytes: Uint8Array) {
    const headers: Record<string, EventHeader> = {
      ":message-type": { type: "string", value: "event" },
      ":event-type": { type: "string", value: "AudioEvent" },
      ":content-type": { type: "string", value: "application/octet-stream" },
    };
    return esCodec.encode({ headers, body: bytes });
  }

  function parseIncoming(buf: ArrayBuffer) {
    try {
      const messages = esCodec.decode(new Uint8Array(buf));
      const msgArr = Array.isArray(messages) ? messages : [messages];
      for (const msg of msgArr) {
        const h = msg.headers || {};
        const evt = h[":event-type"]?.value || "";
        const ct = h[":content-type"]?.value || "";
        if (evt === "TranscriptEvent" && ct === "application/json") {
          const jsonStr = new TextDecoder().decode(msg.body);
          const data = JSON.parse(jsonStr);
          const results = data?.Transcript?.Results || [];
          for (const r of results) {
            type Alt = { Transcript?: string };
            const alts = (r.Alternatives || [])
              .map((a: Alt) => a.Transcript)
              .filter(Boolean) as string[];
            const isFinal = r.IsPartial === false || r.IsFinal === true;
            if (alts.length && onTranscript)
              onTranscript({ alternatives: alts, isFinal });
          }
        }
      }
    } catch {
      // ignore
    }
  }

  let opened = false;
  ws.onopen = () => {
    opened = true;
    mr.start(chunkMs);
  };
  ws.onmessage = (ev) => parseIncoming(ev.data as ArrayBuffer);
  ws.onerror = () => {};
  ws.onclose = () => {
    try {
      if (mr.state !== "inactive") mr.stop();
    } catch {}
    try {
      mic.getTracks().forEach((t) => t.stop());
    } catch {}
  };

  mr.ondataavailable = async (evt) => {
    if (!opened || !evt.data || evt.data.size === 0) return;
    try {
      const raw = new Uint8Array(await evt.data.arrayBuffer());
      const framed = wrapAudioEvent(raw);
      ws.send(framed);
    } catch {}
  };

  return {
    stop: () => {
      try {
        if (mr.state !== "inactive") mr.stop();
      } catch {}
      try {
        mic.getTracks().forEach((t) => t.stop());
      } catch {}
      try {
        ws.close();
      } catch {}
    },
  };
}
