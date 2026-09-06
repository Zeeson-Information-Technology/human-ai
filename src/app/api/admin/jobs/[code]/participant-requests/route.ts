import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/db-connect";
import { getSessionUser } from "@/lib/auth-utils";
import ParticipantRequest from "@/model/participant-request";
import { Job } from "@/model/opportunity";
import sendEmail from "@/lib/sendSmtpMail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Slot = z.object({ startAt: z.coerce.date(), timezone: z.string().optional() });
const Update = z.object({
  status: z.enum(["scheduled", "declined", "cancelled"]).optional(),
  selectedSlot: Slot.nullable().optional(),
});

async function authorized(req: NextRequest) {
  const user = await getSessionUser(req);
  return user && ["admin", "company", "staff", "manager", "recruiter"].includes(String(user.role)) ? user : null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const user = await authorized(req);
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const { code } = await params;
  const job = (await Job.findOne({ code: code.toUpperCase() }, { _id: 1 }).lean()) as any;
  if (!job) return NextResponse.json({ ok: false, error: "Opportunity not found" }, { status: 404 });
  const requests = await ParticipantRequest.find({ opportunityId: job._id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ ok: true, requests: requests.map((request: any) => ({ ...request, id: String(request._id), opportunityId: String(request.opportunityId), sessionId: request.sessionId ? String(request.sessionId) : undefined })) });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const user = await authorized(req);
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const parsed = Update.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid update" }, { status: 400 });
  await dbConnect();
  const { code } = await params;
  const requestId = new URL(req.url).searchParams.get("requestId");
  if (!requestId) return NextResponse.json({ ok: false, error: "Missing requestId" }, { status: 400 });
  const update: Record<string, unknown> = {};
  if (parsed.data.status) update.status = parsed.data.status;
  if (parsed.data.selectedSlot !== undefined) update.selectedSlot = parsed.data.selectedSlot;
  const request = (await ParticipantRequest.findOneAndUpdate({ _id: requestId, jobCode: code.toUpperCase() }, { $set: update }, { new: true }).lean()) as any;
  if (!request) return NextResponse.json({ ok: false, error: "Participant request not found" }, { status: 404 });
  if (parsed.data.status === "scheduled" || parsed.data.status === "declined") {
    try {
      await sendEmail({
        to: request.email,
        subject: parsed.data.status === "scheduled" ? "Your interview has been scheduled" : "Interview request update",
        template: "participant-request-update",
        replacements: {
          heading: parsed.data.status === "scheduled" ? "Your interview has been scheduled" : "Your interview request needs another time",
          name: request.name || "there",
          email: request.email,
          opportunity: code.toUpperCase(),
          detail: parsed.data.selectedSlot?.startAt ? new Date(parsed.data.selectedSlot.startAt).toLocaleString() : "",
          action: parsed.data.status === "scheduled" ? "Please reply to this email if you need to discuss the appointment." : "The team will follow up with next steps.",
        },
        replyTo: process.env.CONTACT_TO_EMAIL || undefined,
      });
    } catch (notificationError) {
      console.error("Participant notification failed", notificationError);
    }
  }
  return NextResponse.json({ ok: true, request: { ...request, id: String(request._id) } });
}
