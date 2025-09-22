// src/app/api/audio/export/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import AudioSample from "@/model/audio-sample";

// Shape we read from Mongo (lean result)
type AudioRow = {
  createdAt?: Date;
  language?: string;
  accent?: string;
  phraseId?: string;
  phraseEn?: string;
  translationText?: string;
  audioUrl?: string;
  durationMs?: number;
  consent?: boolean;
};

function esc(v: unknown): string {
  return `"${String(v ?? "")
    .replaceAll('"', '""')
    .replaceAll("\n", " ")}"`;
}

// Minimal CSV for fast sharing
function toCsv(rows: ReadonlyArray<AudioRow>): string {
  const header = [
    "createdAt",
    "language",
    "accent",
    "phraseId",
    "phraseEn",
    "translationText",
    "audioUrl",
    "durationMs",
    "consent",
  ];
  const body = rows
    .map((r) =>
      [
        r.createdAt instanceof Date ? r.createdAt.toISOString() : "",
        r.language ?? "",
        r.accent ?? "",
        r.phraseId ?? "",
        r.phraseEn ?? "",
        r.translationText ?? "",
        r.audioUrl ?? "",
        r.durationMs ?? "",
        r.consent ?? "",
      ]
        .map(esc)
        .join(",")
    )
    .join("\n");
  return [header.join(","), body].join("\n");
}

// GET /api/audio/export?lang=Yoruba&from=2025-01-01&to=2025-12-31
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang") || undefined;
    const from = searchParams.get("from") || undefined; // ISO
    const to = searchParams.get("to") || undefined; // ISO

    await dbConnect();

    const query: Record<string, unknown> = {};
    if (lang) query.language = lang;

    const createdAt: { $gte?: Date; $lte?: Date } = {};
    if (from) createdAt.$gte = new Date(from);
    if (to) createdAt.$lte = new Date(to);
    if (createdAt.$gte || createdAt.$lte) {
      query.createdAt = createdAt;
    }

    const rows = (await AudioSample.find(query)
      .sort({ createdAt: -1 })
      .lean()) as AudioRow[];

    const csv = toCsv(rows);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="audio-samples.csv"`,
      },
    });
  } catch (e) {
    console.error("audio:export GET error", e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
