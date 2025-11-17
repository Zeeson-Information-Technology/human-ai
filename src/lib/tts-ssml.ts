// src/lib/tts-ssml.ts
// Build light SSML from plain text for more natural pacing

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function splitSentences(text: string): string[] {
  const t = (text || "").trim();
  if (!t) return [];
  // Split on sentence enders, keeping the punctuation
  const parts = t
    .split(/(?<=[.!?])\s+/)
    .map((x) => x.trim())
    .filter(Boolean);
  // If we have no punctuation at all, fall back to chunking by ~140 chars
  if (parts.length <= 1 && t.length > 160) {
    const chunks: string[] = [];
    let i = 0;
    const n = t.length;
    const max = 140;
    while (i < n) {
      chunks.push(t.slice(i, Math.min(i + max, n)));
      i += max;
    }
    return chunks;
  }
  return parts;
}

export function buildSSML(text: string, opts?: { rate?: string; breakMs?: number }) {
  const rate = opts?.rate || "medium"; // slow | medium | fast
  const br = Math.max(120, Math.min(800, opts?.breakMs ?? 260));
  const sentences = splitSentences(text);
  const inner = sentences
    .map((s) => `<s>${escapeXml(s)}</s>`)
    .join(` <break time="${br}ms"/> `);
  return `<speak><prosody rate="${rate}">${inner}</prosody></speak>`;
}

export function splitForSpeak(text: string): string[] {
  return splitSentences(text);
}

