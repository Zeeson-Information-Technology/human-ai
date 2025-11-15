// src/app/api/zuri/interview/route.ts
import { NextRequest } from "next/server";
import dbConnect from "@/lib/db-connect";
import Session from "@/model/session";
import { Job } from "@/model/job";
import { buildTurnPrompt } from "@/lib/llm/prompt";
import { streamTurn } from "@/lib/llm/provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json().catch(() => ({}));
    const {
      sessionId,
      token,
      jobContext = "",
      resumeSummary = "",
      history = [],
      answer = "",
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

    // Optional job enrichment
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
                `- ${r.label} (weight ${r.weight}/100): ${
                  r.description || ""
                }`
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

    const prompt = buildTurnPrompt({
      sys,
      jobContext,
      resumeSummary,
      aiGuide,
      rubricHints,
      history,
      answer,
    });

    // Simple per-session lock + light rate limit
    const g: any = globalThis as any;
    if (!g.__zuriTurnLimiter) g.__zuriTurnLimiter = new Map<string, number>();
    if (!g.__zuriTurnLock) g.__zuriTurnLock = new Map<string, boolean>();
    const limiter: Map<string, number> = g.__zuriTurnLimiter;
    const locks: Map<string, boolean> = g.__zuriTurnLock;
    const sKey = String(sessionId);

    async function acquireLock(key: string) {
      while (locks.get(key)) {
        await new Promise((r) => setTimeout(r, 50));
      }
      locks.set(key, true);
    }
    function releaseLock(key: string) {
      try {
        locks.delete(key);
      } catch {}
    }

    await acquireLock(sKey);
    try {
      const now = Date.now();
      const last = limiter.get(sKey) || 0;
      const minGap = 1500;
      if (now - last < minGap) {
        await new Promise((r) => setTimeout(r, minGap - (now - last)));
      }

      const result = await streamTurn(prompt);
      limiter.set(sKey, Date.now());

      return result.toTextStreamResponse();
    } finally {
      releaseLock(sKey);
    }
  } catch (e: any) {
    console.error("[interview/route] error", e);
    const msg = /on-demand throughput isn’t supported/i.test(e?.message || "")
      ? "Bedrock model requires an Inference Profile. Set BEDROCK_INFERENCE_PROFILE_ARN in env."
      : e?.message || "Server error";
    return new Response(`[error] ${msg}`, { status: 500 });
  }
}
