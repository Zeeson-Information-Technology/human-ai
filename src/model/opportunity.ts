import mongoose, { Schema, model, Document, Model, Types } from "mongoose";

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

export interface OpportunityQuestionOverride {
  lang: string;
  order: number;
  text: string;
  timeLimitSec?: number;
  keywords?: string[];
}

const OpportunityQuestionOverrideSchema =
  new Schema<OpportunityQuestionOverride>(
    {
      lang: { type: String, required: true },
      order: { type: Number, required: true, min: 1 },
      text: { type: String, required: true },
      timeLimitSec: { type: Number },
      keywords: [{ type: String }],
    },
    { _id: false }
  );

export interface OpportunityRubricCriterion {
  key: string;
  label: string;
  weight: number;
  description?: string;
}

const OpportunityRubricCriterionSchema =
  new Schema<OpportunityRubricCriterion>(
    {
      key: { type: String, required: true },
      label: { type: String, required: true },
      weight: { type: Number, required: true, min: 0 },
      description: { type: String },
    },
    { _id: false }
  );

export interface WorkbenchColumn {
  id: string;
  title: string;
  order: number;
}

const WorkbenchColumnSchema = new Schema<WorkbenchColumn>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    order: { type: Number, required: true },
  },
  { _id: false }
);

export interface OpportunityDocument {
  name: string;
  url: string;
  publicId?: string;
  bytes?: number;
  resourceType?: string;
  uploadedAt?: string;
}

const OpportunityDocumentSchema = new Schema<OpportunityDocument>(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String },
    bytes: { type: Number },
    resourceType: { type: String },
    uploadedAt: { type: String },
  },
  { _id: false }
);

export interface WorkbenchCard {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  order: number;
  creatorEmail?: string;
  creatorName?: string;
  creatorAvatarUrl?: string;
  assigneeEmail?: string;
  assigneeEmails?: string[];
  dueDate?: string;
  dueTime?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  createdAt?: string;
  links?: string[];
  documents?: OpportunityDocument[];
  subtasks?: Array<{
    id: string;
    title: string;
    done?: boolean;
  }>;
}

const WorkbenchCardSchema = new Schema<WorkbenchCard>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    columnId: { type: String, required: true },
    order: { type: Number, required: true },
    creatorEmail: { type: String },
    creatorName: { type: String },
    creatorAvatarUrl: { type: String },
    assigneeEmail: { type: String },
    assigneeEmails: [{ type: String }],
    dueDate: { type: String },
    dueTime: { type: String },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent", ""],
      default: "",
    },
    createdAt: { type: String },
    links: [{ type: String }],
    documents: { type: [OpportunityDocumentSchema], default: [] },
    subtasks: [
      new Schema(
        {
          id: { type: String, required: true },
          title: { type: String, required: true },
          done: { type: Boolean, default: false },
        },
        { _id: false }
      ),
    ],
  },
  { _id: false }
);

export interface OpportunityDoc extends Document {
  title: string;
  company?: string;
  clientId?: Types.ObjectId;
  clientName?: string;
  clientContactName?: string;
  clientContactEmail?: string;
  buyerOrganization?: string;
  solicitationNumber?: string;
  opportunitySource?: string;
  submissionDeadline?: string;
  marketFocus?: string;
  roleId?: Types.ObjectId;
  roleName?: string;
  sourceInquiryId?: Types.ObjectId;
  ownerId?: Types.ObjectId;
  ownerEmail?: string;
  assignedUserId?: Types.ObjectId;
  assignedUserEmail?: string;
  languages: string[];
  jdText: string;
  interviewType?: "standard" | "resume-based" | "human-data" | "software";
  focusAreas: string[];
  adminFocusNotes?: string;
  documents?: OpportunityDocument[];
  rubricOverride?: OpportunityRubricCriterion[];
  questionsOverride?: OpportunityQuestionOverride[];
  aiMatchGuide?: string;
  proctoringRequired?: boolean;
  workbench?: {
    columns: WorkbenchColumn[];
    cards: WorkbenchCard[];
  };
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
  salaryCurrency?: "NGN" | "USD" | "CAD" | "EUR" | "GBP";
  monthlySalaryMin?: number;
  monthlySalaryMax?: number;
  hoursPerWeek?: number;
  interviewOnApply?: boolean;
  published?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type JobDoc = OpportunityDoc;
export type JobQuestionOverride = OpportunityQuestionOverride;
export type JobRubricCriterion = OpportunityRubricCriterion;

const OpportunitySchema = new Schema<OpportunityDoc>(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", index: true },
    clientName: { type: String },
    clientContactName: { type: String },
    clientContactEmail: { type: String },
    buyerOrganization: { type: String },
    solicitationNumber: { type: String },
    opportunitySource: { type: String },
    submissionDeadline: { type: String },
    marketFocus: { type: String },
    roleId: { type: Schema.Types.ObjectId, ref: "Role" },
    roleName: { type: String },
    sourceInquiryId: { type: Schema.Types.ObjectId, index: true },
    ownerId: { type: Schema.Types.ObjectId, index: true },
    ownerEmail: { type: String },
    assignedUserId: { type: Schema.Types.ObjectId, index: true },
    assignedUserEmail: { type: String },
    languages: [{ type: String, required: true }],
    jdText: { type: String, required: true },
    focusAreas: [{ type: String }],
    adminFocusNotes: { type: String },
    documents: { type: [OpportunityDocumentSchema], default: [] },
    rubricOverride: {
      type: [OpportunityRubricCriterionSchema],
      default: undefined,
    },
    questionsOverride: {
      type: [OpportunityQuestionOverrideSchema],
      default: undefined,
    },
    aiMatchGuide: { type: String },
    proctoringRequired: { type: Boolean, default: false },
    workbench: {
      columns: { type: [WorkbenchColumnSchema], default: undefined },
      cards: { type: [WorkbenchCardSchema], default: undefined },
    },
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

OpportunitySchema.index({ ownerId: 1, createdAt: -1 });

const MODEL_NAME = "Opportunity";

try {
  if (mongoose.connection.models[MODEL_NAME]) {
    mongoose.connection.deleteModel(MODEL_NAME);
  }
  const modelsObj = mongoose.models as unknown as Record<string, unknown>;
  if (modelsObj[MODEL_NAME]) delete modelsObj[MODEL_NAME];
} catch {}

export const Opportunity: Model<OpportunityDoc> = model<OpportunityDoc>(
  MODEL_NAME,
  OpportunitySchema
);

export const Job = Opportunity;

export function generateOpportunityCode(len = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < len; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

export const generateJobCode = generateOpportunityCode;
