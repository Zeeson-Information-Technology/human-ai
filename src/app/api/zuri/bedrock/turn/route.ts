// POST /api/zuri/bedrock/turn
// Body: { sessionId, token, jobContext?, resumeSummary?, history: Array<{role:'user'|'assistant', content:string}>, answer: string }

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Session from "@/model/session";
import { Job } from "@/model/job";
import { generateWithProvider } from "@/lib/llm/provider";
import { buildTurnPrompt } from "@/lib/llm/prompt";

async function callBedrock(prompt: string) {
  // If you have an Inference Profile, prefer it (required for many Anthropic SKUs now).
  const modelId = process.env.BEDROCK_MODEL_ID || "";
  const profileArn = process.env.BEDROCK_INFERENCE_PROFILE_ARN || "";

  if (!modelId && !profileArn) {
    throw new Error(
      "BEDROCK_MODEL_ID or BEDROCK_INFERENCE_PROFILE_ARN must be set"
    );
  }

  const { bedrockRuntime } = await import("@/lib/aws-bedrock");
  const client = await bedrockRuntime();
  const { InvokeModelCommand } = await import(
    "@aws-sdk/client-bedrock-runtime"
  );

  // Anthropic (messages API) over Bedrock
  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 400,
    temperature: 0.5,
    messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
  });

  const input: any = {
    contentType: "application/json",
    accept: "application/json",
    body,
  };

  // ✅ Use inference profile when provided (fixes: ValidationException: on-demand isn’t supported)
  if (profileArn) {
    input.inferenceProfileArn = profileArn;
  } else {
    input.modelId = modelId;
  }

  // ✅ Guardrail belongs on the request (not inside the body)
  if (process.env.BEDROCK_GUARDRAIL_ID) {
    input.guardrailConfig = {
      guardrailIdentifier: process.env.BEDROCK_GUARDRAIL_ID!,
      guardrailVersion: process.env.BEDROCK_GUARDRAIL_VERSION || "1",
    };
  }

  // Dev-only logging of selection
  if (process.env.NODE_ENV !== "production") {
    try {
      console.log("[bedrock] invoke", {
        modelId: (input as any).modelId || null,
        inferenceProfileArn: (input as any).inferenceProfileArn || null,
      });
    } catch {}
  }

  const res = await client.send(new InvokeModelCommand(input));

  const json = res.body
    ? JSON.parse(new TextDecoder().decode(res.body as Uint8Array))
    : {};
  const text: string = json?.content?.[0]?.text || "";
  return text;
}

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
      return NextResponse.json(
        { ok: false, error: "Missing session" },
        { status: 400 }
      );
    }

    // auth: session + token
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
    if (!session)
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 }
      );

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
                `- ${r.label} (weight ${r.weight}/100): ${r.description || ""}`
            )
            .join("\n");
        }
      }
    }

    const sys = `You are Zuri, a fair and professional interviewer.
Ask concise, conversational questions, one at a time. Use resume and job context. Avoid bias.
Keep responses natural; do not start with fillers like "Certainly.", "Sure.", or "Of course.".
If the candidate asks a question, answer briefly and steer back. Do not continue speaking if the candidate is silent; wait for their reply.`;

    const prompt = buildTurnPrompt({
      sys,
      jobContext,
      resumeSummary,
      aiGuide,
      rubricHints,
      history,
      answer,
    });

    // Rate-limit per session (server-side lock) + retry on throttling
    const g: any = globalThis as any;
    if (!g.__zuriTurnLimiter) g.__zuriTurnLimiter = new Map<string, number>();
    if (!g.__zuriTurnLock) g.__zuriTurnLock = new Map<string, boolean>();
    const limiter: Map<string, number> = g.__zuriTurnLimiter;
    const locks: Map<string, boolean> = g.__zuriTurnLock;
    const sKey = String(sessionId);

    async function acquireLock(key: string) {
      // simple spin-wait; serialized per session
      while (locks.get(key)) {
        await new Promise((r) => setTimeout(r, 60));
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
      const minGap = 2500; // ms between invokes per session
      if (now - last < minGap) {
        await new Promise((r) => setTimeout(r, minGap - (now - last)));
      }

      // Provider-level fallback + backoff is handled inside generateWithProvider
      const raw = await generateWithProvider(prompt);
      limiter.set(sKey, Date.now());
      
      let next = { text: (raw || "").trim(), followups: [] as string[] };
      try {
        const j = JSON.parse(raw);
        if (j && typeof j.text === "string") next.text = j.text.trim();
        if (Array.isArray(j.followups)) next.followups = j.followups;
      } catch {
        // Try to extract embedded JSON object from mixed text
        const m = raw.match(/\{[\s\S]*\}/);
        if (m) {
          try {
            const j2 = JSON.parse(m[0]);
            if (j2 && typeof j2.text === "string") next.text = j2.text.trim();
            if (Array.isArray(j2.followups)) next.followups = j2.followups;
          } catch {
            // keep raw
          }
        }
      }

      return NextResponse.json({ ok: true, next }, { status: 200 });
    } finally {
      releaseLock(sKey);
    }
  } catch (e: any) {
    console.error("bedrock/turn error", e);
    const msg = /on-demand throughput isn’t supported/i.test(e?.message || "")
      ? "Bedrock model requires an Inference Profile. Set BEDROCK_INFERENCE_PROFILE_ARN in env."
      : e?.message || "Server error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
