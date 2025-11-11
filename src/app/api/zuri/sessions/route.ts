export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Session from "@/model/session";
import { Job, type JobDoc } from "@/model/job";
import { Types } from "mongoose";
import { z } from "zod";
import { verifyInvite } from "@/lib/invite-token";
import User from "@/model/user";

const CreateSessionSchema = z.object({
  jobCode: z.string().trim().optional(),
  roleName: z.string().trim().optional(),
  language: z.string().trim().min(2).optional(), // make optional; we’ll derive if missing

  // accept either name
  inviteToken: z.string().trim().optional(),
  ivt: z.string().trim().optional(),

  candidate: z.object({
    name: z.string().trim().min(1),
    email: z.string().email(),
    phone: z.string().trim().optional(),
    linkedin: z.string().url().optional(),
    // you can add screener answers here later if needed
  }),

  resume: z
    .object({
      url: z.string().url().optional(),
      publicId: z.string().trim().optional(),
      fileName: z.string().trim().optional(),
    })
    .optional(),
  screeners: z
    .object({
      legacy: z
        .array(z.object({ question: z.string(), answer: z.any() }))
        .optional()
        .default([]),
      rules: z
        .array(
          z.object({
            question: z.string(),
            kind: z.string().optional(),
            category: z.string().optional(),
            answer: z.any(),
          })
        )
        .optional()
        .default([]),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const raw = await req.json().catch(() => null);
    const parsed = CreateSessionSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid payload", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    let {
      jobCode: jobCodeIn,
      roleName,
      language: langIn,
      inviteToken,
      ivt,
      candidate,
      resume,
      screeners,
    } = parsed.data;

    // Normalize inputs
    const emailLc = candidate.email.trim().toLowerCase();
    const token = (inviteToken || ivt || "").trim();

    // If an invite token is present, verify and enforce it
    if (token) {
      const payload = verifyInvite(token);
      if (!payload) {
        return NextResponse.json(
          { ok: false, error: "Invalid invite token" },
          { status: 400 }
        );
      }

      // Enforce invited email
      if (payload.email !== emailLc) {
        return NextResponse.json(
          { ok: false, error: "Use the invited email to apply" },
          { status: 400 }
        );
      }

      // Enforce / derive job code from token
      const codeFromToken = payload.code.toUpperCase();
      if (jobCodeIn && jobCodeIn.toUpperCase() !== codeFromToken) {
        return NextResponse.json(
          { ok: false, error: "Invite token does not match this job" },
          { status: 400 }
        );
      }
      jobCodeIn = codeFromToken;
    }

    // Resolve job by code (if present)
    const jobCodeUp = jobCodeIn ? jobCodeIn.toUpperCase() : undefined;
    const job: JobDoc | null = jobCodeUp
      ? await Job.findOne({ code: jobCodeUp, active: { $ne: false } }).exec()
      : null;

    // Determine language: explicit → job default → "en"
    const language =
      (langIn && langIn.trim()) ||
      (Array.isArray(job?.languages) && job?.languages.length
        ? String(job!.languages[0])
        : "en");

    // Seed initial steps from job.questionsOverride (optional, language-aware)
    let steps: Array<{
      qId: Types.ObjectId;
      qText: string;
      followupHint?: string;
      source?: "admin" | "ai";
    }> = [];

    if (Array.isArray(job?.questionsOverride) && job.questionsOverride.length) {
      const qs = job.questionsOverride
        .filter((q) => !q.lang || q.lang === language)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      steps = qs.map((q) => ({
        qId: new Types.ObjectId(), // synthetic qId for overrides
        qText: String(q.text || "").trim(),
        source: "admin",
      }));
    }

    // ----- Evaluate screener rules (soft) using the Job definition -----
    function coerceBool(v: any): boolean | undefined {
      if (typeof v === "boolean") return v;
      if (typeof v === "string") {
        if (v.toLowerCase() === "true") return true;
        if (v.toLowerCase() === "false") return false;
      }
      return undefined;
    }
    function coerceNum(v: any): number | undefined {
      const n = typeof v === "number" ? v : Number(v);
      return Number.isFinite(n) ? n : undefined;
    }
    type Qual = "lt" | "lte" | "eq" | "gte" | "gt" | "neq" | "in" | "nin";
    function evalRule(
      jobRule: any,
      ans: any
    ): boolean | undefined {
      if (!jobRule || !jobRule.qualifying) return undefined; // only evaluate qualifying rules
      const when: Qual | undefined = jobRule.qualifyWhen;
      const qv = jobRule.qualifyValue;
      if (!when || typeof qv === "undefined" || qv === null) return undefined;

      const kind: string = jobRule.kind;

      if (kind === "number" || kind === "currency") {
        const a = coerceNum(ans);
        const b = coerceNum(qv);
        if (typeof a === "undefined") return false; // invalid numeric answer fails
        if (typeof b === "undefined") return false; // invalid threshold
        switch (when) {
          case "lt":
            return a < b;
          case "lte":
            return a <= b;
          case "eq":
            return a === b;
          case "gte":
            return a >= b;
          case "gt":
            return a > b;
          case "neq":
            return a !== b;
          default:
            return undefined;
        }
      }

      if (kind === "boolean") {
        const a = coerceBool(ans);
        const b = coerceBool(qv);
        if (typeof a === "undefined" || typeof b === "undefined") return false;
        switch (when) {
          case "eq":
            return a === b;
          case "neq":
            return a !== b;
          default:
            return undefined;
        }
      }

      // default to string/select comparison
      const a = String(ans ?? "");
      if (when === "in") {
        const arr = Array.isArray(qv) ? qv : String(qv).split(",").map((x) => String(x).trim()).filter(Boolean);
        return arr.includes(a);
      }
      if (when === "nin") {
        const arr = Array.isArray(qv) ? qv : String(qv).split(",").map((x) => String(x).trim()).filter(Boolean);
        return !arr.includes(a);
      }
      if (when === "eq") return a === String(qv);
      if (when === "neq") return a !== String(qv);
      return undefined;
    }

    const jobRules: any[] = Array.isArray(job?.screenerRules) ? (job!.screenerRules as any[]) : [];
    const incomingRules: any[] = Array.isArray(screeners?.rules) ? (screeners!.rules as any[]) : [];
    const rulesMerged = incomingRules.map((r, i) => {
      const j = jobRules[i] || jobRules.find((x) => String(x?.question || "") === String(r?.question || "")) || {};
      const pass = evalRule(j, r?.answer);
      return {
        question: String(r?.question || j?.question || ""),
        kind: String(r?.kind || j?.kind || ""),
        category: String(r?.category || j?.category || ""),
        answer: r?.answer ?? "",
        qualifying: !!j?.qualifying,
        qualifyWhen: j?.qualifyWhen,
        qualifyValue: typeof j?.qualifyValue === "undefined" ? undefined : j?.qualifyValue,
        min: typeof j?.min === "number" ? j.min : undefined,
        max: typeof j?.max === "number" ? j.max : undefined,
        options: Array.isArray(j?.options) ? j.options : undefined,
        currency: j?.currency,
        unit: j?.unit,
        pass: typeof pass === "boolean" ? pass : undefined,
      };
    });

    const qualifyingTotal = rulesMerged.filter((x) => x.qualifying).length;
    const qualifyingPassed = rulesMerged.filter((x) => x.qualifying && x.pass === true).length;
    const summary = {
      total: rulesMerged.length,
      qualifyingTotal,
      qualifyingPassed,
      qualifies: qualifyingTotal === 0 ? true : qualifyingPassed === qualifyingTotal,
    };

    // Create Session (token auto-generated by schema)
    const doc = await Session.create({
      status: "running",
      startedAt: new Date(),

      // Job linkage + snapshots
      jobCode: job?.code || jobCodeUp,
      jobId: job?._id,
      jobTitle: job?.title || undefined,
      company: job?.company || undefined,
      roleName: job?.roleName || roleName || "Candidate",
      language,
      ownerId: job?.ownerId || undefined,
      languagesAllowed:
        Array.isArray(job?.languages) && job?.languages.length
          ? job.languages
          : [language],
      jdTextSnapshot: job?.jdText || undefined,
      focusAreasSnapshot: Array.isArray(job?.focusAreas) ? job.focusAreas : [],
      adminFocusNotesSnapshot: job?.adminFocusNotes || undefined,

      // Candidate (persist linkedin if provided)
      candidate: {
        name: candidate.name.trim(),
        email: emailLc,
        phone: candidate.phone || "",
        linkedin: candidate.linkedin || undefined,
        resume: resume
          ? {
              url: resume.url || undefined,
              publicId: resume.publicId || undefined,
            }
          : undefined,
      },

      // Steps
      steps,
      // Screeners captured on apply page + server-evaluated pass/fail
      screeners: {
        legacy: Array.isArray(screeners?.legacy)
          ? screeners!.legacy
              .filter((x: any) => x && String(x.question || "").trim())
              .map((x: any) => ({
                question: String(x.question || "").trim(),
                answer:
                  typeof x.answer === "string"
                    ? x.answer
                    : JSON.stringify(x.answer ?? ""),
              }))
          : [],
        rules: rulesMerged,
      },
      screenersSummary: summary,
      // scorecard will be added at finalize
    });

    // If candidate email matches a user, update their resume
    if (candidate?.email && resume?.url) {
      await User.updateOne(
        { email: candidate.email.toLowerCase() },
        {
          $set: {
            resume: {
              url: resume.url,
              uploadedAt: new Date(),
              fileName: resume.fileName || "",
            },
          },
        }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        id: String(doc._id),
        token: doc.token,
        job: job
          ? { id: String(job._id), code: job.code, title: job.title }
          : undefined,
        steps: steps.length,
        message: steps.length
          ? "Session created with seeded questions."
          : "Session created. No seeded questions; use /append-step with AI.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("/api/zuri/sessions POST error", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
