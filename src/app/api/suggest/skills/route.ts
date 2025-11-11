// ================================
// FILE: src/app/api/suggest/skills/route.ts
// Suggests skills from job context. Uses AI if available, otherwise
// applies a deterministic local fallback.
// ================================
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const Payload = z.object({
  title: z.string().optional(),
  roleName: z.string().optional(),
  jdText: z.string().optional(),
  langs: z.array(z.string()).optional(),
  seniority: z.string().optional(),
  interviewType: z.string().optional(),
});

type Groups = {
  core: string[];
  frameworks: string[];
  cloud: string[];
  data: string[];
  languages: string[];
  tools: string[];
};

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr.filter(Boolean))) as T[];
}

function cap(s?: string) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function isAnnotatorRole(text: string) {
  const t = text.toLowerCase();
  return /(annotator|anotator|annotation|linguist|labeler|labeller|transcriber|transcription)/.test(t);
}

const STOP = new Set([
  "the","a","an","and","or","to","for","with","of","in","on","by","at","as","is","are","be","this","that",
  "you","we","they","it","from","into","your","our","their","will","can","should","must","have","has",
]);

function extractKeywords(text?: string) {
  const t = (text || "").toLowerCase();
  if (!t) return [] as string[];
  return t
    .replace(/[^a-z0-9+.#\-\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP.has(w))
    .slice(0, 200);
}

function fallbackSuggest({ title, roleName, jdText, langs, seniority }: z.infer<typeof Payload>): Groups {
  const text = [title, roleName].filter(Boolean).join(" ");
  const keywords = extractKeywords(jdText);
  const groups: Groups = { core: [], frameworks: [], cloud: [], data: [], languages: [], tools: [] };

  // Role heuristics
  if (isAnnotatorRole(text)) {
    groups.core.push(
      "Transcription",
      "Entity Recognition (NER)",
      "Intent & Slot Labeling",
      "Normalization",
      "Linguistic QA",
      "Guideline Authoring",
      "Inter-annotator Agreement",
    );
    groups.tools.push("Label Studio", "Prodigy", "Doccano", "ELAN", "Praat");
    groups.data.push("Data Lineage", "Sampling Strategy", "Quality Metrics");
  }

  const lc = text.toLowerCase();
  if (/react|frontend|next\.?js/.test(lc)) {
    groups.core.push("React", "TypeScript", "CSS");
    groups.frameworks.push("Next.js", "Tailwind CSS", "Jest", "Storybook");
    groups.tools.push("Vite", "ESLint", "Playwright");
  }
  if (/node|backend|express|nestjs/.test(lc)) {
    groups.core.push("Node.js", "API Design", "SQL");
    groups.frameworks.push("Express", "NestJS");
    groups.cloud.push("AWS", "Docker");
    groups.data.push("PostgreSQL", "Redis");
  }
  if (/data\s*engineer|etl|pipeline|spark|airflow/.test(lc)) {
    groups.core.push("ETL", "Data Modeling", "SQL");
    groups.frameworks.push("Apache Airflow", "DBT", "Spark");
    groups.cloud.push("AWS", "Snowflake");
  }

  // Languages from langs or text
  const languageHints = new Set<string>();
  (langs || []).forEach((c) => languageHints.add(c.toLowerCase()));
  const textLc = text.toLowerCase();
  if (/(yoruba|yo\b)/.test(textLc)) languageHints.add("yoruba");
  if (/(igbo|ig\b)/.test(textLc)) languageHints.add("igbo");
  if (/(hausa|ha\b)/.test(textLc)) languageHints.add("hausa");
  if (/(swahili|sw\b)/.test(textLc)) languageHints.add("swahili");
  for (const lang of Array.from(languageHints)) {
    groups.languages.push(cap(lang));
  }

  // Keyword-based additions
  if (keywords.includes("kafka")) groups.data.push("Kafka");
  if (keywords.includes("graphql")) groups.frameworks.push("GraphQL");
  if (keywords.includes("docker")) groups.cloud.push("Docker");
  if (keywords.includes("kubernetes")) groups.cloud.push("Kubernetes");

  // Dedup + limit
  for (const k of Object.keys(groups) as (keyof Groups)[]) {
    groups[k] = uniq(groups[k]).slice(0, 8);
  }
  return groups;
}

export async function POST(req: Request) {
  try {
    if (!(req.headers.get("content-type") || "").includes("application/json")) {
      return NextResponse.json({ ok: false, error: "Expected application/json" }, { status: 400 });
    }
    const raw = await req.json();
    const parsed = Payload.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
    }
    const body = parsed.data;

    // Try AI if available
    const dynImport = (m: string) => (Function("return import(m)") as any)(m);
    let generateObject: any = null;
    let google: any = null;
    try {
      ({ generateObject } = await dynImport("ai"));
      ({ google } = await dynImport("@ai-sdk/google"));
    } catch {
      // ignore
    }

    let groups: Groups = fallbackSuggest(body);
    if (generateObject && google) {
      try {
        const out = await generateObject({
          model: google("gemini-2.5-flash"),
          schema: z.object({
            core: z.array(z.string()).optional().default([]),
            frameworks: z.array(z.string()).optional().default([]),
            cloud: z.array(z.string()).optional().default([]),
            data: z.array(z.string()).optional().default([]),
            languages: z.array(z.string()).optional().default([]),
            tools: z.array(z.string()).optional().default([]),
          }),
          system: [
            "You suggest concise, industry-standard skills based on job context.",
            "Return short skill labels (Title Case or proper brand casing).",
            "Preserve acronyms like AI/ML/NLP/ASR/NMT/QA and tech names like React, Next.js, Node.js.",
            "Avoid generic words and duties. Limit to 12–18 total across groups.",
          ].join("\n"),
          prompt: [
            `Title: ${body.title || ""}`,
            `Role: ${body.roleName || ""}`,
            body.seniority ? `Seniority: ${body.seniority}` : "",
            body.langs && body.langs.length ? `Languages: ${body.langs.join(", ")}` : "",
            body.jdText ? `JD: ${body.jdText.slice(0, 1200)}` : "",
            "Suggest skills grouped into core, frameworks, cloud, data, languages, tools.",
          ].filter(Boolean).join("\n"),
        });
        const ai = out.object as Groups;
        // Merge AI on top of fallback; then dedupe/limit
        const merged: Groups = {
          core: [...ai.core, ...groups.core],
          frameworks: [...ai.frameworks, ...groups.frameworks],
          cloud: [...ai.cloud, ...groups.cloud],
          data: [...ai.data, ...groups.data],
          languages: [...ai.languages, ...groups.languages],
          tools: [...ai.tools, ...groups.tools],
        };
        for (const k of Object.keys(merged) as (keyof Groups)[]) {
          merged[k] = uniq(merged[k]).slice(0, 8);
        }
        groups = merged;
      } catch {
        // keep fallback
      }
    }

    return NextResponse.json({ ok: true, groups }, { status: 200 });
  } catch (e) {
    console.error("POST /api/suggest/skills error", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

