// src/app/api/annotations/image/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import ImageAnnotation from "@/model/image-annotation";
import { z } from "zod";

/** Shared bbox schema */
const BBoxSchema = z.object({
  x: z.number().nonnegative(),
  y: z.number().nonnegative(),
  width: z.number().positive(),
  height: z.number().positive(),
});

/** Legacy single-annotation payload (BACKWARD-COMPATIBLE) */
const SinglePayloadSchema = z.object({
  sampleId: z.string().min(1),
  image: z.string().min(1),
  label: z.string().min(1),
  bbox: BBoxSchema,
});

/** New bulk payload (multi-box, multi-labels) */
const AnnSchema = z.object({
  bbox: BBoxSchema,
  labels: z.array(z.string().min(1)).min(1),
});

const BulkPayloadSchema = z.object({
  sampleId: z.string().min(1),
  image: z.string().min(1),
  anns: z.array(AnnSchema).min(1),
});

type SinglePayload = z.infer<typeof SinglePayloadSchema>;
type BulkPayload = z.infer<typeof BulkPayloadSchema>;

export async function POST(req: Request) {
  try {
    const json = await req.json();

    // Prefer bulk; if invalid, try legacy single
    const bulkParse = BulkPayloadSchema.safeParse(json);
    const singleParse = bulkParse.success
      ? null
      : SinglePayloadSchema.safeParse(json);

    await dbConnect();

    // BULK: { sampleId, image, anns: [{ bbox, labels:[...] }, ...] }
    if (bulkParse.success) {
      const { sampleId, image, anns } = bulkParse.data as BulkPayload;

      // Flatten to one doc per (box x label), keeping existing schema
      const docs = anns.flatMap((a) =>
        a.labels.map((label) => ({
          sampleId,
          image,
          label,
          bbox: a.bbox,
        }))
      );

      const created = await ImageAnnotation.insertMany(docs, { ordered: true });
      const ids = created.map((d) => String(d._id));
      return NextResponse.json({ ok: true, ids });
    }

    // SINGLE (legacy)
    if (singleParse?.success) {
      const data = singleParse.data as SinglePayload;
      const doc = await ImageAnnotation.create(data);
      return NextResponse.json({ ok: true, id: String(doc._id) });
    }

    return NextResponse.json(
      { ok: false, error: "Invalid payload shape" },
      { status: 400 }
    );
  } catch (e) {
    console.error("Image annotation save error:", e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
