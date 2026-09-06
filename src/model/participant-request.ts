import { Schema, Types, model, models, Document } from "mongoose";

export type ParticipantType = "candidate" | "sme" | "reviewer" | "partner";
export type IntakeMethod = "ai-interview" | "human-interview" | "documents-only" | "manual-review";

export interface ParticipantRequestDoc extends Document {
  opportunityId: Types.ObjectId;
  jobCode: string;
  ownerCompanyId?: Types.ObjectId;
  createdByUserId?: Types.ObjectId;
  email: string;
  name?: string;
  participantType: ParticipantType;
  intakeMethod: IntakeMethod;
  status: "pending" | "submitted" | "scheduled" | "declined" | "cancelled";
  sessionId?: Types.ObjectId;
  proposedSlots: Array<{ startAt: Date; endAt?: Date; timezone?: string }>;
  selectedSlot?: { startAt: Date; endAt?: Date; timezone?: string };
  createdAt?: Date;
  updatedAt?: Date;
}

const SlotSchema = new Schema({
  startAt: { type: Date, required: true },
  endAt: { type: Date },
  timezone: { type: String, trim: true },
}, { _id: false });

const ParticipantRequestSchema = new Schema<ParticipantRequestDoc>({
  opportunityId: { type: Schema.Types.ObjectId, ref: "Opportunity", required: true, index: true },
  jobCode: { type: String, required: true, uppercase: true, trim: true, index: true },
  ownerCompanyId: { type: Schema.Types.ObjectId, ref: "User", index: true },
  createdByUserId: { type: Schema.Types.ObjectId, ref: "User" },
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  name: { type: String, trim: true },
  participantType: { type: String, enum: ["candidate", "sme", "reviewer", "partner"], required: true },
  intakeMethod: { type: String, enum: ["ai-interview", "human-interview", "documents-only", "manual-review"], required: true },
  status: { type: String, enum: ["pending", "submitted", "scheduled", "declined", "cancelled"], default: "pending", index: true },
  sessionId: { type: Schema.Types.ObjectId, ref: "Session" },
  proposedSlots: { type: [SlotSchema], default: [] },
  selectedSlot: { type: SlotSchema },
}, { timestamps: true });

ParticipantRequestSchema.index({ opportunityId: 1, email: 1, status: 1 });

export default models.ParticipantRequest || model<ParticipantRequestDoc>("ParticipantRequest", ParticipantRequestSchema);
