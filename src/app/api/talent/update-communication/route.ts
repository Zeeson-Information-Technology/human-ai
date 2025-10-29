// src/app/api/talent/update-communication/route.ts
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/db-connect";
import User from "@/model/user";
import { getSessionUser } from "@/lib/auth-utils";
import { z } from "zod";
import { parsePhone } from "@/lib/phone";

const BodyZ = z.object({
  openToWork: z.boolean().optional(),
  // email is shown/locked; allow but ignore updates server-side (or validate & set if you decide)
  email: z.string().email().optional(),
  phone: z.string().min(3).max(64).optional(),
  whatsapp: z.string().min(3).max(64).optional(),
  minMonthly: z.number().nonnegative().optional(),
  minHourly: z.number().nonnegative().optional(),
  interests: z.array(z.string()).optional(),
  allowEmail: z.boolean().optional(),
  allowPhone: z.boolean().optional(),
  allowWhatsApp: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  await dbConnect();

  const session = await getSessionUser();
  if (!session || session.role !== "talent") {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();
  const parsed = BodyZ.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const {
    openToWork,
    /* email, */ phone,
    whatsapp,
    minMonthly,
    minHourly,
    interests,
    allowEmail,
    allowPhone,
    allowWhatsApp,
  } = parsed.data;

  const $set: Record<string, unknown> = {};
  if (openToWork !== undefined) $set.openToWork = openToWork;
  if (phone !== undefined) {
    const { code, e164 } = parsePhone(phone);
    $set.phone = e164 || phone;
    $set.phoneCountryCode = code;
  }
  if (whatsapp !== undefined) {
    const { code, e164 } = parsePhone(whatsapp);
    $set.whatsapp = e164 || whatsapp;
    $set.whatsappCountryCode = code;
  }
  if (minMonthly !== undefined) $set.minMonthly = minMonthly;
  if (minHourly !== undefined) $set.minHourly = minHourly;
  if (interests !== undefined) $set.interests = interests;
  if (allowEmail !== undefined) $set.allowEmail = allowEmail;
  if (allowPhone !== undefined) $set.allowPhone = allowPhone;
  if (allowWhatsApp !== undefined) $set.allowWhatsApp = allowWhatsApp;

  // NOTE: ignoring email updates to keep account identifier stable.
  await User.updateOne({ _id: (session as any).id }, { $set });

  return NextResponse.json({ ok: true });
}
