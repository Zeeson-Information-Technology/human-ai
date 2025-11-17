// src/app/api/zuri/chat/route.ts
// Streaming chat endpoint for Zuri interviews using the Vercel AI SDK.
import { streamText } from "ai";
import type { NextRequest } from "next/server";
import dbConnect from "@/lib/db-connect";
import Session from "@/model/session";
import { Job } from "@/model/job";
import {
  chooseProviderName,
  getModelForProvider,
  isThrottleOrQuota,
} from "@/lib/llm/provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool" | "function" | "data";
  content: string;
};

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = (await req.json().catch(() => ({}))) as {
      sessionId?: string;
      token?: string;
      jobContext?: string;
      resumeSummary?: string;
      messages?: ChatMessage[];
    };

    const {
      sessionId,
      token,
      jobContext = "",
      resumeSummary = "",
      messages = [],
    } = body || {};

    if (!sessionId || !token) {
      return new Response("Missing session", { status: 400 });
    }

    // Auth: session + token
    const session = await Session.findOne(
      {
        _id: sessionId,
        $or: [
          { token },
          { "meta.accessToken": token },
          { "meta.token": token },
        ],
      },
      { _id: 1, jobCode: 1 }
    ).lean();

    if (!session) {
      return new Response("Not found", { status: 404 });
    }

    // Optional job enrichment (AI guide + rubric hints)
    let aiGuide = "";
    let rubricHints = "";
    if (session.jobCode) {
      const job = await Job.findOne({ code: session.jobCode }).lean();
      if (job) {
        if (job.aiMatchGuide) aiGuide = String(job.aiMatchGuide);
        if (Array.isArray(job.rubricOverride) && job.rubricOverride.length) {
          rubricHints = job.rubricOverride
            .map(
              (r: any) =>
                `- ${r.label} (weight ${r.weight}/100): ${r.description || ""}`
            )
            .join("\n");
        }
      }
    }

    const sys = `You are Zuri, a fair and professional interviewer.
Ask concise, conversational questions, one at a time. Use resume and job context. Avoid bias.
Your output must be exactly one short question ending with a question mark ("?") and nothing else.
Do not include multiple questions, follow-ups, lists, or commentary. No greetings or filler.
If the candidate asks a question, answer briefly and then output exactly one new question.`;

    const ctxParts: string[] = [];
    if (jobContext) ctxParts.push(`Job Context:\n${jobContext}`);
    if (rubricHints) ctxParts.push(`Rubric hints:\n${rubricHints}`);
    if (resumeSummary) ctxParts.push(`Resume Summary:\n${resumeSummary}`);
    if (aiGuide) ctxParts.push(`Customization (admin guide):\n${aiGuide}`);
    const ctx = ctxParts.join("\n\n");

    const systemPrompt =
      ctx.length > 0 ? `${sys}\n\n${ctx}` : sys;

    const providerName = chooseProviderName();
    const model = getModelForProvider(providerName);

    if (process.env.NODE_ENV !== "production") {
      console.log("[zuri/chat] request", {
        providerName,
        sessionId,
        messagesCount: messages.length,
      });
    }

    const chatMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages
        .map((m) => ({
          role: m.role,
          content: (m.content || "").toString(),
        }))
        .filter(
          (m) =>
            m.content &&
            (m.role === "user" ||
              m.role === "assistant" ||
              m.role === "system")
        ),
    ];

    const result = await streamText({
      // Cast to any to avoid LanguageModelV1/V2 type mismatch in types; runtime is fine.
      model: model as any,
      messages: chatMessages,
      maxTokens: 280,
      temperature: 0.5,
    });

    return result.toAIStreamResponse();
  } catch (e: any) {
    console.error("[zuri/chat] error", e);
    const msg = isThrottleOrQuota(e)
      ? "Model rate limit or quota exceeded. Please wait a moment and try again."
      : e?.message || "Server error";
    return new Response(`[error] ${msg}`, { status: 500 });
  }
}
