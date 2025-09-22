// src/app/api/text/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/db-connect";
import TextAnnotation from "@/model/text-annotation";

/** --------- Input types (Zod) --------- */
const ItemSchema = z.object({
  taskId: z.string().min(1),
  task: z.string().min(1),
  sourceText: z.string().min(1),
  targetText: z.string().optional(),
  /** Prefer an array; we also accept selectedLabel for legacy callers */
  labels: z.array(z.string().min(1)).optional(),
  selectedLabel: z.string().optional(),
});

const BodySchema = z.union([
  z.object({ item: ItemSchema }), // single
  z.object({ items: z.array(ItemSchema).min(1) }), // bulk
]);

type Item = z.infer<typeof ItemSchema>;
type Body = z.infer<typeof BodySchema>;

/** Normalize legacy `selectedLabel` into `labels[]` */
function normalizeItem(i: Item) {
  const labels =
    i.labels && i.labels.length > 0
      ? i.labels
      : i.selectedLabel
      ? [i.selectedLabel]
      : [];

  return {
    taskId: i.taskId,
    task: i.task,
    sourceText: i.sourceText,
    targetText: i.targetText ?? "",
    labels,
  };
}

/** POST /api/text — create one or many text annotations */
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

  const items = "items" in body ? body.items : [body.item];
  const docs = items.map(normalizeItem);

  try {
    const created = await TextAnnotation.insertMany(docs);
    // Avoid `any`: treat ids as unknown and stringify
    const ids = (created as Array<{ _id: unknown }>).map((d) => String(d._id));

    return NextResponse.json(
      { ok: true, ids, count: ids.length },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Database error" },
      { status: 500 }
    );
  }
}

/** Optional: reject unsupported methods clearly */
export async function GET() {
  return NextResponse.json(
    { ok: false, error: "Method not allowed" },
    { status: 405 }
  );
}
