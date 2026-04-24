// ================================
// FILE: src/app/api/zuri/jobs/route.ts  (POST create job)
// ================================
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import { Role } from "@/model/interview";
import { Opportunity, generateOpportunityCode } from "@/model/opportunity";
import Client from "@/model/client";
import Inquiry from "@/model/inquiry";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth-utils";
import { companyRootIdOf, getEffectivePermissions } from "@/lib/admin-auth";
import { Types } from "mongoose";

type InquiryAssignment = {
  assignedUserId?: Types.ObjectId | string | null;
  assignedUserEmail?: string | null;
};

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
  clientId: z.string().optional(),
  clientName: z.string().min(1).optional(),
  clientContactName: z.string().optional(),
  clientContactEmail: z.string().email().optional().or(z.literal("")).optional(),
  buyerOrganization: z.string().optional(),
  solicitationNumber: z.string().optional(),
  opportunitySource: z.string().optional(),
  submissionDeadline: z.string().optional(),
  marketFocus: z.string().optional(),
  roleId: z.string().optional(),
  roleName: z.string().optional(),
  inquiryId: z.string().optional(),
  languages: z.array(z.string()).min(1),
  jdText: z.string().min(20),
  documents: z
    .array(
      z.object({
        name: z.string().min(1),
        url: z.string().url(),
        publicId: z.string().optional(),
        bytes: z.number().optional(),
        resourceType: z.string().optional(),
        uploadedAt: z.string().optional(),
      })
    )
    .optional(),

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
  const permissions = getEffectivePermissions(user);
  if (
    !user ||
    !(
      user.role === "admin" ||
      user.role === "company" ||
      permissions.canCreateOpportunity
    )
  ) {
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
      clientId,
      clientName,
      clientContactName,
      clientContactEmail,
      buyerOrganization,
      solicitationNumber,
      opportunitySource,
      submissionDeadline,
      marketFocus,
      roleId,
      roleName,
      inquiryId,
      languages,
      jdText,
      documents = [],

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

    const code = generateOpportunityCode();
    const rootId = companyRootIdOf(user);

    let resolvedClient: any = null;
    if (clientId) {
      resolvedClient = await Client.findOne({
        _id: new Types.ObjectId(clientId),
        ownerCompanyId: new Types.ObjectId(rootId),
      });
    } else if (clientName && rootId) {
      resolvedClient =
        (await Client.findOne({
          ownerCompanyId: new Types.ObjectId(rootId),
          name: clientName,
        }).collation({ locale: "en", strength: 2 })) ||
        (await Client.create({
          name: clientName,
          primaryContactName: clientContactName || "",
          primaryContactEmail: clientContactEmail || "",
          ownerCompanyId: new Types.ObjectId(rootId),
          createdByUserId: new Types.ObjectId(user.id),
        }));
    }

    const resolvedClientName =
      resolvedClient?.name || clientName || company || "";
    const resolvedClientContactName =
      clientContactName || resolvedClient?.primaryContactName || "";
    const resolvedClientContactEmail =
      clientContactEmail || resolvedClient?.primaryContactEmail || "";

    const opportunity = await Opportunity.create({
      title,
      company: resolvedClientName || company,
      clientId: resolvedClient?._id,
      clientName: resolvedClientName,
      clientContactName: resolvedClientContactName,
      clientContactEmail: resolvedClientContactEmail,
      buyerOrganization: buyerOrganization || "",
      solicitationNumber: solicitationNumber || "",
      opportunitySource: opportunitySource || "",
      submissionDeadline: submissionDeadline || "",
      marketFocus: marketFocus || "",
      roleId: role?._id,
      roleName: role?.name || roleName,
      sourceInquiryId: inquiryId || undefined,
      ownerId: new Types.ObjectId(user.id),
      ownerEmail: user.email || undefined,
      assignedUserId: new Types.ObjectId(user.id),
      assignedUserEmail: user.email || undefined,
      languages,
      jdText,
      documents,

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

    if (inquiryId) {
      const sourceInquiry = (await Inquiry.findById(inquiryId)
        .lean()
        .catch(() => null)) as InquiryAssignment | null;
      if (sourceInquiry?.assignedUserId || sourceInquiry?.assignedUserEmail) {
        await Opportunity.findByIdAndUpdate(opportunity._id, {
          $set: {
            assignedUserId:
              sourceInquiry.assignedUserId || new Types.ObjectId(user.id),
            assignedUserEmail:
              sourceInquiry.assignedUserEmail || user.email || undefined,
          },
        }).catch(() => null);
      }

      await Inquiry.findByIdAndUpdate(inquiryId, {
        $set: {
          workspaceCode: code,
          workspaceTitle: title,
          convertedAt: new Date(),
          status: "in_review",
        },
      }).catch(() => null);
    }

    return NextResponse.json(
      {
        ok: true,
        id: String(opportunity._id),
        code,
        shareUrl: `/zuri/start?job=${code}`,
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
  const opportunity = await Opportunity.findByIdAndUpdate(
    jobId,
    { published },
    { new: true }
  );
  if (!opportunity) {
    return new Response("Opportunity not found", { status: 404 });
  }
  return Response.json({ ok: true, published: opportunity.published });
}

export const dynamic = "force-dynamic";

