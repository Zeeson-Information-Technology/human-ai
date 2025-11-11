// ================================
// FILE: src/model/job.ts
// ================================
import mongoose, { Schema, model, Document, Model, Types } from "mongoose";

/* -------------------------------------------------------------------------- */
/*                               Type Definitions                             */
/* -------------------------------------------------------------------------- */

// Allowed screener kinds and categories
export type ScreenerKind =
  | "number"
  | "currency"
  | "select"
  | "boolean"
  | "text";
export type ScreenerCategory =
  | "experience"
  | "language"
  | "monthly-salary"
  | "notice-period"
  | "hourly-rate"
  | "custom";

/* -------------------------------------------------------------------------- */
/*                             Screener Rule Schema                           */
/* -------------------------------------------------------------------------- */
export interface ScreenerRule {
  question: string;
  kind: ScreenerKind;
  category: ScreenerCategory;
  min?: number;
  max?: number;
  options?: string[];
  idealAnswer?: string | number | boolean;
  qualifying?: boolean;
  qualifyWhen?: "lt" | "lte" | "eq" | "gte" | "gt" | "neq" | "in" | "nin";
  qualifyValue?: number | string | string[] | boolean;
  currency?: "NGN" | "USD" | "CAD" | "EUR" | "GBP";
  unit?: string;
}

const ScreenerRuleSchema = new Schema<ScreenerRule>(
  {
    question: { type: String, required: true },
    kind: {
      type: String,
      enum: ["number", "currency", "select", "boolean", "text"],
      required: true,
    },
    category: {
      type: String,
      enum: [
        "experience",
        "language",
        "monthly-salary",
        "notice-period",
        "hourly-rate",
        "custom",
      ],
      required: true,
    },
    min: { type: Number },
    max: { type: Number },
    options: [{ type: String }],
    idealAnswer: { type: Schema.Types.Mixed },
    qualifying: { type: Boolean, default: false },
    qualifyWhen: {
      type: String,
      enum: ["lt", "lte", "eq", "gte", "gt", "neq", "in", "nin"],
    },
    qualifyValue: { type: Schema.Types.Mixed },
    currency: { type: String, enum: ["NGN", "USD", "CAD", "EUR", "GBP"] },
    unit: { type: String },
  },
  { _id: false }
);

/* -------------------------------------------------------------------------- */
/*                           Question / Rubric Schemas                        */
/* -------------------------------------------------------------------------- */
export interface JobQuestionOverride {
  lang: string;
  order: number;
  text: string;
  timeLimitSec?: number;
  keywords?: string[];
}

const JobQuestionOverrideSchema = new Schema<JobQuestionOverride>(
  {
    lang: { type: String, required: true },
    order: { type: Number, required: true, min: 1 },
    text: { type: String, required: true },
    timeLimitSec: { type: Number },
    keywords: [{ type: String }],
  },
  { _id: false }
);

export interface JobRubricCriterion {
  key: string;
  label: string;
  weight: number;
  description?: string;
}

const JobRubricCriterionSchema = new Schema<JobRubricCriterion>(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    weight: { type: Number, required: true, min: 0 },
    description: { type: String },
  },
  { _id: false }
);

/* -------------------------------------------------------------------------- */
/*                                 Job Schema                                 */
/* -------------------------------------------------------------------------- */
export interface JobDoc extends Document {
  title: string;
  company?: string;
  roleId?: Types.ObjectId;
  roleName?: string;
  ownerId?: Types.ObjectId; // company/admin user who created the job
  ownerEmail?: string;
  languages: string[];
  jdText: string;

  interviewType?: "standard" | "resume-based" | "human-data" | "software";

  focusAreas: string[];
  adminFocusNotes?: string;
  rubricOverride?: JobRubricCriterion[];
  questionsOverride?: JobQuestionOverride[];
  // Optional: custom guide for AI match scoring
  aiMatchGuide?: string;
  // Optional: enforce proctoring (camera+screen share) for this job
  proctoringRequired?: boolean;

  code: string;
  active: boolean;

  screenerQuestions?: string[];
  screenerRules?: ScreenerRule[];

  location?: string;
  locationDetails?: string;
  employmentType?: string;
  seniority?: string;
  commImportance?: number;
  startDate?: string;
  skills?: string[];

  // 💰 compensation
  salaryCurrency?: "NGN" | "USD" | "CAD" | "EUR" | "GBP";
  monthlySalaryMin?: number;
  monthlySalaryMax?: number;
  hoursPerWeek?: number;
  interviewOnApply?: boolean;

  published?: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<JobDoc>(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String },
    roleId: { type: Schema.Types.ObjectId, ref: "Role" },
    roleName: { type: String },
    ownerId: { type: Schema.Types.ObjectId, index: true },
    ownerEmail: { type: String },
    languages: [{ type: String, required: true }],
    jdText: { type: String, required: true },

    focusAreas: [{ type: String }],
    adminFocusNotes: { type: String },
    rubricOverride: { type: [JobRubricCriterionSchema], default: undefined },
    questionsOverride: {
      type: [JobQuestionOverrideSchema],
      default: undefined,
    },
    aiMatchGuide: { type: String },
    proctoringRequired: { type: Boolean, default: false },

    code: { type: String, required: true, unique: true },
    active: { type: Boolean, default: true },

    screenerQuestions: { type: [String], default: [] },
    screenerRules: { type: [ScreenerRuleSchema], default: [] },

    location: { type: String, default: "remote" },
    locationDetails: { type: String, default: "" },
    employmentType: { type: String, default: "full-time" },
    seniority: { type: String, default: "mid" },
    commImportance: { type: Number, default: 3 },
    startDate: { type: String },
    skills: { type: [String], default: [] },

    interviewType: {
      type: String,
      enum: ["standard", "resume-based", "human-data", "software"],
      default: "software",
    },

    // 💰 compensation
    salaryCurrency: {
      type: String,
      enum: ["NGN", "USD", "CAD", "EUR", "GBP"],
      default: undefined,
    },
    monthlySalaryMin: { type: Number, default: undefined },
    monthlySalaryMax: { type: Number, default: undefined },
    hoursPerWeek: { type: Number, default: undefined },

    interviewOnApply: { type: Boolean, default: true },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// keep one unique index for code
JobSchema.index({ code: 1 }, { unique: true });
JobSchema.index({ ownerId: 1, createdAt: -1 });

/* -------------------------------------------------------------------------- */
/*                             HMR-Safe Model Export                          */
/* -------------------------------------------------------------------------- */
const MODEL_NAME = "Job";

// Delete cached model if it exists (for hot reload in Next.js dev)
try {
  if (mongoose.connection.models[MODEL_NAME]) {
    mongoose.connection.deleteModel(MODEL_NAME);
  }
  // fallback for some mongoose versions
  const modelsObj = mongoose.models as unknown as Record<string, unknown>;
  if (modelsObj[MODEL_NAME]) delete modelsObj[MODEL_NAME];
} catch {
  /* noop */
}

export const Job: Model<JobDoc> = model<JobDoc>(MODEL_NAME, JobSchema);

/* -------------------------------------------------------------------------- */
/*                                 Utilities                                  */
/* -------------------------------------------------------------------------- */
export function generateJobCode(len = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < len; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}
