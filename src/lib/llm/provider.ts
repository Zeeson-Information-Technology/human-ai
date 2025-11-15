// src/lib/llm/provider.ts
// Unified provider for Zuri interview turns using Vercel AI SDK
import { streamObject, generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
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

function getGoogleModel() {
  const apiKey =
    process.env.GOOGLE_GENAI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey && process.env.NODE_ENV !== "production") {
    console.warn(
      "[llm] Missing GOOGLE_GENAI_API_KEY / GOOGLE_GENERATIVE_AI_API_KEY; Google provider will fail."
    );
  }

  const google = createGoogleGenerativeAI({ apiKey });
  const modelId =
    process.env.GEMINI_MODEL_ID || "google/gemini-1.5-flash-latest";
  return google(modelId);
}

// Kept for compatibility, but we only use Google in this project.
export function chooseProviderName(): "bedrock" | "google" {
  const p = (process.env.LLM_PROVIDER || "google").toLowerCase();
  return p === "bedrock" ? "bedrock" : "google";
}

// Single-provider implementation: always return the Google model, regardless of
// the provider name. This avoids a hard dependency on @ai-sdk/bedrock.
export function getModelForProvider(_provider: "bedrock" | "google") {
  return getGoogleModel();
}

export async function generateTurn(prompt: string): Promise<InterviewTurn> {
  if (process.env.NODE_ENV !== "production") console.log("[llm] google");
  const { object } = await generateObject({
    // Cast to any to avoid LanguageModelV1/V2 type mismatch in types.
    model: getGoogleModel() as any,
    prompt,
    schema: InterviewTurnSchema,
    maxTokens: 280,
    temperature: 0.5,
  });
  return object as InterviewTurn;
}

export async function streamTurn(prompt: string) {
  if (process.env.NODE_ENV !== "production") console.log("[llm] google");
  return await streamObject({
    // Cast to any to avoid LanguageModelV1/V2 type mismatch in types.
    model: getGoogleModel() as any,
    prompt,
    schema: InterviewTurnSchema,
    maxTokens: 280,
    temperature: 0.5,
  });
}

// Backwards-compat alias used by older /api/zuri/bedrock/turn route.
// It returns a JSON string with { text, followups } to match the
// expected shape in that handler.
export async function generateWithProvider(prompt: string): Promise<string> {
  const obj = await generateTurn(prompt);
  return JSON.stringify({
    text: obj.text,
    followups: obj.followups ?? [],
    endInterview: obj.endInterview ?? false,
  });
}
