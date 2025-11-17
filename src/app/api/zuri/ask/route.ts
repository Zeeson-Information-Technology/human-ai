// Server: returns a stream of { nextQuestion, followupHint?, rubric? }
import { NextResponse } from "next/server";
import { z } from "zod";
import { streamObject } from "ai";
import { getModelForProvider } from "@/lib/llm/provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  nextQuestion: z.string().min(5),
  followupHint: z.string().optional(),
  rubric: z
    .object({
      focusArea: z.string().optional(),
      whatGoodLooksLike: z.string().optional(),
    })
    .optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const {
    jdText,
    focusAreas = [],
    transcript = [],
    lastAnswerText = "",
    language = "en",
  } = body;

  const result = await streamObject({
    // Cast to any to avoid LanguageModelV1/V2 type mismatch; runtime is fine.
    model: getModelForProvider("google") as any,
    schema,
    system: [
      "You are Zuri, a structured, fair interviewer.",
      "Ask exactly ONE concise question at a time.",
      "Be accent-fair and content-focused. Keep tone warm but neutral.",
      `Interview language: ${language}.`,
    ].join("\n"),
    prompt: [
      `JOB DESCRIPTION:\n${jdText}\n`,
      `FOCUS AREAS: ${focusAreas.join(", ") || "—"}`,
      `TRANSCRIPT SO FAR (Q/A pairs): ${JSON.stringify(transcript).slice(
        0,
        6000
      )}`,
      lastAnswerText ? `CANDIDATE LAST ANSWER:\n${lastAnswerText}` : "",
      "Return the next best question. If you've covered a focus area, move to the next.",
    ].join("\n\n"),
  });

  return result.toTextStreamResponse();
}
