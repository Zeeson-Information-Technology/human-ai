// src/app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-utils";
import dbConnect from "@/lib/db-connect";
import User from "@/model/user";

// Only the fields you actually select/return from /me
type MeProjection = {
  _id: any;
  email?: string;
  name?: string;
  company?: string;
  role: "admin" | "company" | "talent";
  isVerified?: boolean;

  avatar?: { url?: string; publicId?: string; uploadedAt?: Date };
  // legacy fallback some old rows may have
  avatarUrl?: string;

  // contact
  linkedin?: string;
  phone?: string;
  phoneCountryCode?: string;
  whatsapp?: string;
  whatsappCountryCode?: string;

  // resume
  resume?: { url?: string; fileName?: string; uploadedAt?: Date };

  // preferences
  openToWork?: boolean;
  minMonthly?: number | null;
  minHourly?: number | null;
  interests?: string[];

  allowEmail?: boolean;
  allowPhone?: boolean;
  allowWhatsApp?: boolean;

  // availability
  timezone?: string;
  hoursPerWeek?: number | null;
  daysAvailable?: string[]; // e.g. ["Mon","Tue"]
  startHour?: string | null; // "09:00"
  endHour?: string | null; // "17:00"
};

export async function GET() {
  await dbConnect();

  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const userId = (sessionUser as any).userId || (sessionUser as any).id;

  const doc = await User.findById(userId)
    .select(
      [
        "email",
        "name",
        "company",
        "role",
        "isVerified",
        // avatar (nested) + legacy
        "avatar.url",
        "avatar.publicId",
        "avatar.uploadedAt",
        "avatarUrl",
        // contact
        "linkedin",
        "phone",
        "phoneCountryCode",
        "whatsapp",
        "whatsappCountryCode",
        // resume (nested)
        "resume.url",
        "resume.fileName",
        "resume.uploadedAt",
        // preferences
        "openToWork",
        "minMonthly",
        "minHourly",
        "interests",
        "allowEmail",
        "allowPhone",
        "allowWhatsApp",
        // availability
        "timezone",
        "hoursPerWeek",
        "daysAvailable",
        "startHour",
        "endHour",
      ].join(" ")
    )
    .lean<MeProjection>(); // 👈 precise type for doc

  if (!doc) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  // Normalize legacy avatarUrl → avatar.url
  const avatar = doc.avatar?.url
    ? doc.avatar
    : doc.avatarUrl
    ? { url: doc.avatarUrl }
    : undefined;

  const user = {
    id: String(doc._id),
    email: doc.email ?? "",
    name: doc.name ?? "",
    company: doc.company ?? "",
    role: doc.role,
    isVerified: !!doc.isVerified,

    avatar, // { url?, publicId?, uploadedAt? } | undefined

    linkedin: doc.linkedin ?? "",
    phone: doc.phone ?? "",
    phoneCountryCode: (doc as any).phoneCountryCode ?? "",
    whatsapp: doc.whatsapp ?? "",
    whatsappCountryCode: (doc as any).whatsappCountryCode ?? "",

    resume: doc.resume ?? null, // { url?, fileName?, uploadedAt? } | null

    openToWork: doc.openToWork ?? false,
    minMonthly: doc.minMonthly ?? null,
    minHourly: doc.minHourly ?? null,
    interests: Array.isArray(doc.interests) ? doc.interests : [],

    allowEmail: doc.allowEmail ?? true,
    allowPhone: doc.allowPhone ?? false,
    allowWhatsApp: doc.allowWhatsApp ?? false,

    timezone: doc.timezone ?? "",
    hoursPerWeek: doc.hoursPerWeek ?? null,
    daysAvailable: Array.isArray(doc.daysAvailable) ? doc.daysAvailable : [],
    startHour: doc.startHour ?? null,
    endHour: doc.endHour ?? null,
  };

  return NextResponse.json({ user }, { status: 200 });
}
