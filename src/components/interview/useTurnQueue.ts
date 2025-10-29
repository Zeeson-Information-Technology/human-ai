import { useRef } from "react";
import { bedrockTurn } from "./services/bedrockTurn";
import type { ZuriHistoryTurn, ZuriTurnResponse } from "@/lib/zuri-transport";

export function useTurnQueue({
  sessionId,
  token,
  jobContext,
  resumeSummary,
  onAssistant,
}: {
  sessionId: string;
  token: string;
  jobContext?: string;
  resumeSummary?: string;
  onAssistant: (text: string, followups?: string[]) => void;
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
    } finally {
      inFlightRef.current = false;
      cooldownRef.current = true;
      // Align with server minGap (2500ms) to avoid bursts
      setTimeout(() => (cooldownRef.current = false), 2500);
    }
  }

  return { enqueueTurn };
}
