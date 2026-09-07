export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/db-connect";
import Inquiry from "@/model/inquiry";
import sendEmail from "@/lib/sendSmtpMail";

type AddressLike = string | { address?: string | null };

type SendResult = {
  messageId?: string | null;
  accepted?: string[];
  response?: string | null;
} | null;

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
  website: z.string().optional(),
});

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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

    if (body.website) return NextResponse.json({ ok: true, skipped: true });

    const to = process.env.CONTACT_TO_EMAIL;
    if (!to) {
      return NextResponse.json(
        { ok: false, error: "CONTACT_TO_EMAIL is not configured" },
        { status: 500 }
      );
    }

    await dbConnect();
    const created = await Inquiry.create({
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      company: body.company.trim(),
      message: body.message.trim(),
      source: "landing_form",
      handled: false,
      assignedUserEmail: "",
    });

    const safeMsg = escapeHtml(created.message).replace(/\n/g, "<br/>");
    const year = new Date().getFullYear();
    const internalSubject = `New proposal inquiry - ${created.company}`;

    let internalRes: SendResult = null;
    let confirmRes: SendResult = null;
    let internalErr: SendError = null;
    let confirmErr: SendError = null;

    try {
      const rawInternal: RawSendResult = await sendEmail({
        to,
        subject: internalSubject,
        template: "pilot-request",
        replacements: {
          name: created.name,
          email: created.email,
          company: created.company,
          message: safeMsg,
          year,
          subject: internalSubject,
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

    try {
      const rawConfirm: RawSendResult = await sendEmail({
        to: created.email,
        subject: "Thanks - we received your request",
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

    return NextResponse.json(response);
  } catch (err) {
    console.error("Contact route error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
