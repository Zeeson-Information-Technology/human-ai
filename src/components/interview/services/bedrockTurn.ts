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
