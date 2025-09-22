// src/app/api/cloudinary/sign/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

export async function POST(req: Request) {
  try {
    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
      return NextResponse.json(
        { ok: false, error: "Cloudinary env missing" },
        { status: 500 }
      );
    }

    // Optional: allow client to request a folder / public_id
    const { folder = "equatoria-demo", publicId } = await req
      .json()
      .catch(() => ({}));

    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign: Record<string, string | number> = { timestamp, folder };
    if (publicId) paramsToSign.public_id = publicId;

    // Build signature string: keys sorted alphabetically + api_secret
    const toSign = Object.keys(paramsToSign)
      .sort()
      .map((k) => `${k}=${paramsToSign[k]}`)
      .join("&");

    const signature = crypto
      .createHash("sha1")
      .update(`${toSign}${API_SECRET}`)
      .digest("hex");

    return NextResponse.json({
      ok: true,
      cloudName: CLOUD_NAME,
      apiKey: API_KEY,
      timestamp,
      folder,
      publicId: publicId || null,
      signature,
    });
  } catch (e) {
    console.error("Cloudinary sign error:", e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
