// src/app/api/email/invite/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import sendEmail from "@/lib/sendSmtpMail";

// Normalize Nodemailer-like results (accepted: (string | Address)[]) into string[]
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
};

const Payload = z.object({
  to: z.string().email(),
  code: z.string().min(4).max(24),
  link: z.string(), // can be relative; we'll absolutize
  // optional context
  jobTitle: z.string().optional(),
  roleName: z.string().optional(),
  company: z.string().optional(),
  languages: z.array(z.string()).optional(), // ["en","yo"]
});

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const parsed = Payload.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid input" },
        { status: 400 }
      );
    }
    const body = parsed.data;

    // Make absolute link if a relative path was sent
    const origin = new URL(req.url).origin;
    const absoluteLink = body.link.startsWith("http")
      ? body.link
      : new URL(body.link, origin).toString();

    const langs = (body.languages ?? [])
      .map((c) => ISO_TO_LABEL[c] ?? c)
      .join(", ");
    const subject = `Zuri interview invite — ${body.code}`;

    // Build replacements for the template
    const replacements = {
      code: body.code,
      link: absoluteLink,
      jobTitle: body.jobTitle ?? body.roleName ?? "Role",
      company: body.company ?? "your company",
      languages: langs || "English",
      year: new Date().getFullYear().toString(),
    };

    // Send the email
    const rawRes = (await sendEmail({
      to: body.to,
      subject,
      template: "zuri-invite",
      replacements,
      replyTo: process.env.CONTACT_TO_EMAIL || undefined,
    })) as RawSendResult;

    const info = normalizeSendResult(rawRes);
    if (!info) {
      return NextResponse.json(
        { ok: false, error: "Send failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, email: info }, { status: 200 });
  } catch (e) {
    console.error("POST /api/email/invite error:", e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
