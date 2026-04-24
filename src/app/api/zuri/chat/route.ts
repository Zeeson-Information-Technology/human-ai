// src/app/api/zuri/chat/route.ts
// Streaming chat endpoint for Zuri interviews using the Vercel AI SDK.
import { streamText } from "ai";
import type { ModelMessage } from "ai";
import type { NextRequest } from "next/server";
import dbConnect from "@/lib/db-connect";
import Session from "@/model/session";
import { Job } from "@/model/opportunity";
import {
  chooseProviderName,
  getModelForProvider,
  isThrottleOrQuota,
} from "@/lib/llm/provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatMessageRole =
  | "system"
  | "user"
  | "assistant"
  | "tool"
  | "function"
  | "data";

type ChatMessage = {
  role: ChatMessageRole;
  content: string;
};

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    let body: {
      sessionId?: string;
      token?: string;
      jobContext?: string;
      resumeSummary?: string;
      messages?: ChatMessage[];
    };
    try {
      body = await req.json();
    } catch (e) {
      console.error("Failed to parse request body as JSON", e);
      return new Response("Invalid request body", { status: 400 });
    }

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

    let session;
    try {
      session = await Session.findOne(
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
    } catch (e) {
      console.error("Failed to query session from database", e);
      return new Response("Error querying session", { status: 500 });
    }

    if (!session) {
      return new Response("Not found", { status: 404 });
    }

    // Optional job enrichment (AI guide + rubric hints)
    let aiGuide = "";
    let rubricHints = "";
    let languageHint = "";
    if (session.jobCode) {
      let job;
      try {
        job = await Job.findOne({ code: session.jobCode }).lean();
      } catch (e) {
        console.error("Failed to query job from database", e);
        return new Response("Error querying job", { status: 500 });
      }
      if (job) {
        if (job.aiMatchGuide) aiGuide = String(job.aiMatchGuide);
        if (Array.isArray(job.rubricOverride) && job.rubricOverride.length) {
          type RubricItem = {
            label: string;
            weight: number;
            description?: string;
          };
          rubricHints = job.rubricOverride
            .map(
              (r: RubricItem) =>
                `- ${r.label} (weight ${r.weight}/100): ${r.description || ""}`
            )
            .join("\n");
        }
        if (Array.isArray(job.languages) && job.languages.length) {
          const languages = job.languages
            .map((lang: string) => String(lang || "").trim())
            .filter(Boolean);
          if (languages.length) {
            const primary = languages[0];
            const all = languages.join(", ");
            const isEnglish = /^en/i.test(primary || "");
            languageHint = isEnglish
              ? `Speak naturally in ${primary} and mirror the candidate's accent or dialect. If the candidate switches languages, follow their lead.`
              : `Default to ${primary} (allowed languages: ${all}). Only switch languages when the candidate switches, and mirror their tone.`;
          }
        }
      }
    }

    const systemPrompt = `You are Zuri, a fair and professional interviewer.
Ask concise, conversational questions, one at a time. Use resume and job context. Avoid bias.
Before each question you may include a very short acknowledgement (no more than six words) that references the candidate's previous answer (e.g., "Thanks for sharing."). Immediately follow it with exactly one concise question that ends with a question mark ("?"). Do not append extra sentences after the question, and never output multiple questions, lists, or filler.
If the candidate asks a question, respond with a single brief sentence and then continue with exactly one new question. Mirror the candidate's language and tone.

${jobContext ? `Job Context:\n${jobContext}\n\n` : ""}
${rubricHints ? `Rubric hints:\n${rubricHints}\n\n` : ""}
${resumeSummary ? `Resume Summary:\n${resumeSummary}\n\n` : ""}
${aiGuide ? `Customization (admin guide):\n${aiGuide}\n\n` : ""}
${languageHint ? `Language preference:\n${languageHint}` : ""}`;

    const providerName = chooseProviderName();
    const model = getModelForProvider(providerName);

    if (process.env.NODE_ENV !== "production") {
      console.log("[zuri/chat] request", {
        providerName,
        sessionId,
        messagesCount: messages.length,
      });
    }

    const chatMessages: ModelMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages
        .flatMap(
          (
            m
          ): Array<
            | { role: "user"; content: string }
            | { role: "assistant"; content: string }
            | { role: "system"; content: string }
          > => {
          const content = (m.content || "").toString();
          if (!content) return [];
          if (m.role === "user") return [{ role: "user" as const, content }];
          if (m.role === "assistant") {
            return [{ role: "assistant" as const, content }];
          }
          if (m.role === "system") return [{ role: "system" as const, content }];
          return [];
          }
        ),
    ];

    const result = await streamText({
      // TODO: The 'ai' package seems to have a code
      // LanguageModel interface. As a temporary workaround, we cast the model to 'any'.
      // This should be revisited when the 'ai' package is updated.
      model: model as any,
      messages: chatMessages,
      temperature: 0.5,
    });

    if (process.env.NODE_ENV !== "production") {
      console.log("[zuri/chat] success (stream starting)", {
        providerName,
        sessionId,
        messagesCount: chatMessages.length,
        preview: chatMessages.map((m) => ({
          role: m.role,
          content: (m.content || "").slice(0, 200),
        })),
      });
    }

    // Return UI message stream for @ai-sdk/react useChat (data protocol).
    return result.toUIMessageStreamResponse();
  } catch (e: any) {
    console.error("[zuri/chat] error", e);
    const msg = isThrottleOrQuota(e)
      ? "Model rate limit or quota exceeded. Please wait a moment and try again."
      : e?.message || "Server error";
    return new Response(`[error] ${msg}`, { status: 500 });
  }
}

