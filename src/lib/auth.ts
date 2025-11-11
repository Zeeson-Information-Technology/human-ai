// src/lib/auth.ts
import jwt, { JwtPayload, type Secret, type SignOptions } from "jsonwebtoken";

const JWT_SECRET: Secret = (process.env.JWT_SECRET as string) || "changeme";

export function signToken(
  payload: string | Buffer | object,
  opts?: {
    expiresIn?: string | number;
  }
) {
  const options: SignOptions = {};
  if (typeof opts?.expiresIn !== "undefined") {
    // jsonwebtoken@9 types use a branded StringValue; coerce safely
    options.expiresIn = opts.expiresIn as any;
  }
  return jwt.sign(payload as any, JWT_SECRET, options);
}

export interface TokenPayload extends JwtPayload {
  userId: string;
  email?: string;
  role?: string;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as Secret);
    if (!decoded || typeof decoded === "string") {
      return null; // reject string payloads
    }
    return decoded as TokenPayload;
  } catch {
    return null;
  }
}
