export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Session from "@/model/session";
import { verifyInvite } from "@/lib/invite-token";

// GET /api/zuri/sessions/invite-status?code=JOBCODE&email=user@example.com&ivt=TOKEN
// Returns whether there is an existing session for this job + email,
// and if so, the status (e.g., finished) and finishedAt timestamp.
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const codeParam = (req.nextUrl.searchParams.get("code") || "").trim();
    const emailParam = (req.nextUrl.searchParams.get("email") || "").trim();
    const ivt = (req.nextUrl.searchParams.get("ivt") || "").trim();

    const jobCode = codeParam.toUpperCase();
    const email = emailParam.toLowerCase();

    if (!jobCode || !email) {
      return NextResponse.json(
        { ok: false, error: "Missing job code or email" },
        { status: 400 }
      );
    }

    // If an invite token is present, we best-effort validate it for logging,
    // but we do not block status checks on invalid/expired tokens. The goal
    // here is just to inform the candidate if they already completed an
    // interview, not to enforce security.
    if (ivt) {
      try {
        const payload = verifyInvite(ivt);
        if (
          payload &&
          (payload.email !== email ||
            payload.code.toUpperCase() !== jobCode)
        ) {
          console.warn(
            "[invite-status] Invite token payload does not match query params",
            {
              payloadEmail: payload.email,
              payloadCode: payload.code,
              queryEmail: email,
              queryCode: jobCode,
            }
          );
        }
      } catch (e) {
        console.warn("[invite-status] invite token verification error", e);
      }
    }

    const session = await Session.findOne(
      { jobCode, "candidate.email": email },
      { status: 1, finishedAt: 1 }
    )
      .sort({ createdAt: -1 })
      .lean();

    if (!session) {
      if (process.env.NODE_ENV !== "production") {
        console.log("[invite-status] no session found", {
          jobCode,
          email,
        });
      }
      return NextResponse.json(
        { ok: true, hasSession: false },
        { status: 200 }
      );
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("[invite-status] session match", {
        jobCode,
        email,
        status: session.status,
        finishedAt: session.finishedAt,
      });
    }

    return NextResponse.json(
      {
        ok: true,
        hasSession: true,
        status: session.status,
        finishedAt: session.finishedAt
          ? (session.finishedAt as Date).toISOString()
          : null,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("invite-status error", e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
