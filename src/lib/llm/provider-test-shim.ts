// src/lib/llm/provider-test-shim.ts
// Lightweight shim for tests that don't need real AI SDK providers.
import { z } from "zod";

export const InterviewTurnSchema = z.object({
  text: z
    .string()
    .describe(
      "The question to ask the candidate. Keep it concise and conversational."
    ),
  followups: z
    .array(z.string())
    .optional()
    .describe("A few follow-up questions the AI can ask later."),
  endInterview: z
    .boolean()
    .optional()
    .describe("Set to true if the interview should end."),
});

export type InterviewTurn = z.infer<typeof InterviewTurnSchema>;

export function isThrottleOrQuota(e: unknown) {
  const msg = String(
    (e as { message?: string } | undefined)?.message || e || ""
  );
  return /throttling|too many requests|quota|rate/i.test(msg);
}

export function chooseProviderName(): "bedrock" | "google" {
  const p = (process.env.LLM_PROVIDER || "bedrock").toLowerCase();
  return p === "google" ? "google" : "bedrock";
}

