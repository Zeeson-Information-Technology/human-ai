// src/app/api/labels/suggest/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";

/** ---------- Types ---------- */
type Suggestion = { label: string; score: number };

const BodySchema = z.object({
  /** Raw text to analyze (required) */
  text: z.string().min(1),

  /**
   * Optional list of candidate labels to rank.
   * If omitted, we fall back to a small, general taxonomy.
   */
  candidates: z.array(z.string().min(1)).optional(),

  /** Max suggestions to return (default 6, clamped 1..20) */
  topK: z.number().int().min(1).max(20).optional(),

  /** Optional language hint; currently informational */
  lang: z.string().optional(),
});

const DEFAULT_TAXONOMY: readonly string[] = [
  // quality / eval
  "Correct",
  "Incorrect",
  "Hallucination",
  "Unhelpful",
  "Off-topic",
  "Needs escalation",
  "Actionable",
  "Non-actionable",
  "Incomplete",
  "Ambiguous",
  // safety
  "Toxic",
  "Harassment",
  "Hate",
  "Violence",
  "Self-harm",
  "PII",
  "Policy violation",
  // translation / text QA
  "Fluency error",
  "Grammar error",
  "Terminology error",
  "Style mismatch",
  "Mistranslation",
  "Omission",
  "Addition",
] as const;

/** ---------- Text utils (typed, no any) ---------- */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(s: string): string[] {
  const n = normalize(s);
  return n.length ? n.split(" ") : [];
}

function jaccard(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const A = new Set(a);
  const B = new Set(b);
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  return inter / (A.size + B.size - inter);
}

/** Simple Levenshtein (for fuzzy label matching) */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[] = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[j] = Math.min(
        dp[j] + 1, // deletion
        dp[j - 1] + 1, // insertion
        prev + cost // substitution
      );
      prev = tmp;
    }
  }
  return dp[n];
}

/** Turn an edit distance into a [0..1] similarity score */
function fuzzySim(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (!maxLen) return 0;
  const dist = levenshtein(a, b);
  return 1 - dist / maxLen;
}

/** ---------- Scoring engine ---------- */
function scoreCandidates(
  text: string,
  candidates: readonly string[]
): Suggestion[] {
  const toks = tokenize(text);
  const joined = normalize(text);

  const results: Suggestion[] = candidates.map((raw) => {
    const label = raw.trim();
    const ln = normalize(label);
    // token overlap
    const jac = jaccard(toks, tokenize(label));
    // direct substring bonus
    const hasSub = joined.includes(ln) ? 0.25 : 0;
    // fuzzy similarity (helps “harassment” vs “harassing” etc.)
    const fuzzy = fuzzySim(joined, ln) * 0.35;

    // Weighted blend (tunable)
    const score = Math.min(1, jac * 0.6 + hasSub + fuzzy);

    return { label, score };
  });

  // de-dupe by normalized form, keep highest score
  const bestByKey = new Map<string, Suggestion>();
  for (const r of results) {
    const k = normalize(r.label);
    const prev = bestByKey.get(k);
    if (!prev || r.score > prev.score) bestByKey.set(k, r);
  }

  return Array.from(bestByKey.values()).sort((a, b) => b.score - a.score);
}

/** ---------- Route ---------- */
export async function POST(req: Request) {
  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid payload" },
      { status: 400 }
    );
  }

  const topK = Math.min(Math.max(body.topK ?? 6, 1), 20);
  const candidateList: readonly string[] = (
    body.candidates && body.candidates.length > 0
      ? body.candidates
      : DEFAULT_TAXONOMY
  ).slice();

  const ranked = scoreCandidates(body.text, candidateList).slice(0, topK);

  return NextResponse.json({
    ok: true,
    items: ranked.map((r) => ({
      label: r.label,
      score: Number(r.score.toFixed(4)),
    })),
  });
}
