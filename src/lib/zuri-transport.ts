export type ZuriHistoryTurn = { role: 'assistant' | 'user'; content: string };
export type ZuriTurnPayload = {
  sessionId: string;
  token: string;
  jobContext?: string;
  resumeSummary?: string;
  history: ZuriHistoryTurn[];
  answer: string;
};

export type ZuriTurnResponse = { ok: boolean; next?: { text: string; followups?: string[] }; error?: string };

export interface ZuriTurnTransport {
  sendTurn(payload: ZuriTurnPayload): Promise<ZuriTurnResponse>;
  close?(): void;
}

export class HttpTurnTransport implements ZuriTurnTransport {
  async sendTurn(payload: ZuriTurnPayload): Promise<ZuriTurnResponse> {
    const res = await fetch('/api/zuri/bedrock/turn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    type MaybeTurn = Partial<ZuriTurnResponse>;
    const j = (await res.json().catch(() => ({}))) as MaybeTurn;
    if (!res.ok || j.ok === false) return { ok: false, error: j?.error || 'Turn failed' };
    return j as ZuriTurnResponse;
  }
}

export class WsTurnTransport implements ZuriTurnTransport {
  private ws?: WebSocket;
  private url: string;
  constructor(url: string) {
    this.url = url;
  }
  async sendTurn(payload: ZuriTurnPayload): Promise<ZuriTurnResponse> {
    // Minimal shim: open, send, await single response, close. In prod, keep a persistent WS.
    return new Promise<ZuriTurnResponse>((resolve) => {
      try {
        const ws = new WebSocket(this.url);
        this.ws = ws;
        ws.onopen = () => ws.send(JSON.stringify({ type: 'turn', payload }));
        ws.onmessage = (ev: MessageEvent) => {
          try {
            const msg = JSON.parse(String(ev.data)) as Partial<ZuriTurnResponse>;
            if (msg?.ok) resolve(msg as ZuriTurnResponse);
            else {
              const m = msg as { error?: string } | null;
              resolve({ ok: false, error: (m && m.error) || 'WS error' });
            }
          } catch {
            resolve({ ok: false, error: 'Bad WS message' });
          } finally {
            ws.close();
          }
        };
        ws.onerror = () => resolve({ ok: false, error: 'WS error' });
      } catch (e: unknown) {
        const msg = (e as { message?: string } | undefined)?.message || 'WS init error';
        resolve({ ok: false, error: msg });
      }
    });
  }
  close() {
    try { this.ws?.close(); } catch {}
  }
}

export function createTurnTransport(): ZuriTurnTransport {
  // Switch to WS when API Gateway WebSocket is provisioned; env var can hold URL.
  const g = globalThis as unknown as { ZURI_WS_URL?: unknown };
  const url = (typeof g.ZURI_WS_URL === 'string' ? g.ZURI_WS_URL : undefined) || process.env.NEXT_PUBLIC_ZURI_WS_URL;
  if (typeof url === 'string' && url.startsWith('wss://')) return new WsTurnTransport(url);
  return new HttpTurnTransport();
}
