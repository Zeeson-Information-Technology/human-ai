// ================================
// FILE: src/model/session.ts
// Canonical Zuri Session model
// ================================
import mongoose, {
  Schema,
  InferSchemaType,
  models,
  model,
  Types,
} from "mongoose";
import { randomBytes } from "node:crypto";

// Helper: short, uppercase token (e.g., BW6HYBEL)
function makeToken(len = 8) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // avoid 0/O/1/I
  const buf = randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[buf[i] % alphabet.length];
  return out;
}

const ResumeSchema = new Schema(
  {
    url: { type: String },
    publicId: { type: String },
  },
  { _id: false }
);

// src/model/session.ts  (only the CandidateSchema block shown)
const CandidateSchema = new Schema(
  {
    name: { type: String, required: true, index: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, trim: true },
    linkedin: { type: String, trim: true }, // ← add this
    resume: { type: ResumeSchema },
  },
  { _id: false }
);

const StepSchema = new Schema(
  {
    qId: { type: Schema.Types.ObjectId, required: true, index: true },
    qText: { type: String, required: true, trim: true },
    followupHint: { type: String },

    // Who added this question
    source: {
      type: String,
      enum: ["admin", "ai"],
      default: "admin",
      index: true,
    },

    // Answer / recording
    answerText: { type: String }, // transcript (optional)
    audioUrl: { type: String },
    audioPublicId: { type: String },
    durationMs: { type: Number },
    startedAt: { type: Date },
    endedAt: { type: Date },
  },
  { _id: false }
);

const CompetencySchema = new Schema(
  {
    name: { type: String, required: true },
    score: { type: Number, min: 0, max: 5, required: true },
    evidence: { type: String },
    risks: { type: String },
  },
  { _id: false }
);

const ScorecardSchema = new Schema(
  {
    overallScore: { type: Number, min: 0, max: 100, required: true },
    verdict: { type: String, required: true }, // e.g., "hire" | "no-hire" | "strong-hire"
    summary: { type: String, required: true },
    competencies: { type: [CompetencySchema], default: [] },
    nextSteps: { type: String },
  },
  { _id: false }
);

const SessionSchema = new Schema(
  {
    // Identity & security
    token: {
      type: String,
      required: true,
      unique: true, // ensure no collisions
      index: true,
      default: () => makeToken(8),
    },
    status: {
      type: String,
      enum: ["pending", "running", "finished", "cancelled"],
      default: "pending",
      index: true,
    },

    // Job linkage + snapshots for immutability
    jobCode: { type: String, uppercase: true, trim: true, index: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job" },
    jobTitle: { type: String }, // e.g., "Procurement Expert"
    company: { type: String },
    roleName: { type: String }, // e.g., "Customer Support"
    language: { type: String, default: "en", index: true }, // "en" | "yo" | "ha" | "ig" | "pcm"
    languagesAllowed: { type: [String], default: [] },

    jdTextSnapshot: { type: String },
    focusAreasSnapshot: { type: [String], default: [] },
    adminFocusNotesSnapshot: { type: String },

    // Candidate & invite guard
    candidate: { type: CandidateSchema, required: true },
    inviteEmail: { type: String, lowercase: true, trim: true }, // enforce match if set

    // Steps (questions + answers, fully denormalized)
    steps: { type: [StepSchema], default: [] },

    // Outcome
    scorecard: { type: ScorecardSchema },

    // Pipeline (admin lifecycle)
    pipelineStage: {
      type: String,
      enum: [
        "applied",
        "interviewing",
        "offer",
        "contract",
        "hired",
        "rejected",
      ],
      default: "applied",
      index: true,
    },
    offerNote: { type: String },
    contractNote: { type: String },

    // Timestamps
    startedAt: { type: Date },
    finishedAt: { type: Date },

    // Anti-cheat events (lightweight)
    antiCheatEvents: {
      type: [
        new Schema(
          {
            ts: { type: Date, default: Date.now },
            type: { type: String, trim: true }, // e.g., visibilitychange, blur, idle, paste, devtools, screenshare:start/stop
            detail: { type: String, trim: true }, // optional JSON/string details
          },
          { _id: false }
        ),
      ],
      default: [],
    },
  },
  { timestamps: true }
);

// Useful compound indexes
SessionSchema.index({ jobCode: 1, "candidate.email": 1 });
SessionSchema.index({ status: 1, updatedAt: -1 });

// Safety: ensure token exists
SessionSchema.pre("validate", function (next) {
  if (!this.token) this.token = makeToken(8);
  next();
});

export type SessionDoc = InferSchemaType<typeof SessionSchema>;

export default (models.Session as mongoose.Model<SessionDoc>) ||
  model<SessionDoc>("Session", SessionSchema);
