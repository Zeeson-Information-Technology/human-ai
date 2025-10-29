// src/app/api/talent/update-avatar/route.ts
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/db-connect";
import User from "@/model/user";
import { getSessionUser } from "@/lib/auth-utils";
import { z } from "zod";

const Schema = z.object({
  url: z.string().url(),
  publicId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  await dbConnect();
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
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

  const { url, publicId } = parsed.data;
  await User.updateOne(
    { _id: (sessionUser as any).userId || (sessionUser as any).id },
    { $set: { avatar: { url, publicId, uploadedAt: new Date() } } }
  );

  return NextResponse.json({ ok: true });
}
