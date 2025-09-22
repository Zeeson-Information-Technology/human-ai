import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

/** Single bounding box */
const BBoxSchema = new Schema(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  { _id: false }
);

/**
 * NOTE: Your DB sample shows one label per document.
 * Keep `label: string` to match existing data and the API that
 * expands multi-label selections into multiple docs.
 */
const ImageAnnotationSchema = new Schema(
  {
    sampleId: { type: String, required: true },
    image: { type: String, required: true },
    label: { type: String, required: true },
    bbox: { type: BBoxSchema, required: true },
  },
  { timestamps: true }
);

// Base shape (doesn't include timestamps in the type by default)
type ImageAnnotationBase = InferSchemaType<typeof ImageAnnotationSchema>;

// If you want timestamps in the TS type:
export type ImageAnnotation = ImageAnnotationBase & {
  createdAt: Date;
  updatedAt: Date;
};

const ImageAnnotationModel: Model<ImageAnnotation> =
  (models.ImageAnnotation as Model<ImageAnnotation>) ||
  model<ImageAnnotation>("ImageAnnotation", ImageAnnotationSchema);

export default ImageAnnotationModel;
