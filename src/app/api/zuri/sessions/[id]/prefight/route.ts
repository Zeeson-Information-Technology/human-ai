// src/app/api/zuri/sessions/[id]/prefight/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Session from "@/model/session";
import { getSessionUser } from "@/lib/auth-utils";

export const runtime = "nodejs";

// Loose helper that validates `t` against common token fields on the session.
// Adjust this to your exact schema when you confirm the field name.
function verifySessionTokenGeneric(session: any, t: string): boolean {
  if (!t || !session) return false;
  const cands = [
    session?.meta?.accessToken,
    session?.meta?.token,
    session?.accessToken,
    session?.token,
    session?.clientToken,
    session?.t, // just in case
  ].filter(Boolean);
  return cands.includes(t);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const id = params.id;
    const url = new URL(req.url);
    const t = url.searchParams.get("t") || "";

    const session = await Session.findById(id);
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 }
      );
    }

    // 1) Prefer per-session token (?t=...) for candidate calls
    let authed = verifySessionTokenGeneric(session, t);

    // 2) Fallback: allow privileged server-side users (admin/company) to perform the update
    if (!authed) {
      const user = await getSessionUser(req);
      if (user?.role === "admin" || user?.role === "company") {
        authed = true;
      }
    }

    if (!authed) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const form = await req.formData();
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const consent = String(form.get("consent") || "") === "true";

    // Optional resume upload — if you want to support uploads here,
    // plug your Cloud/S3/Cloudinary pipeline and set candidate.resumeUrl.
    const resume = form.get("resume") as File | null;
    // const resumeUrl = resume ? await uploadResume(resume) : null;

    // Update only provided fields
    if (name) session.candidate.name = name;
    if (email) session.candidate.email = email;
    if (phone) session.candidate.phone = phone;
    if (consent) {
      (session as any).meta = {
        ...((session as any).meta || {}),
        consent: true,
      };
    }
    // if (resumeUrl) session.candidate.resumeUrl = resumeUrl;

    await session.save();

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "prefight failed" },
      { status: 500 }
    );
  }
}
