import { Schema, model, models } from "mongoose";

const InquirySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    company: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    source: { type: String, default: "landing_form" },
    handled: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["new", "in_review", "replied", "closed"],
      default: "new",
      index: true,
    },
    notes: { type: String, default: "", trim: true },
    lastContactAt: { type: Date },
    assignedUserId: { type: Schema.Types.ObjectId, index: true },
    assignedUserEmail: { type: String, trim: true, lowercase: true },
    assignedAt: { type: Date },
    workspaceCode: { type: String, trim: true, index: true },
    workspaceTitle: { type: String, trim: true },
    convertedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

InquirySchema.index({ createdAt: -1 });
InquirySchema.index({ status: 1, createdAt: -1 });

// Keep the existing Mongo model name stable to avoid migration work.
const Inquiry = models.PilotRequest || model("PilotRequest", InquirySchema);
export default Inquiry;
