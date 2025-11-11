import { Schema, model, models, Types, Model, Document } from "mongoose";

/**
 * Zuri Interviewer – Core Models
 * --------------------------------
 * This file defines the data layer for:
 *  - Roles (e.g., Customer Support, Sales, Developer)
 *  - Question bank per role/language
 *  - Rubrics (scoring criteria) per role
 *  - Interview sessions (candidate, steps, audio answers, scores, tokenized access)
 *
 * NOTE: Do not import database connection logic here; call your connect
 * function (e.g., connectToDB) from route handlers before using these models.
 */

// --------------------
// Role
// --------------------
export interface RoleDoc extends Document {
  name: string;
  description?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<RoleDoc>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Role =
  (models.Role as Model<RoleDoc>) || model<RoleDoc>("Role", RoleSchema);

// --------------------
// Question
// --------------------
export interface QuestionDoc extends Document {
  roleId: Types.ObjectId;
  text: string;
  lang: string; // e.g., "en", "yo", "ha", "ig", "sw"
  order: number; // 1..N
  timeLimitSec?: number; // optional per question
  keywords?: string[]; // optional – used for simple heuristic scoring
  createdAt: Date;
  updatedAt: Date;
}


const QuestionSchema = new Schema<QuestionDoc>(
  {
    roleId: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
      index: true,
    },
    text: { type: String, required: true },
    lang: { type: String, required: true, trim: true },
    order: { type: Number, required: true, min: 1 },
    timeLimitSec: { type: Number, default: 120 },
    keywords: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

QuestionSchema.index({ roleId: 1, lang: 1, order: 1 }, { unique: true });

export const Question =
  (models.Question as Model<QuestionDoc>) ||
  model<QuestionDoc>("Question", QuestionSchema);

// --------------------
// Rubric
// --------------------
export interface RubricCriterion {
  key: string; // e.g., "communication"
  label: string; // e.g., "Communication"
  weight: number; // e.g., 0.4 – you can decide to normalize on the client
  description?: string;
}

export interface RubricDoc extends Document {
  roleId: Types.ObjectId;
  criteria: RubricCriterion[];
  createdAt: Date;
  updatedAt: Date;
}

const RubricSchema = new Schema<RubricDoc>(
  {
    roleId: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
      unique: true,
      index: true,
    },
    criteria: [
      new Schema<RubricCriterion>(
        {
          key: { type: String, required: true, trim: true },
          label: { type: String, required: true, trim: true },
          weight: { type: Number, required: true, min: 0 },
          description: { type: String, default: "" },
        },
        { _id: false }
      ),
    ],
  },
  { timestamps: true }
);

export const Rubric =
  (models.Rubric as Model<RubricDoc>) ||
  model<RubricDoc>("Rubric", RubricSchema);

// --------------------
// Interview Session
// --------------------
export interface CandidateInfo {
  name: string;
  email?: string;
  phone?: string;
}

export interface ResumeInfo {
  url?: string; // Cloudinary URL (raw)
  publicId?: string; // Cloudinary public_id
  textExtract?: string; // optional – if you later parse the PDF
}

export interface StepAnswer {
  qId: Types.ObjectId; // ref Question
  qText: string; // denormalized for easier export
  startedAt?: Date;
  endedAt?: Date;
  audioUrl?: string; // Cloudinary
  audioPublicId?: string;
  durationMs?: number;
  transcript?: string; // optional manual or automated later
  notes?: string; // reviewer notes
}

export type SessionStatus = "active" | "finished";

export interface InterviewSessionDoc extends Document {
  roleId: Types.ObjectId;
  language: string;
  status: SessionStatus;
  candidate: CandidateInfo;
  resume?: ResumeInfo;
  steps: StepAnswer[];
  scores?: Record<string, number>; // { [criterion.key]: number }
  notes?: string; // overall reviewer notes
  token: string; // shared-secret token – include in URL query for access
  createdAt: Date;
  updatedAt: Date;
}

const StepAnswerSchema = new Schema<StepAnswer>(
  {
    qId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
    qText: { type: String, required: true },
    startedAt: { type: Date },
    endedAt: { type: Date },
    audioUrl: { type: String },
    audioPublicId: { type: String },
    durationMs: { type: Number },
    transcript: { type: String },
    notes: { type: String },
  },
  { _id: false }
);

const CandidateInfoSchema = new Schema<CandidateInfo>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
  },
  { _id: false }
);

const ResumeInfoSchema = new Schema<ResumeInfo>(
  {
    url: { type: String },
    publicId: { type: String },
    textExtract: { type: String },
  },
  { _id: false }
);

const InterviewSessionSchema = new Schema<InterviewSessionDoc>(
  {
    roleId: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
      index: true,
    },
    language: { type: String, required: true },
    status: { type: String, enum: ["active", "finished"], default: "active" },
    candidate: { type: CandidateInfoSchema, required: true },
    resume: { type: ResumeInfoSchema, default: undefined },
    steps: { type: [StepAnswerSchema], default: [] },
    scores: { type: Map, of: Number, default: undefined },
    notes: { type: String, default: "" },
    token: { type: String, required: true },
  },
  { timestamps: true }
);

InterviewSessionSchema.index({ token: 1 }, { unique: true });

export const InterviewSession =
  (models.InterviewSession as Model<InterviewSessionDoc>) ||
  model<InterviewSessionDoc>("InterviewSession", InterviewSessionSchema);

// --------------------
// Helpers (optional)
// --------------------
export function generateSessionToken(length = 8) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // avoid confusing chars
  let token = "";
  for (let i = 0; i < length; i++)
    token += alphabet[Math.floor(Math.random() * alphabet.length)];
  return token;
}
