// src/types/user.ts
export type UserRole = "admin" | "company" | "recruiter" | "manager";

export type AvatarInfo = {
  url?: string;
  publicId?: string;
  uploadedAt?: string | Date;
};

export type ResumeInfo = {
  url?: string;
  fileName?: string;
  uploadedAt?: string | Date;
};

export interface AppUser {
  id: string;
  email: string;
  role: UserRole;

  // profile basics
  name?: string;
  company?: string;
  title?: string;
  website?: string;
  address?: string;
  avatar?: AvatarInfo;

  // contact
  linkedin?: string;
  phone?: string;
  whatsapp?: string;

  // resume
  resume?: ResumeInfo | null;

  // preferences
  openToWork?: boolean;
  minMonthly?: number | null;
  minHourly?: number | null;
  interests?: string[];

  allowEmail?: boolean;
  allowPhone?: boolean;
  allowWhatsApp?: boolean;

  // availability
  timezone?: string;
  hoursPerWeek?: number | null;
  daysAvailable?: string[];
  startHour?: string | null; // "09:00"
  endHour?: string | null; // "17:00"

  parentCompanyId?: string;
  twoFactorEnabled?: boolean;
  sessions?: Array<{ sessionId: string; createdAt: string | Date }>;

  isVerified?: boolean;
}
