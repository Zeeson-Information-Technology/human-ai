import { Schema, model, models, type Model, type Document } from "mongoose";

export interface TextAnnotationDoc extends Document {
  taskId: string;
  task: string;
  sourceText: string;
  targetText?: string;
  /** Store one or more labels chosen for this item */
  labels: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TextAnnotationSchema = new Schema<TextAnnotationDoc>(
  {
    taskId: { type: String, required: true },
    task: { type: String, required: true },
    sourceText: { type: String, required: true },
    targetText: { type: String },
    labels: { type: [String], default: [] },
  },
  { timestamps: true }
);

// No ts-ignore needed: type the model explicitly
const TextAnnotation: Model<TextAnnotationDoc> =
  (models.TextAnnotation as Model<TextAnnotationDoc>) ||
  model<TextAnnotationDoc>("TextAnnotation", TextAnnotationSchema);

export default TextAnnotation;
