// ================================
// FILE: src/app/api/zuri/jobs/route.ts  (POST create job)
// ================================
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import { Role } from "@/model/interview";
import { Job, generateJobCode } from "@/model/job";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth-utils";

// Screener rule schema (expanded)
const ScreenerRuleSchema = z.object({
  question: z.string().min(1),
  kind: z.enum(["number", "currency", "select", "boolean", "text"]),
  category: z.enum([
    "experience",
    "language",
    "monthly-salary",
    "notice-period",
    "hourly-rate",
    "custom",
  ]),
  min: z.number().optional(),
  max: z.number().optional(),
  options: z.array(z.string()).optional(), // for "select"
  idealAnswer: z.union([z.string(), z.number(), z.boolean()]).optional(),
  qualifying: z.boolean().optional(),
  qualifyWhen: z
    .enum(["lt", "lte", "eq", "gte", "gt", "neq", "in", "nin"])
    .optional(),
  qualifyValue: z
    .union([z.number(), z.string(), z.array(z.string()), z.boolean()])
    .optional(),
  currency: z.enum(["NGN", "USD", "CAD", "EUR", "GBP"]).optional(),
  unit: z.string().optional(),
});

const CreateJobSchema = z.object({
  title: z.string().min(1),
  company: z.string().optional(),
  roleId: z.string().optional(),
  roleName: z.string().optional(),
  languages: z.array(z.string()).min(1),
  jdText: z.string().min(20),

  focusAreas: z.array(z.string()).optional(),
  adminFocusNotes: z.string().optional(),

  screenerQuestions: z.array(z.string()).optional(), // legacy (kept)
  screenerRules: z.array(ScreenerRuleSchema).optional(),

  location: z.string().optional(),
  locationDetails: z.string().optional(),
  employmentType: z.string().optional(),
  seniority: z.string().optional(),
  commImportance: z.number().int().min(1).max(5).optional(),
  startDate: z.string().optional(),
  skills: z.array(z.string()).optional(),

  // NEW interview types
  interviewType: z
    .enum(["standard", "resume-based", "human-data", "software"])
    .optional(),

  // 💰 compensation
  salaryCurrency: z.enum(["NGN", "USD", "CAD", "EUR", "GBP"]).optional(),
  monthlySalaryMin: z.number().optional(),
  monthlySalaryMax: z.number().optional(),
  hoursPerWeek: z.number().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user || (user.role !== "admin" && user.role !== "company")) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const parsed = CreateJobSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      title,
      company,
      roleId,
      roleName,
      languages,
      jdText,

      focusAreas = [],
      adminFocusNotes,

      screenerQuestions = [],
      screenerRules = [],

      location = "remote",
      locationDetails = "",
      employmentType = "full-time",
      seniority = "mid",
      commImportance = 3,
      startDate,
      skills = [],

      interviewType = "software",

      salaryCurrency,
      monthlySalaryMin,
      monthlySalaryMax,
      hoursPerWeek,
    } = parsed.data;

    // sanitize comp range (swap if user inverted)
    let _min = monthlySalaryMin;
    let _max = monthlySalaryMax;
    if (typeof _min === "number" && typeof _max === "number" && _min > _max) {
      [_min, _max] = [_max, _min];
    }

    // find or create role if roleName given
    let role = null as any;
    if (roleId) {
      role = await Role.findById(roleId);
    } else if (roleName) {
      role =
        (await Role.findOne({ name: roleName })) ||
        (await Role.create({ name: roleName, active: true }));
    }

    const code = generateJobCode();

    const job = await Job.create({
      title,
      company,
      roleId: role?._id,
      roleName: role?.name || roleName,
      languages,
      jdText,

      focusAreas,
      adminFocusNotes,

      screenerQuestions,
      screenerRules,

      location,
      locationDetails,
      employmentType,
      seniority,
      commImportance,
      startDate,
      skills,

      interviewType,

      salaryCurrency,
      monthlySalaryMin: _min,
      monthlySalaryMax: _max,
      hoursPerWeek,

      code,
      active: true,
    });

    return NextResponse.json(
      {
        ok: true,
        id: String(job._id),
        code,
        shareUrl: `/interviewer/start?job=${code}`,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  await dbConnect();
  const { jobId, published } = await req.json();
  if (!jobId || typeof published !== "boolean") {
    return new Response("Invalid input", { status: 400 });
  }
  const job = await Job.findByIdAndUpdate(jobId, { published }, { new: true });
  if (!job) {
    return new Response("Job not found", { status: 404 });
  }
  return Response.json({ ok: true, published: job.published });
}

export const dynamic = "force-dynamic";
