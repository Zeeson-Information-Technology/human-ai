// Server: returns { nextQuestion, followupHint?, rubric? }
import { NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

export const runtime = "nodejs";

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

  const { object } = await generateObject({
    model: google("gemini-2.5-flash"),
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

  return NextResponse.json({ ok: true, ...object });
}
