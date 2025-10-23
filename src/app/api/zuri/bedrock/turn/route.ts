// POST /api/zuri/bedrock/turn
// Body: { sessionId, token, jobContext?, resumeSummary?, history: Array<{role:'user'|'assistant', content:string}>, answer: string }

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Session from "@/model/session";
import { Job } from "@/model/job";

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
    temperature: 0.4,
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

    const sys = `You are Zuri, a fair and professional interviewer. Ask concise, conversational questions, one at a time. Use resume and job context. Avoid bias. Encourage clarifying questions. If the candidate asks a question, answer briefly and steer back.`;
    const customization = aiGuide
      ? `\nCustomization (admin guide):\n${aiGuide}`
      : "";
    const rubric = rubricHints ? `\nRubric hints:\n${rubricHints}` : "";
    const ctx = `Job Context:\n${jobContext}${rubric}\n\nResume Summary:\n${resumeSummary}${customization}`;

    const turns = history
      .map(
        (h: any) =>
          `${h.role === "assistant" ? "Interviewer" : "Candidate"}: ${
            h.content
          }`
      )
      .join("\n");

    const prompt =
      `${sys}\n\n${ctx}\n\n${turns}\nCandidate: ${answer}\n\n` +
      `Interviewer: Next question and optional brief follow-ups (pure JSON): ` +
      `{"text": "...", "followups": ["...", "..."]}`;

    let raw: string;
    try {
      raw = await callBedrock(prompt);
    } catch (e: any) {
      const emsg = String(e?.message || "");
      if (/aws-marketplace:ViewSubscriptions|not authorized|access is denied/i.test(emsg)) {
        // Fallback to a broadly available on-demand model
        process.env.BEDROCK_MODEL_ID = "anthropic.claude-3-haiku-20240307-v1:0";
        raw = await callBedrock(prompt);
      } else {
        throw e;
      }
    }

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
  } catch (e: any) {
    console.error("bedrock/turn error", e);
    const msg = /on-demand throughput isn’t supported/i.test(e?.message || "")
      ? "Bedrock model requires an Inference Profile. Set BEDROCK_INFERENCE_PROFILE_ARN in env."
      : e?.message || "Server error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
