// FILE: src/app/api/invite/verify/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { verifyInvite } from "@/lib/invite-token";

export async function GET(req: NextRequest) {
  const ivt = req.nextUrl.searchParams.get("ivt") || "";
  const data = verifyInvite(ivt);
  if (!data) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 200 });
  }
  return NextResponse.json({ ok: true, payload: data }, { status: 200 });
}
