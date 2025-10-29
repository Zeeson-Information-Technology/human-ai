// ================================
// FILE: src/app/api/email/invite-multi/route.ts
// Send multiple candidate invites (per-recipient signed link)
// ================================
export const runtime = "nodejs";

import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/db-connect";
import { Job } from "@/model/job";
import sendEmail from "@/lib/sendSmtpMail";
import { signInvite } from "@/lib/invite-token";

type AddressLike = string | { address?: string | null };
type RawSendResult = {
  messageId?: string | null;
  accepted?: AddressLike[];
  response?: string | null;
} | null;

function normalizeSendResult(raw: RawSendResult) {
  if (!raw) return null;
  const accepted =
    raw.accepted
      ?.map((a) => (typeof a === "string" ? a : a.address ?? ""))
      .filter(Boolean) ?? [];
  return {
    messageId: raw.messageId ?? null,
    accepted,
    response: raw.response ?? null,
  };
}

const ISO_TO_LABEL: Record<string, string> = {
  en: "English",
  yo: "Yorùbá",
  ha: "Hausa",
  ig: "Igbo",
  pcm: "Pidgin",
  es: "Spanish",
  fr: "French",
  pt: "Portuguese",
  de: "German",
  it: "Italian",
  nl: "Dutch",
  ru: "Russian",
  tr: "Turkish",
  hi: "Hindi",
  bn: "Bengali",
  ur: "Urdu",
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
  id: "Indonesian",
  vi: "Vietnamese",
  th: "Thai",
  ms: "Malay",
};

const Payload = z.object({
  emails: z.array(z.string().email()).min(1),
  code: z.string().min(4).max(24).optional(),
  jobCode: z.string().min(4).max(24).optional(),
  // If link is provided, it’s used as base (we append email & ivt)
  link: z.string().optional(),

  // Optional overrides (we’ll fill from Job if missing)
  jobTitle: z.string().optional(),
  roleName: z.string().optional(),
  company: z.string().optional(),
  languages: z.array(z.string()).optional(),

  // Optional personalization (keys are emails, values are names)
  nameMap: z.record(z.string(), z.string()).optional(),
  message: z.string().optional(),
});

function buildGreeting(name?: string) {
  const trimmed = (name || "").trim();
  return trimmed ? `Hi ${trimmed},` : "Hi,";
}

function buildMessageBlock(message?: string) {
  const msg = (message || "").trim();
  if (!msg) return "";
  // Full HTML block inserted into {{messageBlock}}
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" style="border-collapse: separate; margin: 0 0 16px; width: 100%">
      <tr>
        <td style="padding: 14px 14px; background: #0f172a; border: 1px dashed #334155; border-radius: 12px; color: #cbd5e1; font-size: 14px">
          ${escapeHtml(msg)}
        </td>
      </tr>
    </table>
  `.trim();
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function POST(req: NextRequest) {
  try {
    if (!(req.headers.get("content-type") || "").includes("application/json")) {
      return NextResponse.json(
        { ok: false, error: "Expected application/json" },
        { status: 400 }
      );
    }

    const raw = await req.json();
    const parsed = Payload.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid input" },
        { status: 400 }
      );
    }
    const body = parsed.data;

    // Optional: validate nameMap keys are emails (since record() can’t enforce)
    if (body.nameMap) {
      for (const k of Object.keys(body.nameMap)) {
        // very light check; zod already validated primary email list strictly
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(k)) {
          return NextResponse.json(
            { ok: false, error: `nameMap key is not a valid email: ${k}` },
            { status: 400 }
          );
        }
      }
    }

    const code = (body.code || body.jobCode || "").toUpperCase();

    if (!code && !body.link) {
      return NextResponse.json(
        { ok: false, error: "Missing code or link" },
        { status: 400 }
      );
    }

    // Fetch Job to auto-fill company/title/languages when possible
    await dbConnect();
    const job = code
      ? await Job.findOne(
          { code },
          { title: 1, roleName: 1, company: 1, languages: 1 }
        ).lean()
      : null;

    const resolvedTitle =
      body.jobTitle || body.roleName || job?.title || job?.roleName || "Role";
    const resolvedCompany = body.company || job?.company || "your company";
    const resolvedLangs: string[] =
      body.languages ||
      (Array.isArray(job?.languages) ? (job!.languages as string[]) : []) ||
      [];

    const langsLabel =
      resolvedLangs.length > 0
        ? resolvedLangs.map((c) => ISO_TO_LABEL[c] ?? c).join(", ")
        : "English";

    const subject = `Zuri interview invite — ${code || "Job"}`;

    // Build a base link; per recipient we’ll add ?email & ?ivt
    const origin = new URL(req.url).origin;
    const baseLink = body.link?.startsWith("http")
      ? body.link
      : new URL(
          body.link || (code ? `/jobs/apply?code=${code}` : "/jobs/apply"),
          origin
        ).toString();

    const baseRepl = {
      code,
      jobTitle: resolvedTitle,
      company: resolvedCompany,
      languages: langsLabel,
      year: new Date().getFullYear().toString(),
    };

    const results: Array<{
      to: string;
      ok: boolean;
      email?: ReturnType<typeof normalizeSendResult>;
      error?: string;
    }> = [];

    for (const to of body.emails) {
      try {
        const toLc = to.toLowerCase();
        const ivt = signInvite({ email: toLc, code: code || "" });

        const url = new URL(baseLink);
        if (code && !url.searchParams.get("code"))
          url.searchParams.set("code", code);
        url.searchParams.set("email", toLc);
        url.searchParams.set("ivt", ivt);

        const greeting = buildGreeting(body.nameMap?.[to]);
        const messageBlock = buildMessageBlock(body.message);

        const replacements = {
          ...baseRepl,
          link: url.toString(),
          greeting,
          messageBlock,
        };

        const rawRes = (await sendEmail({
          to,
          subject,
          template: "zuri-invite",
          replacements,
          replyTo: process.env.CONTACT_TO_EMAIL || undefined,
        })) as RawSendResult;

        const info = normalizeSendResult(rawRes);
        if (!info) results.push({ to, ok: false, error: "Send failed" });
        else results.push({ to, ok: true, email: info });
      } catch (e: any) {
        results.push({ to, ok: false, error: e?.message || "Send error" });
      }
    }

    return NextResponse.json(
      { ok: true, sent: results.filter((r) => r.ok).length, results },
      { status: 200 }
    );
  } catch (e) {
    console.error("POST /api/email/invite-multi error:", e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
