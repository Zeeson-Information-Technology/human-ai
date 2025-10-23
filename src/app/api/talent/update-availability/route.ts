// src/app/api/talent/update-availability/route.ts
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/db-connect";
import User from "@/model/user";
import { getSessionUser } from "@/lib/auth-utils";
import { z } from "zod";

const BodyZ = z.object({
  timezone: z.string().min(2).max(80).optional(),
  hoursPerWeek: z.number().int().min(0).max(100).optional(),
  daysAvailable: z
    .array(z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]))
    .optional(),
  startHour: z.number().int().min(0).max(23).optional(),
  endHour: z.number().int().min(0).max(23).optional(),
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

  const { timezone, hoursPerWeek, daysAvailable, startHour, endHour } =
    parsed.data;
  const $set: Record<string, unknown> = {};
  if (timezone !== undefined) $set.timezone = timezone;
  if (hoursPerWeek !== undefined) $set.hoursPerWeek = hoursPerWeek;
  if (daysAvailable !== undefined) $set.daysAvailable = daysAvailable;
  if (startHour !== undefined) $set.startHour = startHour;
  if (endHour !== undefined) $set.endHour = endHour;

  await User.updateOne({ _id: (session as any).id }, { $set });

  return NextResponse.json({ ok: true });
}
