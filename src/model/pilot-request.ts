// src/model/pilot-request.ts
import { Schema, models, model } from "mongoose";

const PilotRequestSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    company: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    source: { type: String, default: "landing_form" },
    handled: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

// helpful index for sorting
PilotRequestSchema.index({ createdAt: -1 });

const PilotRequest =
  models.PilotRequest || model("PilotRequest", PilotRequestSchema);
export default PilotRequest;
