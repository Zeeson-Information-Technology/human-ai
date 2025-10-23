// src/app/api/talent/overview/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import { getSessionUser } from "@/lib/auth-utils";
import { Job } from "@/model/job";
import Session from "@/model/session";
import User from "@/model/user";

/**
 * Derivations with your schema:
 * - "Submitted apps": status IN ['pending','running']  (i.e., not finished/cancelled)
 * - "Past apps": status IN ['finished','cancelled']
 * - "Upcoming interviews": treat "running" (startedAt && !finishedAt) as upcoming/active
 * - "Past interviews": status === 'finished'
 */
export async function GET() {
  await dbConnect();

  const sessionUser = await getSessionUser();
  if (!sessionUser?.email) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  if (sessionUser.role !== "talent") {
    return NextResponse.json(
      { ok: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  const email = sessionUser.email.toLowerCase();

  // Pull user's name (and any other profile fields) from DB
  const userDoc = await User.findOne({ email }).select(
    "name email role company isVerified"
  );

  const sessions = await Session.find({ "candidate.email": email }, null, {
    sort: { createdAt: -1 },
  }).lean();

  const jobIds = Array.from(
    new Set(sessions.map((s: any) => s.jobId?.toString()).filter(Boolean))
  );
  const jobs = jobIds.length
    ? await Job.find({ _id: { $in: jobIds } }).lean()
    : [];
  const jobById = new Map(jobs.map((j: any) => [j._id.toString(), j]));

  const isSubmitted = (s: any) =>
    s.status === "pending" || s.status === "running";
  const isPast = (s: any) =>
    s.status === "finished" || s.status === "cancelled";
  const isUpcomingInterview = (s: any) =>
    s.status === "running" && !s.finishedAt;
  const isPastInterview = (s: any) => s.status === "finished";

  const submittedApplications = sessions.filter(isSubmitted);
  const pastApplications = sessions.filter(isPast);
  const upcomingInterviews = sessions.filter(isUpcomingInterview);
  const pastInterviews = sessions.filter(isPastInterview);

  const summary = {
    applicationsTotal: sessions.length,
    applicationsSubmitted: submittedApplications.length,
    applicationsPast: pastApplications.length,
    interviewsUpcoming: upcomingInterviews.length,
    interviewsPast: pastInterviews.length,
    offers: sessions.filter((s: any) => s.pipelineStage === "offer").length,
    contracts: sessions.filter((s: any) => s.pipelineStage === "contract")
      .length,
  };

  return NextResponse.json({
    ok: true,
    user: {
      id: userDoc ? String(userDoc._id) : sessionUser.id, // fallback to token id
      email: sessionUser.email,
      name: userDoc?.name || "", // 👈 added name here
      role: sessionUser.role,
    },
    summary,
    data: {
      submittedApplications: submittedApplications.map((s: any) => ({
        ...s,
        job: s.jobId ? jobById.get(s.jobId.toString()) : null,
      })),
      pastApplications: pastApplications.map((s: any) => ({
        ...s,
        job: s.jobId ? jobById.get(s.jobId.toString()) : null,
      })),
      upcomingInterviews: upcomingInterviews.map((s: any) => ({
        ...s,
        job: s.jobId ? jobById.get(s.jobId.toString()) : null,
      })),
      pastInterviews: pastInterviews.map((s: any) => ({
        ...s,
        job: s.jobId ? jobById.get(s.jobId.toString()) : null,
      })),
      offers: sessions
        .filter((s: any) => s.pipelineStage === "offer")
        .map((s: any) => ({
          ...s,
          job: s.jobId ? jobById.get(s.jobId.toString()) : null,
        })),
      contracts: sessions
        .filter((s: any) => s.pipelineStage === "contract")
        .map((s: any) => ({
          ...s,
          job: s.jobId ? jobById.get(s.jobId.toString()) : null,
        })),
      payments: [],
    },
  });
}
