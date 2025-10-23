import { Schema, model, models, Document, Types } from "mongoose";

export type OrgRole = "admin" | "company" | "manager" | "recruiter";

export interface MembershipDoc extends Document {
  userId: Types.ObjectId;
  companyId: Types.ObjectId;
  role: OrgRole; // role **within that company**
  createdAt?: Date;
  updatedAt?: Date;
}

const MembershipSchema = new Schema<MembershipDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["admin", "company", "manager", "recruiter"],
      required: true,
    },
  },
  { timestamps: true }
);

// Enforce one membership per user per company
MembershipSchema.index({ userId: 1, companyId: 1 }, { unique: true });

export default models.Membership ||
  model<MembershipDoc>("Membership", MembershipSchema);
