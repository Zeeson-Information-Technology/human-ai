import { useRef } from "react";
import { bedrockTurn, bedrockTurnStream } from "./services/bedrockTurn";
import type { ZuriHistoryTurn, ZuriTurnResponse } from "@/lib/zuri-transport";

export function useTurnQueue({
  sessionId,
  token,
  jobContext,
  resumeSummary,
  onAssistant,
  onAssistantStream,
}: {
  sessionId: string;
  token: string;
  jobContext?: string;
  resumeSummary?: string;
  onAssistant: (text: string, followups?: string[]) => void;
  onAssistantStream?: (delta: string) => void;
}) {
  const cooldownRef = useRef(false);
  const inFlightRef = useRef(false);
  const lastHashRef = useRef("");

  function hashText(s: string) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return String(h);
  }

  async function enqueueTurn({
    history,
    answer,
  }: {
    history: ZuriHistoryTurn[];
    answer: string;
  }) {
    const t = (answer || "").trim();
    if (!t) return;

    const h = hashText(t);
    if (h === lastHashRef.current || cooldownRef.current || inFlightRef.current)
      return;

    inFlightRef.current = true;
    try {
      if (onAssistantStream) {
        let full = "";
        const { ok, text, error } = await bedrockTurnStream(
          { sessionId, token, jobContext, resumeSummary, history, answer: t },
          (delta) => {
            full += delta;
            try { onAssistantStream(delta); } catch {}
          }
        );
        if (!ok) throw new Error(error || "turn failed");
        lastHashRef.current = h;
        if (full.trim()) onAssistant(full.trim());
      } else {
        const { ok, next, error } = (await bedrockTurn({
          sessionId,
          token,
          jobContext,
          resumeSummary,
          history,
          answer: t,
        })) as ZuriTurnResponse;
        if (!ok) throw new Error(error || "turn failed");
        lastHashRef.current = h;
        if (next?.text) onAssistant(next.text, next.followups);
      }
    } finally {
      inFlightRef.current = false;
      cooldownRef.current = true;
      // Align with server minGap (2500ms) to avoid bursts
      setTimeout(() => (cooldownRef.current = false), onAssistantStream ? 1500 : 2500);
    }
  }

  return { enqueueTurn };
}
