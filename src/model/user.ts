// src/model/user.ts
import { Schema, model, models, Document, Model } from "mongoose";

export type UserRole =
  | "admin"
  | "company"
  | "staff"
  | "recruiter"
  | "manager";

export interface UserDoc extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;

  // Basic
  name?: string;
  company?: string;
  avatarUrl?: string;

  // Contact / profile
  linkedin?: string;
  phone?: string; // E.164 preferred (e.g., +2348012345678)
  phoneCountryCode?: string; // e.g., +234
  whatsapp?: string;
  whatsappCountryCode?: string; // e.g., +234

  // Verification
  isVerified?: boolean;
  verifyCode?: string;
  verifyCodeExpires?: Date;

  // Resume
  resume?: {
    url: string;
    fileName?: string;
    publicId?: string;
    uploadedAt?: Date;
  };

  avatar?: {
    url: string;
    publicId?: string;
    uploadedAt?: Date;
  };

  // Communication prefs
  openToWork?: boolean;
  minMonthly?: number;
  minHourly?: number;
  interests?: string[];
  allowEmail?: boolean;
  allowPhone?: boolean;
  allowWhatsApp?: boolean;

  // Availability
  timezone?: string;
  hoursPerWeek?: number;
  daysAvailable?: string[]; // ["Mon","Tue",...]
  startHour?: number; // 0–23
  endHour?: number; // 0–23

  // Company profile
  website?: string;
  address?: string;
  title?: string;

  // Sub-users (for company): recruiters, managers, etc.
  parentCompanyId?: string; // If this user is a sub-user, reference to main company user

  // Security
  twoFactorEnabled?: boolean;
  sessions?: Array<{ sessionId: string; createdAt: Date }>;

  createdAt?: Date;
  updatedAt?: Date;

  // Password management
  mustChangePassword?: boolean;
  accessRevokedAt?: Date | null;
  accessRevokedBy?: string | null;
  permissions?: {
    canCreateOpportunity?: boolean;
    canManageInquiries?: boolean;
  };
}

const UserSchema = new Schema<UserDoc>(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "company", "staff", "recruiter", "manager"],
      required: true,
    },

    name: { type: String },
    company: { type: String },
    avatarUrl: { type: String },

    linkedin: { type: String },
    phone: { type: String },
    phoneCountryCode: { type: String },
    whatsapp: { type: String },
    whatsappCountryCode: { type: String },

    isVerified: { type: Boolean, default: false },
    verifyCode: { type: String },
    verifyCodeExpires: { type: Date },

    resume: {
      url: { type: String },
      fileName: { type: String },
      publicId: { type: String },
      uploadedAt: { type: Date },
    },

    avatar: {
      url: { type: String },
      publicId: { type: String },
      uploadedAt: { type: Date },
    },

    openToWork: { type: Boolean },
    minMonthly: { type: Number },
    minHourly: { type: Number },
    interests: [{ type: String }],
    allowEmail: { type: Boolean },
    allowPhone: { type: Boolean },
    allowWhatsApp: { type: Boolean },

    website: { type: String },
    address: { type: String },
    title: { type: String },
    parentCompanyId: { type: Schema.Types.ObjectId, ref: "User" },

    twoFactorEnabled: { type: Boolean, default: false },
    sessions: [
      {
        sessionId: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    mustChangePassword: { type: Boolean, default: false },
    accessRevokedAt: { type: Date, default: null },
    accessRevokedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    permissions: {
      canCreateOpportunity: { type: Boolean, default: false },
      canManageInquiries: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

const existingUserModel = models.User as Model<UserDoc> | undefined;

if (
  existingUserModel &&
  !existingUserModel.schema.path("permissions.canCreateOpportunity")
) {
  delete models.User;
}

export default (models.User as Model<UserDoc> | undefined) ||
  model<UserDoc>("User", UserSchema);

/**
 * Returns the UI class for a user role.
 * - "company", "admin", "staff", "recruiter", "manager" => "company"
 * - "talent" => "talent"
 */
export function getUserUiClass(role: string): "company" | "talent" {
  if (["admin", "company", "staff", "recruiter", "manager"].includes(role))
    return "company";
  return "talent";
}
