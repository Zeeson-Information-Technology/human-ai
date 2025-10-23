import { Schema, model, models, Document } from "mongoose";

export interface CompanyDoc extends Document {
  name: string; // required
  website?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const CompanySchema = new Schema<CompanyDoc>(
  {
    name: { type: String, required: true, index: true },
    website: { type: String },
    address: { type: String },
  },
  { timestamps: true }
);

// helpful unique-ish index if you want to avoid dupes by name+website
CompanySchema.index({ name: 1, website: 1 }, { unique: false });

export default models.Company || model<CompanyDoc>("Company", CompanySchema);
