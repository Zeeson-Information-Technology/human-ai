// src/app/api/admin/update-profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import User from "@/model/user";
import { z } from "zod";
import { isAdmin } from "@/lib/admin-auth";
import { parsePhone } from "@/lib/phone";
import { getSessionUser } from "@/lib/auth-utils";

const Schema = z.object({
  name: z.string().trim().optional(),
  company: z.string().trim().optional(),
  avatarUrl: z.string().url().optional(),
  phone: z.string().trim().optional(), // <-- add this
});

export async function POST(req: NextRequest) {
  await dbConnect();

  if (!isAdmin(req)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const me = await getSessionUser();
  if (!me) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid input" },
      { status: 400 }
    );
  }

  const $set: any = { ...parsed.data };
  if ($set.phone !== undefined) {
    const { code, e164 } = parsePhone($set.phone);
    $set.phone = e164 || $set.phone;
    $set.phoneCountryCode = code;
  }
  await User.updateOne({ _id: me.id }, { $set });
  return NextResponse.json({ ok: true });
}
