// src/app/api/image/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/db-connect";
import ImageAnnotation from "@/model/image-annotation";

/** Shared types (no `any`) */
type BBox = { x: number; y: number; w: number; h: number };

type InsertDoc = {
  sampleId: string;
  image: string;
  label: string;
  bbox: BBox;
};

type CreatedDocLike = { _id: { toString(): string } };

const BBoxSchema = z
  .object({
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number(),
  })
  .or(
    z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    })
  );

const BodySchema = z.object({
  sampleId: z.string().min(1),
  image: z.string().min(1), // URL or local path
  label: z.string().min(1),
  bbox: BBoxSchema,
});

/** Normalize bbox so we always store {x,y,w,h} */
function normalizeBBox(input: z.infer<typeof BBoxSchema>): BBox {
  if ("w" in input && "h" in input) {
    return { x: input.x, y: input.y, w: input.w, h: input.h };
  }
  // width/height variant
  return { x: input.x, y: input.y, w: input.width, h: input.height };
}

/** POST /api/image  -> create one image annotation */
export async function POST(req: Request) {
  let parsed: z.infer<typeof BodySchema>;
  try {
    parsed = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid payload" },
      { status: 400 }
    );
  }

  await dbConnect();

  const doc: InsertDoc = {
    sampleId: parsed.sampleId,
    image: parsed.image,
    label: parsed.label,
    bbox: normalizeBBox(parsed.bbox),
  };

  const created = await ImageAnnotation.create(doc);
  const id =
    (created as unknown as CreatedDocLike)._id?.toString?.() ??
    String(created?._id ?? "");

  return NextResponse.json({ ok: true, id });
}

/** GET /api/image?sampleId=receipt_001&limit=50  -> list recent annotations */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sampleId = searchParams.get("sampleId") || undefined;
  const limitParam = searchParams.get("limit");
  const limit = Math.min(Math.max(Number(limitParam ?? 50) || 50, 1), 200);

  await dbConnect();

  const query: Record<string, unknown> = {};
  if (sampleId) query.sampleId = sampleId;

  const rows = await ImageAnnotation.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  // Ensure bbox keys are consistent in response too
  const items = rows.map((r) => {
    const bboxRaw = (r as { bbox?: unknown }).bbox as
      | BBox
      | { x: number; y: number; width: number; height: number }
      | undefined;

    const bbox = bboxRaw
      ? normalizeBBox(bboxRaw as z.infer<typeof BBoxSchema>)
      : undefined;

    return {
      id: String((r as { _id: unknown })._id),
      sampleId: (r as { sampleId?: string }).sampleId ?? "",
      image: (r as { image?: string }).image ?? "",
      label: (r as { label?: string }).label ?? "",
      bbox,
      createdAt: (r as { createdAt?: Date }).createdAt ?? null,
      updatedAt: (r as { updatedAt?: Date }).updatedAt ?? null,
    };
  });

  return NextResponse.json({ ok: true, items });
}
