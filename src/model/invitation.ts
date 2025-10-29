import { Schema, model, models, Document, Types } from "mongoose";

export type InviteRole = "admin" | "manager" | "recruiter";

export interface InvitationDoc extends Document {
  companyId: Types.ObjectId;
  email: string;
  role: InviteRole;
  token: string; // random single-use token
  expiresAt: Date; // e.g. now + 7 days
  invitedBy: Types.ObjectId; // userId
  acceptedAt?: Date | null;

  createdAt?: Date;
  updatedAt?: Date;
}

const InvitationSchema = new Schema<InvitationDoc>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["admin", "manager", "recruiter"],
      required: true,
    },
    token: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    acceptedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Prevent duplicate pending invite for same company/email (optional)
InvitationSchema.index(
  { companyId: 1, email: 1, acceptedAt: 1 },
  { unique: false }
);

export default models.Invitation ||
  model<InvitationDoc>("Invitation", InvitationSchema);
