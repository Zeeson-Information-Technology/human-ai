// /src/app/api/contact/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/db-connect";
import PilotRequest from "@/model/pilot-request";
import sendEmail from "@/lib/sendSmtpMail";

// Normalize Nodemailer-like results (accepted: (string | Address)[]) into string[]
type AddressLike = string | { address?: string | null };

// What we return downstream / expose to client
type SendResult = {
  messageId?: string | null;
  accepted?: string[];
  response?: string | null;
} | null;

// What sendEmail might actually return (looser)
type RawSendResult = {
  messageId?: string | null;
  accepted?: AddressLike[];
  response?: string | null;
} | null;

type SendError = unknown;

const PayloadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().min(2),
  message: z.string().min(10),
  website: z.string().optional(), // honeypot
});

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Coerce RawSendResult -> SendResult (string[] accepted)
function normalizeSendResult(raw: RawSendResult): SendResult {
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

export async function POST(req: Request) {
  const sentAt = new Date().toISOString();

  try {
    const raw = await req.json();
    const parsed = PayloadSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid input" },
        { status: 400 }
      );
    }
    const body = parsed.data;

    // Honeypot
    if (body.website) return NextResponse.json({ ok: true, skipped: true });

    const to = process.env.CONTACT_TO_EMAIL;
    if (!to) {
      return NextResponse.json(
        { ok: false, error: "CONTACT_TO_EMAIL is not configured" },
        { status: 500 }
      );
    }

    // Save lead
    await dbConnect();
    const created = await PilotRequest.create({
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      company: body.company.trim(),
      message: body.message.trim(),
      source: "landing_form",
      handled: false,
    });

    const safeMsg = escapeHtml(created.message).replace(/\n/g, "<br/>");
    const year = new Date().getFullYear();

    // Send emails and capture results (typed + normalized)
    let internalRes: SendResult = null;
    let confirmRes: SendResult = null;
    let internalErr: SendError = null;
    let confirmErr: SendError = null;

    try {
      const rawInternal: RawSendResult = await sendEmail({
        to,
        subject: `New pilot request — ${created.company}`,
        template: "pilot-request",
        replacements: {
          name: created.name,
          email: created.email,
          company: created.company,
          message: safeMsg,
          year,
        },
        replyTo: created.email,
      });
      internalRes = normalizeSendResult(rawInternal);
      if (internalRes && internalRes.messageId) {
        console.log("Internal email sent:", internalRes);
      }
    } catch (e) {
      internalErr = e;
      console.error("Internal email error:", e);
    }

    // Send confirmation email after internal email
    try {
      const rawConfirm: RawSendResult = await sendEmail({
        to: created.email,
        subject: "We received your pilot request",
        template: "pilot-confirm",
        replacements: {
          name: created.name,
          company: created.company,
          year,
        },
        replyTo: process.env.ZEPTOMAIL_FROM_ADDRESS || "noreply@diboruwa.com",
      });
      confirmRes = normalizeSendResult(rawConfirm);
      if (confirmRes && confirmRes.messageId) {
        console.log("Confirmation email sent:", confirmRes);
      }
    } catch (e) {
      confirmErr = e;
      console.error("Confirm email error:", e);
    }

    // Build response payload with email status
    const response = {
      ok: true,
      leadId: String(created._id),
      sentAt,
      email: {
        internal: internalRes
          ? {
              ok: true,
              messageId: internalRes.messageId ?? null,
              accepted: internalRes.accepted ?? [],
              response: internalRes.response ?? null,
            }
          : { ok: false, error: String(internalErr ?? "Unknown error") },
        confirmation: confirmRes
          ? {
              ok: true,
              messageId: confirmRes.messageId ?? null,
              accepted: confirmRes.accepted ?? [],
              response: confirmRes.response ?? null,
            }
          : { ok: false, error: String(confirmErr ?? "Unknown error") },
      },
    };

    // If both emails failed, surface as a 207 Multi-Status-like signal (still 200 for client simplicity)
    return NextResponse.json(response);
  } catch (err) {
    console.error("Contact route error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
