// POST /api/zuri/resume/ingest { s3Key: string }
// Downloads resume from S3, extracts text (Textract), runs Comprehend for entities/phrases, and returns a concise summary.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import type {
  DetectEntitiesCommandOutput,
  DetectKeyPhrasesCommandOutput,
} from "@aws-sdk/client-comprehend";
import { s3 } from "@/lib/aws-s3";
import { textract } from "@/lib/aws-textract";
import { comprehend } from "@/lib/aws-comprehend";

export async function POST(req: NextRequest) {
  try {
    const bucket = process.env.ZURI_S3_RESUMES_BUCKET || process.env.ZURI_S3_MEDIA_BUCKET || "";
    if (!bucket) return NextResponse.json({ ok: false, error: "No resumes bucket" }, { status: 500 });
    const body = (await req.json().catch(() => ({}))) as { s3Key?: string };
    const s3Key = (body.s3Key || "").trim();
    if (!s3Key) return NextResponse.json({ ok: false, error: "s3Key required" }, { status: 400 });

    // Get object from S3
    const s3c = await s3();
    const { GetObjectCommand } = await import("@aws-sdk/client-s3");
    const obj = await s3c.send(new GetObjectCommand({ Bucket: bucket, Key: s3Key }));
    const bytes = Buffer.from(await obj.Body!.transformToByteArray());

    // Textract detect text (sync) — optional dependency
    const dynImport = (m: string) => (Function("return import(m)") as any)(m);
    let text = "";
    try {
      const tex = await textract();
      const { DetectDocumentTextCommand } = await dynImport("@aws-sdk/client-textract");
      const det = await tex.send(
        new DetectDocumentTextCommand({ Document: { Bytes: bytes } })
      );
      text = (det.Blocks || [])
      .filter((b: any) => b.BlockType === "LINE" && b.Text)
      .map((b: any) => b.Text)
      .join("\n")
      .slice(0, 18000);
    } catch (e) {
      // Textract not available — graceful degrade
      return NextResponse.json(
        { ok: false, error: "Textract not available on this deployment" },
        { status: 501 }
      );
    }

    // Comprehend entities and key phrases (truncate for limits)
    const comp = await comprehend();
    const { DetectEntitiesCommand, DetectKeyPhrasesCommand } = await dynImport(
      "@aws-sdk/client-comprehend"
    );
    const lang = "en"; // Adjust if you add auto-detect
    const entitiesRes = (await comp.send(
      new DetectEntitiesCommand({ Text: text.slice(0, 4500), LanguageCode: lang })
    )) as DetectEntitiesCommandOutput;
    const phrasesRes = (await comp.send(
      new DetectKeyPhrasesCommand({ Text: text.slice(0, 4500), LanguageCode: lang })
    )) as DetectKeyPhrasesCommandOutput;

    const topEntities = (entitiesRes.Entities ?? [])
      .filter((e: any) => e.Type && e.Text)
      .slice(0, 12)
      .map((e: any) => `${e.Type}: ${e.Text}`);
    const topPhrases = (phrasesRes.KeyPhrases ?? [])
      .filter((p: any) => p.Text)
      .slice(0, 12)
      .map((p: any) => p.Text);

    const resumeSummary = [
      "Extracted skills/entities:",
      topEntities.join(", "),
      "\nKey phrases:",
      topPhrases.join(", "),
    ].join(" ");

    return NextResponse.json({ ok: true, text, resumeSummary });
  } catch (e) {
    console.error("resume ingest error", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
