// src/lib/llm/provider.ts
// Unified provider for Zuri interview turns: Bedrock (Anthropic via Bedrock) and Google AI Studio (Gemini)

export type TurnOutput = { text: string; followups?: string[] };

export function isThrottleOrQuota(e: unknown) {
  const msg = String((e as { message?: string } | undefined)?.message || e || "");
  return /throttling|too many requests|quota|rate/i.test(msg);
}

async function callBedrockRaw(prompt: string): Promise<string> {
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
  // Type-only import to avoid top-level await in type position
  type InvokeInput = import("@aws-sdk/client-bedrock-runtime").InvokeModelCommandInput;

  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 280,
    temperature: 0.5,
    messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
  });

  // Build input allowing either modelId or inferenceProfileArn.
  // The AWS types currently require modelId, but runtime accepts inferenceProfileArn.
  // We cast to the SDK's input type after assembling to satisfy TS while keeping runtime behavior.
  const assembled: any = {
    contentType: "application/json",
    accept: "application/json",
    body,
  };
  if (profileArn) {
    assembled.inferenceProfileArn = profileArn;
    // Include modelId for typing compatibility; ignored by Bedrock when inferenceProfileArn is present.
    if (!modelId) assembled.modelId = "";
  } else {
    assembled.modelId = modelId;
  }
  if (process.env.BEDROCK_GUARDRAIL_ID) {
    assembled.guardrailConfig = {
      guardrailIdentifier: process.env.BEDROCK_GUARDRAIL_ID!,
      guardrailVersion: process.env.BEDROCK_GUARDRAIL_VERSION || "1",
    };
  }
  const res = await client.send(
    new InvokeModelCommand(assembled as unknown as InvokeInput)
  );
  const json = res.body
    ? JSON.parse(new TextDecoder().decode(res.body as Uint8Array))
    : {};
  const text: string = json?.content?.[0]?.text || "";
  return text;
}

async function callGoogleRaw(prompt: string): Promise<string> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
  if (!apiKey) throw new Error("Missing GOOGLE_GENAI_API_KEY");

  // Build a robust candidate list across API versions and model aliases
  const configured = (process.env.GEMINI_MODEL_ID || "").trim();
  const baseModels = configured
    ? [configured]
    : [
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash",
        "gemini-1.5-flash-002",
        "gemini-1.5-pro-latest",
        "gemini-1.5-pro",
        "gemini-1.5-pro-002",
      ];
  // If configured ends with -latest, also try without -latest
  if (configured && /-latest$/.test(configured)) {
    baseModels.push(configured.replace(/-latest$/, ""));
  }
  const apiVersions = ["v1", "v1beta"]; // try stable first, then beta

  let lastErr: Error | null = null;
  for (const ver of apiVersions) {
    for (const model of baseModels) {
      const url = `https://generativelanguage.googleapis.com/${ver}/models/${encodeURIComponent(
        model
      )}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }]}],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 256,
            responseMimeType: "application/json",
          },
        }),
      });
      const j = (await res.json().catch(() => ({}))) as Record<string, any>;
      if (!res.ok) {
        const errMsg = j?.error?.message || `Google GenAI error ${res.status}`;
        lastErr = new Error(`${errMsg} (model=${model}, api=${ver})`);
        // Try next combination on permission/not found/unsupported/quota/rate
        if (/permission|not found|unsupported|quota|rate/i.test(errMsg)) continue;
        // For other server errors, break to next model/version
        continue;
      }
      const parts = Array.isArray(j?.candidates?.[0]?.content?.parts)
        ? (j.candidates[0].content.parts as Array<{ text?: string }>)
        : [];
      const text = String(parts.map((p) => p?.text || "").join("") || "").trim();
      if (text) return text;
      lastErr = new Error(`Empty response from Google GenAI (model=${model}, api=${ver})`);
    }
  }
  throw lastErr || new Error("Google GenAI call failed");
}

export function chooseProviderName(): "bedrock" | "google" {
  const p = (process.env.LLM_PROVIDER || "bedrock").toLowerCase();
  return p === "google" ? "google" : "bedrock";
}

export async function generateWithProvider(prompt: string): Promise<string> {
  const provider = chooseProviderName();
  const tryBedrock = async () => {
    try {
      if (process.env.NODE_ENV !== "production") console.log("[llm] bedrock");
      return await callBedrockRaw(prompt);
    } catch (e: unknown) {
      const msg = String((e as { message?: string } | undefined)?.message || "");
      if (/aws-marketplace:ViewSubscriptions|not authorized|access is denied/i.test(msg)) {
        // Fallback to on-demand sku if permissible (haiku) else throw
        process.env.BEDROCK_MODEL_ID = "anthropic.claude-3-haiku-20240307-v1:0";
        return await callBedrockRaw(prompt);
      }
      throw e;
    }
  };
  const tryGoogle = async () => {
    if (process.env.NODE_ENV !== "production") console.log("[llm] google");
    return await callGoogleRaw(prompt);
  };

  try {
    if (provider === "google") return await tryGoogle();
    return await tryBedrock();
  } catch (e) {
    // Fallback broadly to maximize resilience during interviews
    if (provider === "bedrock" && process.env.GOOGLE_GENAI_API_KEY) {
      try { return await tryGoogle(); } catch {}
    }
    if (provider === "google" && (process.env.BEDROCK_MODEL_ID || process.env.BEDROCK_INFERENCE_PROFILE_ARN)) {
      try { return await tryBedrock(); } catch {}
    }
    throw e;
  }
}
