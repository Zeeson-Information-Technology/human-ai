import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth-utils";
import { getEffectivePermissions } from "@/lib/admin-auth";
import zlib from "zlib";

export const runtime = "nodejs";

const BodySchema = z.object({
  text: z.string().optional().default(""),
  documents: z
    .array(
      z.object({
        name: z.string().min(1),
        url: z.string().url(),
        resourceType: z.string().optional(),
      })
    )
    .optional()
    .default([]),
});

const ExtractSchema = z.object({
  title: z.string().optional().default(""),
  buyerOrganization: z.string().optional().default(""),
  solicitationNumber: z.string().optional().default(""),
  submissionDeadline: z.string().optional().default(""),
  marketFocus: z.string().optional().default(""),
  roleName: z.string().optional().default("Proposal response support"),
  supportTracks: z.array(z.string()).optional().default([]),
  brief: z.string().optional().default(""),
});

function normalizeWhitespace(text: string) {
  return text
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function linesOf(text: string) {
  return normalizeWhitespace(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function uniqueStrings(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

function toIsoDate(raw?: string) {
  const value = (raw || "").trim();
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function detectDeadline(text: string, lines: string[]) {
  const labelLine = lines.find((line) =>
    /(closing date|close date|submission deadline|deadline|due date|closing time)/i.test(line)
  );
  const candidateText = labelLine || text.slice(0, 1200);

  const monthPattern =
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b/i;
  const isoPattern = /\b\d{4}-\d{2}-\d{2}\b/;
  const slashPattern = /\b\d{1,2}[/-]\d{1,2}[/-]\d{4}\b/;

  const match =
    candidateText.match(monthPattern)?.[0] ||
    candidateText.match(isoPattern)?.[0] ||
    candidateText.match(slashPattern)?.[0] ||
    "";

  return toIsoDate(match);
}

function detectSolicitation(text: string, lines: string[]) {
  const labelLine = lines.find((line) =>
    /(solicitation|tender|reference number|solicitation number|rfp number|bid number|notice id|opportunity id)/i.test(
      line
    )
  );
  if (labelLine) {
    const direct =
      labelLine.match(/[:#]\s*([A-Z0-9/_-]{4,})/i)?.[1] ||
      labelLine.match(/\b([A-Z]{1,6}\d[A-Z0-9/_-]{2,})\b/i)?.[1] ||
      "";
    if (direct) return direct.trim();
  }

  const generic = text.match(/\b[A-Z]{1,6}\d[A-Z0-9/_-]{2,}\b/);
  return generic?.[0] || "";
}

function detectBuyer(lines: string[]) {
  const buyerLine = lines.find((line) =>
    /(issued by|issuer|issuing authority|department|ministry|government of|city of|county of|authority|buyer|procuring entity|purchaser)/i.test(
      line
    )
  );
  if (!buyerLine) return "";
  const cleaned = buyerLine
    .replace(/^(issued by|issuer|issuing authority|buyer|procuring entity|purchaser)\s*[:\-]\s*/i, "")
    .replace(/^(department|ministry)\s*[:\-]\s*/i, (m) => m.replace(/[:\-]\s*$/, ""))
    .trim();
  return cleaned.length > 4 ? cleaned : buyerLine.trim();
}

function detectTitle(lines: string[], buyer: string) {
  const firstMeaningful = lines.find(
    (line) =>
      line.length > 12 &&
      !/(closing date|deadline|reference number|solicitation|buyer|issued by|contact)/i.test(line)
  );
  if (!firstMeaningful) return "";
  const trimmed = firstMeaningful.replace(/^request for proposal\s*[:\-]?\s*/i, "").trim();
  if (buyer && trimmed.toLowerCase() === buyer.toLowerCase()) return "";
  return trimmed;
}

function detectMarket(text: string) {
  const lower = text.toLowerCase();
  const matches: string[] = [];
  if (/\bcanada|canadian\b/.test(lower)) matches.push("Canada");
  if (/\buk|united kingdom|britain\b/.test(lower)) matches.push("UK");
  if (/\bunited states|usa|u\.s\.|u\.s\.a\.\b/.test(lower)) matches.push("US");
  if (/\beurope|european union|eu\b/.test(lower)) matches.push("Europe");
  if (/\bafrica|nigeria|ghana|kenya|south africa\b/.test(lower)) matches.push("Africa");
  return matches.join(", ");
}

function detectTracks(text: string) {
  const lower = text.toLowerCase();
  const tracks: string[] = [];
  if (/(executive summary|summary section|cover letter)/.test(lower)) {
    tracks.push("Executive summary");
  }
  if (/(compliance matrix|mandatory requirements|requirements matrix)/.test(lower)) {
    tracks.push("Compliance matrix");
  }
  if (/(sme|subject matter expert|technical lead|stakeholder interview)/.test(lower)) {
    tracks.push("SME coordination");
  }
  if (/(proposal|response|bid writing|drafting)/.test(lower)) {
    tracks.push("Proposal writing");
  }
  if (/(coordination|submission|portal|deadline)/.test(lower)) {
    tracks.push("RFP response coordination");
  }
  return uniqueStrings(tracks);
}

function buildBrief(text: string, title: string, buyerOrganization: string, solicitationNumber: string) {
  const base = normalizeWhitespace(text).slice(0, 2400).trim();
  const prefix = [
    title ? `Opportunity: ${title}` : "",
    buyerOrganization ? `Buyer: ${buyerOrganization}` : "",
    solicitationNumber ? `Reference: ${solicitationNumber}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  return [prefix, base].filter(Boolean).join("\n\n");
}

function extOf(name = "", url = "") {
  const raw = `${name} ${url}`.toLowerCase();
  const match = raw.match(/\.([a-z0-9]{2,5})(?:$|\?|#|\s)/);
  return match?.[1] || "";
}

function decodePdfLiteral(value: string) {
  return value
    .replace(/\\([\\()])/g, "$1")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\b/g, "\b")
    .replace(/\\f/g, "\f")
    .replace(/\\(\d{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
}

function extractPdfTextFromChunk(chunk: string) {
  const texts: string[] = [];
  const blocks = chunk.match(/BT[\s\S]*?ET/g) || [];
  for (const block of blocks) {
    const singleMatches = block.match(/\((?:\\.|[^\\()])*\)\s*(?:Tj|'|")/g) || [];
    for (const match of singleMatches) {
      const literal = match.match(/\(((?:\\.|[^\\()])*)\)/)?.[1];
      if (literal) texts.push(decodePdfLiteral(literal));
    }

    const arrayMatches = block.match(/\[(?:\\.|[^\]])*?\]\s*TJ/g) || [];
    for (const match of arrayMatches) {
      const literals = match.match(/\(((?:\\.|[^\\()])*)\)/g) || [];
      for (const literal of literals) {
        const value = literal.slice(1, -1);
        if (value) texts.push(decodePdfLiteral(value));
      }
    }
  }
  return normalizeWhitespace(texts.join(" ")).slice(0, 16000);
}

function extractPdfTextFromBuffer(bytes: Buffer) {
  const chunks: string[] = [bytes.toString("latin1")];
  const raw = bytes.toString("latin1");
  const streamRegex =
    /<<[\s\S]*?\/Filter\s*\/FlateDecode[\s\S]*?>>\s*stream\r?\n([\s\S]*?)\r?\nendstream/g;

  for (const match of raw.matchAll(streamRegex)) {
    const payload = match[1];
    if (!payload) continue;
    try {
      const inflated = zlib.inflateSync(Buffer.from(payload, "latin1"));
      chunks.push(inflated.toString("latin1"));
    } catch {
      try {
        const inflated = zlib.inflateRawSync(Buffer.from(payload, "latin1"));
        chunks.push(inflated.toString("latin1"));
      } catch {
        // ignore unreadable streams
      }
    }
  }

  const merged = chunks
    .map((chunk) => extractPdfTextFromChunk(chunk))
    .filter(Boolean)
    .join("\n");

  return normalizeWhitespace(merged).slice(0, 16000);
}

async function ocrImageFromUrl(url: string) {
  try {
    const [{ createWorker }, imgRes] = await Promise.all([
      import("tesseract.js"),
      fetch(url, { cache: "no-store" }),
    ]);
    if (!imgRes.ok) return "";
    const bytes = Buffer.from(await imgRes.arrayBuffer());
    const worker = await createWorker("eng");
    const result = await worker.recognize(bytes);
    await worker.terminate();
    return normalizeWhitespace(result?.data?.text || "").slice(0, 12000);
  } catch {
    return "";
  }
}

async function readDocumentText(document: { name: string; url: string; resourceType?: string }) {
  const ext = extOf(document.name, document.url);
  const textLike = new Set(["txt", "md", "csv", "json", "html", "htm", "xml", "rtf"]);
  const imageLike = new Set(["png", "jpg", "jpeg", "webp"]);

  if (textLike.has(ext)) {
    try {
      const res = await fetch(document.url, { cache: "no-store" });
      if (!res.ok) return "";
      const text = await res.text();
      return normalizeWhitespace(text).slice(0, 12000);
    } catch {
      return "";
    }
  }

  if (ext === "pdf") {
    try {
      const res = await fetch(document.url, { cache: "no-store" });
      if (!res.ok) return "";
      const bytes = Buffer.from(await res.arrayBuffer());
      return extractPdfTextFromBuffer(bytes);
    } catch {
      return "";
    }
  }

  if (ext === "docx") {
    try {
      const res = await fetch(document.url, { cache: "no-store" });
      if (!res.ok) return "";
      const bytes = Buffer.from(await res.arrayBuffer());
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer: bytes });
      return normalizeWhitespace(result.value || "").slice(0, 12000);
    } catch {
      return "";
    }
  }

  if (imageLike.has(ext) || document.resourceType === "image") {
    return ocrImageFromUrl(document.url);
  }

  return "";
}

async function buildSourceText(text: string, documents: Array<{ name: string; url: string; resourceType?: string }>) {
  const trimmed = normalizeWhitespace(text);
  if (trimmed.length >= 80) return trimmed;
  if (!documents.length) return "";

  const parts: string[] = [];
  for (const document of documents.slice(0, 4)) {
    const extracted = await readDocumentText(document);
    if (extracted) {
      parts.push(`Document: ${document.name}\n${extracted}`);
    }
  }

  return normalizeWhitespace(parts.join("\n\n")).slice(0, 16000);
}

function extractFallback(text: string) {
  const lines = linesOf(text);
  const buyerOrganization = detectBuyer(lines);
  const title = detectTitle(lines, buyerOrganization);
  const solicitationNumber = detectSolicitation(text, lines);
  const submissionDeadline = detectDeadline(text, lines);
  const marketFocus = detectMarket(text);
  const supportTracks = detectTracks(text);
  const brief = buildBrief(text, title, buyerOrganization, solicitationNumber);

  return {
    title,
    buyerOrganization,
    solicitationNumber,
    submissionDeadline,
    marketFocus,
    roleName: "Proposal response support",
    supportTracks,
    brief,
  };
}

async function extractWithAi(text: string) {
  const dynImport = (m: string) => (Function("m", "return import(m)")(m) as Promise<any>);
  try {
    const [{ generateObject }, { google }] = await Promise.all([
      dynImport("ai"),
      dynImport("@ai-sdk/google"),
    ]);

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: ExtractSchema,
      system: [
        "You extract proposal opportunity details from pasted RFP or tender text.",
        "Return only details that are clearly supported by the text.",
        "Do not invent a client name.",
        "The roleName should stay short and operational, such as 'Proposal response support' or 'Compliance matrix support'.",
        "The brief should be concise, proposal-oriented, and under 1400 characters.",
        "submissionDeadline must be YYYY-MM-DD if confidently found, otherwise empty string.",
      ].join("\n"),
      prompt: [
        "Extract the opportunity details from the following source text.",
        "",
        text.slice(0, 12000),
      ].join("\n"),
    });
    return ExtractSchema.parse(object);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  const permissions = getEffectivePermissions(user);
  if (
    !user ||
    !(
      user.role === "admin" ||
      user.role === "company" ||
      permissions.canCreateOpportunity
    )
  ) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Provide pasted text or uploaded documents to extract details." }, { status: 400 });
  }

  const sourceText = await buildSourceText(parsed.data.text, parsed.data.documents);
  if (sourceText.length < 80) {
    return NextResponse.json(
      { ok: false, error: "Add more pasted opportunity text or upload readable source files first." },
      { status: 400 }
    );
  }

  const fallback = extractFallback(sourceText);
  const aiResult = await extractWithAi(sourceText);
  const merged = {
    title: aiResult?.title || fallback.title,
    buyerOrganization: aiResult?.buyerOrganization || fallback.buyerOrganization,
    solicitationNumber: aiResult?.solicitationNumber || fallback.solicitationNumber,
    submissionDeadline: aiResult?.submissionDeadline || fallback.submissionDeadline,
    marketFocus: aiResult?.marketFocus || fallback.marketFocus,
    roleName: aiResult?.roleName || fallback.roleName,
    supportTracks: uniqueStrings([...(aiResult?.supportTracks || []), ...fallback.supportTracks]),
    brief: aiResult?.brief || fallback.brief,
  };

  return NextResponse.json({
    ok: true,
    extracted: merged,
    source: {
      mode: parsed.data.text.trim().length >= 80 ? "pasted-text" : "uploaded-documents",
      usedDocuments: parsed.data.documents.length,
    },
  });
}
