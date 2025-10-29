export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Session from "@/model/session";
import { getSessionUser } from "@/lib/auth-utils";

function verifySessionTokenGeneric(session: any, t: string): boolean {
  if (!t || !session) return false;
  const cands = [
    session?.meta?.accessToken,
    session?.meta?.token,
    session?.accessToken,
    session?.token,
    session?.clientToken,
    session?.t,
  ].filter(Boolean);
  return cands.includes(t);
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> } // 👈 Promise
) {
  try {
    await dbConnect();

    const { id } = await ctx.params; // 👈 await
    const url = new URL(req.url);
    const t = (url.searchParams.get("t") || "").trim();

    const session = await Session.findById(id);
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 }
      );
    }

    let authed = verifySessionTokenGeneric(session, t);
    if (!authed) {
      const user = await getSessionUser(req);
      if (user?.role === "admin" || user?.role === "company") authed = true;
    }
    if (!authed)
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );

    const form = await req.formData();
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const consent = String(form.get("consent") || "") === "true";

    if (name) session.candidate.name = name;
    if (email) session.candidate.email = email;
    if (phone) session.candidate.phone = phone;
    if (consent)
      (session as any).meta = {
        ...((session as any).meta || {}),
        consent: true,
      };

    await session.save();

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "prefight failed" },
      { status: 500 }
    );
  }
}
