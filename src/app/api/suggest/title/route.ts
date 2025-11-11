// ================================
// FILE: src/app/api/suggest/title/route.ts
// Title normalization/suggestion. Uses AI if available, with a robust
// local fallback built on smart-input.
// ================================
import { NextResponse } from "next/server";
import { z } from "zod";
import { suggestNormalizedTitle } from "@/lib/smart-input";

export const runtime = "nodejs";

const Payload = z.object({
  text: z.string().min(2),
  locale: z.string().optional(),
});

const LANGS = [
  "yoruba",
  "igbo",
  "hausa",
  "swahili",
  "amharic",
  "zulu",
  "xhosa",
  "afrikaans",
  "pidgin",
  "arabic",
  "french",
  "english",
];

function cap(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function localAlternates(s: string) {
  const alts: string[] = [];
  const lc = s.toLowerCase();
  const lang = LANGS.find((l) => lc.startsWith(l + " ") || lc.includes(" " + l + " "));
  if (lang) {
    const L = cap(lang);
    const pool = [
      `${L} Language Teacher`,
      `${L} Language Instructor`,
      `${L} Language Tutor`,
      `${L} Translator`,
      `${L} Interpreter`,
      `${L} Annotator`,
      `${L} Linguist`,
    ];
    for (const p of pool) if (!alts.includes(p) && p.toLowerCase() !== lc) alts.push(p);
  }
  return alts.slice(0, 5);
}

export async function POST(req: Request) {
  try {
    if (!(req.headers.get("content-type") || "").includes("application/json")) {
      return NextResponse.json({ ok: false, error: "Expected application/json" }, { status: 400 });
    }
    const raw = await req.json();
    const parsed = Payload.safeParse(raw);
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
    const { text, locale } = parsed.data;

    const local = suggestNormalizedTitle(text || "");
    let suggestion = local.suggestion || text;
    let alternates = localAlternates(suggestion);
    let confidence = local.changed ? 0.9 : 0.7;

    // Try AI refinement if available
    const dynImport = (m: string) => (Function("return import(m)") as any)(m);
    try {
      const { generateObject } = await dynImport("ai");
      const { google } = await dynImport("@ai-sdk/google");
      const out = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: z.object({
          suggestion: z.string(),
          alternates: z.array(z.string()).optional().default([]),
        }),
        system: [
          "You normalize job titles. Be concise.",
          "Preserve acronyms (AI/ML/NLP/ASR/NMT/QA) and brand casing (React, Next.js, Node.js).",
          "Prefer standard forms like 'Language Teacher', 'Translator', 'Interpreter', 'Annotator', 'Linguist'.",
          "If the input clearly contains a language (e.g., Hausa), keep it at the beginning.",
          "Return only the corrected title and optional alternates. No punctuation beyond necessary hyphens/dots.",
        ].join("\n"),
        prompt: [
          locale ? `Locale: ${locale}` : "",
          `Title: ${text}`,
          "Return JSON with { suggestion, alternates }.",
        ].filter(Boolean).join("\n"),
      });
      const ai = out.object as { suggestion: string; alternates?: string[] };
      if (ai?.suggestion) suggestion = ai.suggestion;
      if (Array.isArray(ai?.alternates) && ai.alternates.length) {
        alternates = Array.from(new Set([...(ai.alternates || []), ...alternates])).slice(0, 5);
      }
      confidence = 0.95;
    } catch {
      // keep local
    }

    return NextResponse.json({ ok: true, suggestion, alternates, confidence }, { status: 200 });
  } catch (e) {
    console.error("POST /api/suggest/title error", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

