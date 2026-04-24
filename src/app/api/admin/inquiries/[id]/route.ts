import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { isPlatformAdminRole, isScopedStaffRole } from "@/lib/admin-auth";
import dbConnect from "@/lib/db-connect";
import Inquiry from "@/model/inquiry";

function getActor(req: NextRequest) {
  const adminCookie = req.cookies.get("admin_token")?.value || "";
  const userCookie = req.cookies.get("token")?.value || "";
  const payload = verifyToken(adminCookie || userCookie);
  const role = String(payload?.role || "");
  if (!payload?.userId || (!isPlatformAdminRole(role) && !isScopedStaffRole(role))) {
    return null;
  }
  return { id: String(payload.userId), role };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const actor = getActor(req);
  if (!actor) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { ok: false, error: "Missing inquiry id" },
      { status: 400 }
    );
  }

  await dbConnect();
  const doc = await Inquiry.findById(id).lean();
  if (!doc) {
    return NextResponse.json(
      { ok: false, error: "Inquiry not found" },
      { status: 404 }
    );
  }
  if (
    !isPlatformAdminRole(actor.role) &&
    String((doc as any).assignedUserId || "") !== actor.id
  ) {
    return NextResponse.json(
      { ok: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  return NextResponse.json({
    ok: true,
    inquiry: {
      id: String((doc as any)._id),
      name: (doc as any).name || "",
      email: (doc as any).email || "",
      company: (doc as any).company || "",
      message: (doc as any).message || "",
      notes: (doc as any).notes || "",
      status: (doc as any).status || "new",
      assignedUserId: (doc as any).assignedUserId
        ? String((doc as any).assignedUserId)
        : "",
      assignedUserEmail: (doc as any).assignedUserEmail || "",
      workspaceCode: (doc as any).workspaceCode || "",
      workspaceTitle: (doc as any).workspaceTitle || "",
    },
  });
}
