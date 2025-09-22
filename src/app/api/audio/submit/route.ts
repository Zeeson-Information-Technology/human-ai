export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/db-connect";
import AudioSample from "@/model/audio-sample";

const Body = z.object({
  phraseId: z.string().min(1),
  phraseEn: z.string().min(1),
  language: z.string().min(1), // "Yoruba" | "Hausa" | ...
  accent: z.string().optional(), // free text/dropdown

  translationText: z.string().min(1),

  audioUrl: z.string().url(),
  audioPublicId: z.string().min(1),

  durationMs: z.number().int().nonnegative().optional(),
  deviceInfo: z.string().optional(),
  userId: z.string().optional(),
  consent: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = Body.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    await dbConnect();
    const doc = await AudioSample.create(parsed.data);
    return NextResponse.json({ ok: true, id: String(doc._id) });
  } catch (e) {
    console.error("audio:submit POST error", e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
