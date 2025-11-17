// POST /api/zuri/bedrock/stream
// Streams partial AI text from Bedrock (Anthropic) using InvokeModelWithResponseStream
// Body: { sessionId, token, jobContext?, resumeSummary?, history: [{role,content}], answer }

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import dbConnect from "@/lib/db-connect";
import Session from "@/model/session";
import { Job } from "@/model/job";
import { buildTurnPrompt } from "@/lib/llm/prompt";

async function clientBedrock() {
  const { bedrockRuntime } = await import("@/lib/aws-bedrock");
  return bedrockRuntime();
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json().catch(() => ({}));
  const { sessionId, token, jobContext = "", resumeSummary = "", history = [], answer = "" } = body || {};

  if (!sessionId || !token) {
    return new Response("Missing session", { status: 400 });
  }

  // Auth: session + token
  const session = await Session.findOne(
    { _id: sessionId, $or: [{ token }, { "meta.accessToken": token }, { "meta.token": token }] },
    { _id: 1, jobCode: 1 }
  ).lean();
  if (!session) return new Response("Not found", { status: 404 });

  // Optional job enrichment
  let aiGuide = "";
  let rubricHints = "";
  if (session.jobCode) {
    const job = await Job.findOne({ code: session.jobCode }).lean();
    if (job) {
      if (job.aiMatchGuide) aiGuide = String(job.aiMatchGuide);
      if (Array.isArray(job.rubricOverride) && job.rubricOverride.length) {
        rubricHints = job.rubricOverride
          .map((r: any) => `- ${r.label} (weight ${r.weight}/100): ${r.description || ""}`)
          .join("\n");
      }
    }
  }

  const sys = `You are Zuri, a fair and professional interviewer.
Ask concise, conversational questions, one at a time. Use resume and job context. Avoid bias.
Your output must be exactly one short question ending with a question mark ("?") and nothing else.
Do not include multiple questions, follow-ups, lists, or commentary. No greetings or filler.
If the candidate asks a question, answer briefly and then output exactly one new question.`;

  const prompt = buildTurnPrompt({ sys, jobContext, resumeSummary, aiGuide, rubricHints, history, answer });

  // Simple per-session lock + light rate limit, shared with non-stream route
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
    try { locks.delete(key); } catch {}
  }

  const stream = new ReadableStream<Uint8Array>({
    start: async (controller) => {
      const enc = new TextEncoder();
      try {
        await acquireLock(sKey);
        const now = Date.now();
        const last = limiter.get(sKey) || 0;
        const minGap = 1200; // slightly quicker than non-stream path
        if (now - last < minGap) await new Promise((r) => setTimeout(r, minGap - (now - last)));

        // Prepare Bedrock streaming command
        const client = await clientBedrock();
        const { InvokeModelWithResponseStreamCommand } = await import("@aws-sdk/client-bedrock-runtime");

        const modelId = process.env.BEDROCK_MODEL_ID || "";
        const profileArn = process.env.BEDROCK_INFERENCE_PROFILE_ARN || "";
        if (!modelId && !profileArn) {
          controller.enqueue(enc.encode("[error] Missing Bedrock model/profile\n"));
          controller.close();
          return;
        }

        const body = JSON.stringify({
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: 400,
          temperature: 0.5,
          messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
        });

        const input: any = { contentType: "application/json", accept: "application/json", body };
        if (profileArn) input.inferenceProfileArn = profileArn; else input.modelId = modelId;
        if (process.env.BEDROCK_GUARDRAIL_ID) {
          input.guardrailConfig = {
            guardrailIdentifier: process.env.BEDROCK_GUARDRAIL_ID!,
            guardrailVersion: process.env.BEDROCK_GUARDRAIL_VERSION || "1",
          };
        }

        const res: any = await client.send(new InvokeModelWithResponseStreamCommand(input));
        limiter.set(sKey, Date.now());

        // Stream parse Anthropic events: look for content_block_delta with delta.text
        for await (const event of res.body) {
          try {
            const bytes: Uint8Array | undefined = (event as any)?.chunk?.bytes;
            if (!bytes) continue;
            const jsonStr = new TextDecoder().decode(bytes);
            const obj = JSON.parse(jsonStr);
            const t = obj?.delta?.text || obj?.content_block_delta?.delta?.text || obj?.content_block?.text || "";
            if (t) controller.enqueue(enc.encode(t));
          } catch {
            // ignore malformed chunks
          }
        }
        controller.close();
      } catch (e: any) {
        try {
          controller.enqueue(new TextEncoder().encode(`[error] ${e?.message || "Server error"}`));
        } catch {}
        controller.close();
      } finally {
        releaseLock(sKey);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
