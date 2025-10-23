export type Step =
  | "consent"
  | "mic"
  | "screen"
  | "camera"
  | "focus"
  | "intro"
  | "details"
  | "live";

export type Prefill = {
  name: string;
  email: string;
  phone: string;
  inviteLockedEmail: boolean;
};
