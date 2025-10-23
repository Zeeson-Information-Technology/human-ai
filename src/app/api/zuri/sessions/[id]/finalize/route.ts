// ================================
// FILE: src/app/api/zuri/sessions/[id]/finalize/route.ts
// Finalize session + (fire-and-forget) emails to candidate & admin
// ================================
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/db-connect";
import Session from "@/model/session";
import sendEmail from "@/lib/sendSmtpMail";

/** Format a date in Africa/Lagos for email */
function formatLagos(dt: Date) {
  try {
    return new Intl.DateTimeFormat("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Africa/Lagos",
    }).format(dt);
  } catch {
    return dt.toISOString();
  }
}

/** Build admin review URL (no token) */
function adminUrlFor(id: string) {
  const base = process.env.APP_BASE_URL || "http://localhost:3000";
  return `${base}/admin/interviews/${id}`;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const id = (params.id || "").trim();
    const token = (req.nextUrl.searchParams.get("t") || "").trim();

    if (!id || !Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { ok: false, error: "Bad session id" },
        { status: 400 }
      );
    }
    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Missing token" },
        { status: 400 }
      );
    }

    // Load for mutate
    const session = await Session.findOne({
      _id: new Types.ObjectId(id),
      token,
    });

    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 }
      );
    }

    // If already finished, respond quickly
    if (session.status === "finished" && session.finishedAt) {
      return NextResponse.json({
        ok: true,
        finishedAt: session.finishedAt.toISOString(),
        score: session.scorecard?.overallScore ?? null,
        emailed: "skipped (already finished)",
      });
    }

    // --- Minimal scoring stub ---
    const total = Array.isArray(session.steps) ? session.steps.length : 0;
    const answered = (session.steps || []).filter(
      (s: any) => s?.audioUrl || s?.transcript || s?.answerText
    ).length;
    const overallScore = total > 0 ? Math.round((answered / total) * 100) : 0;

    session.status = "finished";
    session.finishedAt = new Date();

    if (!session.scorecard) {
      session.scorecard = {
        overallScore,
        verdict:
          overallScore >= 80
            ? "strong-hire"
            : overallScore >= 60
            ? "hire"
            : "no-hire",
        summary:
          total > 0
            ? `Answered ${answered} of ${total} questions.`
            : "Interview completed.",
        competencies: [],
        nextSteps: "",
      } as any;
    }

    await session.save();

    // Build stable values for emails
    const finishedAtLocal = formatLagos(session.finishedAt!);
    const adminUrl = adminUrlFor(String(session._id));
    const focusAreas = Array.isArray(session.focusAreasSnapshot)
      ? session.focusAreasSnapshot.join(", ")
      : "";

    // Precompute HTML-only placeholders (no template logic)
    const year = String(new Date().getFullYear());
    const company = session.company || "";
    const atCompany = company ? ` at ${company}` : ""; // for candidate template

    const roleLabel = session.roleName || "the role";
    const jobTitle = session.jobTitle || "";
    const candidateName = session.candidate?.name || "Candidate";
    const candidateEmail = (session.candidate?.email || "").trim();
    const candidatePhone = session.candidate?.phone || "";
    const language = session.language || "en";

    const scoreStr = String(session.scorecard?.overallScore ?? overallScore);
    const verdict = session.scorecard?.verdict || "";
    const summary = session.scorecard?.summary || "";

    // Prepare email tasks (fire-and-forget — DO NOT await)
    const emailTasks: Promise<any>[] = [];

    // 1) Candidate email (template: session-complete)
    try {
      if (candidateEmail) {
        emailTasks.push(
          sendEmail({
            to: candidateEmail,
            subject: "Your Zuri interview is complete",
            template: "session-complete",
            replacements: {
              name: candidateName,
              role: roleLabel,
              company, // raw company if you need it elsewhere
              atCompany, // " at Acme" or ""
              jobTitle,
              score: scoreStr,
              year,
            },
            replyTo:
              process.env.CONTACT_TO_EMAIL ||
              process.env.ZEPTOMAIL_FROM_ADDRESS ||
              "noreply@diboruwa.com",
          })
        );
      }
    } catch (e) {
      console.error("Finalize: candidate email queue error:", e);
    }

    // 2) Admin notification (template: session-admin-complete)
    try {
      const adminListRaw =
        process.env.INTERVIEW_NOTIFICATIONS_TO ||
        process.env.CONTACT_TO_EMAIL ||
        "";
      const adminRecipients = adminListRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (adminRecipients.length) {
        const subject = `Interview complete — ${
          jobTitle || roleLabel
        } • ${candidateName}`;
        for (const to of adminRecipients) {
          emailTasks.push(
            sendEmail({
              to,
              subject,
              template: "session-admin-complete",
              replacements: {
                candidateName,
                candidateEmail,
                candidatePhone,
                jobTitle,
                roleName: roleLabel,
                company,
                language,
                finishedAt: finishedAtLocal,
                overallScore: scoreStr,
                verdict,
                summary,
                focusAreas,
                adminUrl,
                year,
              },
              replyTo:
                process.env.CONTACT_TO_EMAIL ||
                process.env.ZEPTOMAIL_FROM_ADDRESS ||
                "noreply@diboruwa.com",
            })
          );
        }
      }
    } catch (e) {
      console.error("Finalize: admin email queue error:", e);
    }

    // Fire-and-forget (do not await; keep finalize snappy)
    Promise.allSettled(emailTasks).catch((e) =>
      console.error("Finalize email send error:", e)
    );

    // Respond immediately; UI can navigate right away
    return NextResponse.json(
      {
        ok: true,
        finishedAt: session.finishedAt.toISOString(),
        score: scoreStr,
        emailsQueued: emailTasks.length,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("POST finalize error", e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
