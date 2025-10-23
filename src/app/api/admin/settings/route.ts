// src/app/api/admin/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import User from "@/model/user";
import { parsePhone } from "@/lib/phone";
import { isAdmin } from "@/lib/admin-auth";
import { getSessionUser } from "@/lib/auth-utils";

type SettingsUser = {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  phoneCountryCode?: string;
  title?: string;
  avatar?: { url?: string } | null;
  company?: string;
  website?: string;
  address?: string;
  timezone?: string;
  language?: string;
  notifications?: boolean;
  darkMode?: boolean;
};

export async function GET(req: NextRequest) {
  await dbConnect();

  if (!isAdmin(req)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const me = await getSessionUser();
  if (!me?.id) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // IMPORTANT: use findById/findOne (not find), and type the lean() result
  const doc = await User.findById(me.id)
    .select(
      "name email phone phoneCountryCode title avatar company website address timezone language notifications darkMode"
    )
    .lean<SettingsUser>();

  if (!doc) {
    return NextResponse.json(
      { ok: false, error: "Not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    user: {
      ...doc,
      // map avatar object -> string url for the client if you want a flat value
      avatar: doc.avatar?.url ?? "",
    },
  });
}

// Add this to support profile update (POST)
export async function POST(req: NextRequest) {
  await dbConnect();

  if (!isAdmin(req)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const me = await getSessionUser();
  if (!me?.id) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();

  // Only allow updating specific fields
  const allowed: Partial<SettingsUser> & { phoneCountryCode?: string } = {} as any;
  if (typeof body.name === "string") allowed.name = body.name;
  if (typeof body.phone === "string") {
    const { code, e164 } = parsePhone(body.phone);
    allowed.phone = e164 || body.phone;
    if (code) (allowed as any).phoneCountryCode = code;
  }
  if (typeof body.title === "string") allowed.title = body.title;
  if (typeof body.company === "string") allowed.company = body.company;
  if (typeof body.website === "string") allowed.website = body.website;
  if (typeof body.address === "string") allowed.address = body.address;
  if (typeof body.timezone === "string") allowed.timezone = body.timezone;
  if (typeof body.language === "string") allowed.language = body.language;
  if (typeof body.notifications === "boolean")
    allowed.notifications = body.notifications;
  if (typeof body.darkMode === "boolean") allowed.darkMode = body.darkMode;
  if (typeof body.avatar === "string") {
    allowed.avatar = { url: body.avatar };
  }

  // Update user
  await User.findByIdAndUpdate(me.id, allowed);

  return NextResponse.json({ ok: true });
}
