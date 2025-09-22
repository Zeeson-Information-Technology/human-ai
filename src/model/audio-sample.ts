import mongoose, { Schema, InferSchemaType, models, model } from "mongoose";

const AudioSampleSchema = new Schema(
  {
    phraseId: { type: String, required: true, index: true },
    phraseEn: { type: String, required: true },

    language: { type: String, required: true }, // e.g., Yoruba, Hausa, Igbo, Pidgin, Ibibio
    accent: { type: String }, // optional free text or dropdown

    translationText: { type: String, required: true }, // user's written translation
    audioUrl: { type: String, required: true },
    audioPublicId: { type: String, required: true },

    durationMs: { type: Number },
    deviceInfo: { type: String }, // user-agent snippet
    userId: { type: String }, // optional (wire to auth later)
    consent: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type AudioSampleDoc = InferSchemaType<typeof AudioSampleSchema>;

export default (models.AudioSample as mongoose.Model<AudioSampleDoc>) ||
  model<AudioSampleDoc>("AudioSample", AudioSampleSchema);
