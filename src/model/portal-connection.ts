import { Schema, model, models, Types } from "mongoose";

const PortalConnectionSchema = new Schema(
  {
    ownerCompanyId: { type: Schema.Types.ObjectId, required: true, index: true },
    createdByUserId: { type: Schema.Types.ObjectId, required: true },
    portalKey: { type: String, required: true, trim: true },
    portalName: { type: String, required: true, trim: true },
    loginUrl: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true },
    secretEncrypted: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "ready", "disabled", "error"],
      default: "ready",
      index: true,
    },
    lastCheckedAt: { type: Date },
    notes: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

PortalConnectionSchema.index({ ownerCompanyId: 1, portalKey: 1 }, { unique: true });

export type PortalConnectionDoc = {
  _id: Types.ObjectId;
  ownerCompanyId: Types.ObjectId;
  createdByUserId: Types.ObjectId;
  portalKey: string;
  portalName: string;
  loginUrl: string;
  username: string;
  secretEncrypted: string;
  status: "pending" | "ready" | "disabled" | "error";
  lastCheckedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

export default models.PortalConnection || model("PortalConnection", PortalConnectionSchema);
