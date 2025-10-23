import crypto from "crypto";

const SECRET = process.env.INVITE_SIGN_SECRET || "dev-invite-secret";

type Payload = {
  code: string; // job code
  email: string; // invited email (lowercased)
  exp?: number; // unix seconds (optional expiry)
};

// Base64URL encode/decode helpers
function b64u(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function b64uJson(obj: any) {
  return b64u(JSON.stringify(obj));
}

function hmac(data: string) {
  return b64u(crypto.createHmac("sha256", SECRET).update(data).digest());
}

/** ✅ Generate signed invite token for a candidate email + job code */
export function signInvite(payload: Payload) {
  const now = Math.floor(Date.now() / 1000);
  const exp = payload.exp ?? now + 60 * 60 * 24 * 14; // default: 14 days
  const body = {
    code: payload.code.toUpperCase(),
    email: payload.email.toLowerCase(),
    exp,
  };
  const encoded = b64uJson(body);
  const sig = hmac(encoded);
  return `${encoded}.${sig}`;
}

/** ✅ Verify invite token and return decoded payload if valid, else null */
export function verifyInvite(ivt: string): Payload | null {
  const [encoded, sig] = String(ivt || "").split(".");
  if (!encoded || !sig) return null;
  const good = hmac(encoded);
  if (good !== sig) return null;

  try {
    const obj: Payload = JSON.parse(
      Buffer.from(
        encoded.replace(/-/g, "+").replace(/_/g, "/"),
        "base64"
      ).toString("utf8")
    );
    if (!obj?.code || !obj?.email) return null;
    if (obj.exp && obj.exp < Math.floor(Date.now() / 1000)) return null;
    return {
      code: obj.code.toUpperCase(),
      email: obj.email.toLowerCase(),
      exp: obj.exp,
    };
  } catch {
    return null;
  }
}
