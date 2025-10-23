// src/app/api/talent/update-profile/route.ts
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/db-connect";
import User from "@/model/user";
import { getSessionUser } from "@/lib/auth-utils";
import { z } from "zod";
import { parsePhone } from "@/lib/phone";

const ResumeZ = z
  .object({
    url: z.string().url(),
    fileName: z.string().optional(),
    publicId: z.string().optional(),
    uploadedAt: z.coerce.date().optional(),
  })
  .partial()
  .refine((v) => !!v.url, { message: "resume.url required", path: ["url"] });

const BodyZ = z.object({
  name: z.string().min(1).max(120).optional(),
  avatarUrl: z.string().url().optional(),
  phone: z.string().min(3).max(64).optional(),
  resume: ResumeZ.optional(),
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

  const { name, avatarUrl, phone, resume } = parsed.data;

  const $set: Record<string, unknown> = {};
  if (name !== undefined) $set.name = name;
  if (avatarUrl !== undefined) $set.avatarUrl = avatarUrl;
  if (phone !== undefined) {
    const { code, e164 } = parsePhone(phone);
    $set.phone = e164 || phone;
    $set.phoneCountryCode = code;
  }
  if (resume) {
    $set["resume"] = {
      url: resume.url,
      fileName: resume.fileName ?? undefined,
      uploadedAt: resume.uploadedAt ?? new Date(),
      publicId: resume.publicId ?? undefined,
    };
  }

  await User.updateOne({ _id: (session as any).id }, { $set });

  return NextResponse.json({ ok: true });
}
