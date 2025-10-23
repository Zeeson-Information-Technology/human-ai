// src/app/api/admin/update-availability/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import User from "@/model/user";
import { z } from "zod";
import { isAdmin } from "@/lib/admin-auth";
import { getSessionUser } from "@/lib/auth-utils";

const Schema = z.object({
  timezone: z.string().optional(),
  hoursPerWeek: z.number().nonnegative().optional(),
  daysAvailable: z.array(z.string()).optional(),
  startHour: z.number().min(0).max(23).optional(),
  endHour: z.number().min(0).max(23).optional(),
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
  if (!me)
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid input" },
      { status: 400 }
    );
  }

  await User.updateOne({ _id: me.id }, { $set: parsed.data });
  return NextResponse.json({ ok: true });
}
