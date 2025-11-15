import type { ZuriTurnPayload, ZuriTurnResponse } from "@/lib/zuri-transport";

export async function bedrockTurn(payload: ZuriTurnPayload): Promise<ZuriTurnResponse> {
  // retry 429
  let attempt = 0;
  while (true) {
    const r = await fetch("/api/zuri/bedrock/turn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (r.status !== 429 || attempt >= 3) {
      const j = (await r.json().catch(() => ({}))) as ZuriTurnResponse;
      return j;
    }
    await new Promise((res) =>
      setTimeout(res, 400 * Math.pow(2, attempt) + Math.random() * 200)
    );
    attempt++;
  }
}

// Streaming variant: calls /api/zuri/bedrock/stream and emits deltas via onDelta.
export async function bedrockTurnStream(
  payload: ZuriTurnPayload,
  onDelta: (chunk: string) => void
): Promise<{ ok: boolean; text: string; error?: string }> {
  try {
    const r = await fetch("/api/zuri/bedrock/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok || !r.body) {
      const errTxt = await r.text().catch(() => "stream failed");
      return { ok: false, text: "", error: errTxt };
    }
    const reader = r.body.getReader();
    const dec = new TextDecoder();
    let full = "";
    let sawErrorPrefix = false;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value && value.length) {
        const s = dec.decode(value, { stream: true });
        if (s) {
          full += s;
          const start = full.trimStart();
          if (!sawErrorPrefix && start.startsWith("[error]")) {
            sawErrorPrefix = true;
            // Suppress emitting error text to UI; continue reading to finish
            continue;
          }
          // Suppress JSON scaffolding during stream; defer clean question to final
          const chunkTrim = s.trimStart();
          if (chunkTrim.startsWith("{") || /"text"\s*:\s*"/i.test(chunkTrim)) {
            continue;
          }
          onDelta(s);
        }
      }
    }
    if (sawErrorPrefix) {
      const cleaned = full.replace(/^\s*\[error\]\s*/i, "").trim();
      return { ok: false, text: "", error: cleaned || "stream error" };
    }
    // If the provider returned a JSON wrapper like {"text":"...","followups":[]}, extract .text
    const trimmed = full.trim();
    if (/^\{[\s\S]*\}$/.test(trimmed)) {
      try {
        const obj = JSON.parse(trimmed);
        if (obj && typeof obj.text === "string") {
          return { ok: true, text: String(obj.text || "").trim() };
        }
      } catch {}
    }
    return { ok: true, text: full };
  } catch (e: any) {
    return { ok: false, text: "", error: e?.message || "stream error" };
  }
}
