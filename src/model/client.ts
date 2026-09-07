import { Schema, model, models, Types } from "mongoose";

const ClientSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    primaryContactName: { type: String, trim: true },
    primaryContactEmail: { type: String, trim: true, lowercase: true },
    notes: { type: String, trim: true, default: "" },
    ownerCompanyId: { type: Schema.Types.ObjectId, required: true, index: true },
    createdByUserId: { type: Schema.Types.ObjectId, index: true },
  },
  { timestamps: true }
);

ClientSchema.index(
  { ownerCompanyId: 1, name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

export type ClientDoc = {
  _id: Types.ObjectId;
  name: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  notes?: string;
  ownerCompanyId: Types.ObjectId;
  createdByUserId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export default models.Client || model("Client", ClientSchema);
