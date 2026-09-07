import { Schema, model, models, Types } from "mongoose";

const SourceRunSchema = new Schema(
  {
    ownerCompanyId: { type: Schema.Types.ObjectId, required: true, index: true },
    createdByUserId: { type: Schema.Types.ObjectId, required: true },
    opportunityId: { type: Schema.Types.ObjectId, ref: "Opportunity", index: true },
    portalConnectionIds: [{ type: Schema.Types.ObjectId, ref: "PortalConnection" }],
    portalKeys: [{ type: String }],
    query: { type: String, default: "", trim: true },
    keywords: [{ type: String }],
    industryCodes: [{ type: String }],
    categories: [{ type: String }],
    bidTypes: [{ type: String }],
    procurementStages: [{ type: String }],
    valueRanges: [{ type: String }],
    commercialTools: [{ type: String }],
    naicsCodes: [{ type: String }],
    sectors: [{ type: String }],
    statuses: [{ type: String }],
    noticeTypes: [{ type: String }],
    setAsides: [{ type: String }],
    geography: [{ type: String }],
    publishedFrom: { type: String },
    publishedTo: { type: String },
    closingFrom: { type: String },
    closingTo: { type: String },
    publishedWindow: { type: String },
    closingWindow: { type: String },
    buyerKeywords: [{ type: String }],
    deadlineFrom: { type: String },
    deadlineTo: { type: String },
    status: {
      type: String,
      enum: ["queued", "running", "needs_review", "completed", "failed"],
      default: "queued",
      index: true,
    },
    decision: {
      type: String,
      enum: ["pending", "go", "no_go", "needs_human_review"],
      default: "pending",
    },
    decisionReason: { type: String, default: "" },
    resultCount: { type: Number, default: 0 },
    results: { type: [Schema.Types.Mixed], default: [] },
    portalResponses: { type: [Schema.Types.Mixed], default: [] },
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export type SourceRunDoc = {
  _id: Types.ObjectId;
  ownerCompanyId: Types.ObjectId;
  createdByUserId: Types.ObjectId;
  opportunityId?: Types.ObjectId;
  portalConnectionIds: Types.ObjectId[];
  portalKeys: string[];
  query: string;
  keywords: string[];
  industryCodes: string[];
  categories: string[];
  bidTypes: string[];
  procurementStages: string[];
  valueRanges: string[];
  commercialTools: string[];
  naicsCodes: string[];
  sectors: string[];
  statuses: string[];
  noticeTypes: string[];
  setAsides: string[];
  geography: string[];
  publishedFrom?: string;
  publishedTo?: string;
  closingFrom?: string;
  closingTo?: string;
  publishedWindow?: string;
  closingWindow?: string;
  buyerKeywords: string[];
  deadlineFrom?: string;
  deadlineTo?: string;
  status: "queued" | "running" | "needs_review" | "completed" | "failed";
  decision: "pending" | "go" | "no_go" | "needs_human_review";
  decisionReason?: string;
  resultCount: number;
  results: unknown[];
  portalResponses: Array<{ portal: string; status: "completed" | "failed"; resultCount: number; error?: string }>;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export default models.SourceRun || model("SourceRun", SourceRunSchema);
