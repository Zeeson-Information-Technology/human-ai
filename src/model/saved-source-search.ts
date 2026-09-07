import { Schema, model, models, Types } from "mongoose";

const SavedSourceSearchSchema = new Schema(
  {
    ownerCompanyId: { type: Schema.Types.ObjectId, required: true, index: true },
    createdByUserId: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true, trim: true },
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
    portalConnectionIds: [{ type: Schema.Types.ObjectId, ref: "PortalConnection" }],
    portalKeys: [{ type: String }],
  },
  { timestamps: true }
);

export type SavedSourceSearchDoc = {
  _id: Types.ObjectId;
  ownerCompanyId: Types.ObjectId;
  createdByUserId: Types.ObjectId;
  name: string;
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
  portalConnectionIds: Types.ObjectId[];
  portalKeys: string[];
  createdAt: Date;
  updatedAt: Date;
};

export default models.SavedSourceSearch || model("SavedSourceSearch", SavedSourceSearchSchema);
