// src/app/api/annotations/text/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/db-connect";
import TextAnnotation from "@/model/text-annotation";

// ---- Validation schema (typed, no any)
const ItemSchema = z.object({
  sourceText: z.string().min(1),
  targetText: z.string().optional(),
  labels: z.array(z.string()).min(1),
});

const BodySchema = z.object({
  taskId: z.string().min(1),
  task: z.string().min(1),
  items: z.array(ItemSchema).min(1),
});

type Body = z.infer<typeof BodySchema>;

// What we insert per row (aligned with your schema)
type InsertDoc = {
  taskId: string;
  task: string;
  sourceText: string;
  targetText?: string;
  labels: string[];
  // legacy single-label field so old dashboards still work:
  selectedLabel?: string;
};

type CreatedDocLike = { _id: { toString(): string } };

export async function POST(req: Request) {
  let body: Body;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid payload" },
      { status: 400 }
    );
  }

  await dbConnect();

  const docs: InsertDoc[] = body.items.map((it) => ({
    taskId: body.taskId,
    task: body.task,
    sourceText: it.sourceText,
    targetText: it.targetText,
    labels: it.labels,
    selectedLabel: it.labels[0], // keep legacy field populated
  }));

  // insertMany returns docs; we avoid `any` by narrowing to a minimal shape
  const created = await TextAnnotation.insertMany(docs, { ordered: true });
  const ids = (created as CreatedDocLike[]).map((d) => d._id.toString());

  return NextResponse.json({
    ok: true,
    ids,
    id: ids[0] ?? null,
    count: ids.length,
  });
}
