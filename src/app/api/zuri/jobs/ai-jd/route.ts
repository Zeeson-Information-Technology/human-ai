// ================================
// FILE: src/app/api/zuri/jobs/ai-jd/route.ts
// ================================
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const Obj = z.object({
  summary: z.string().min(60),
  responsibilities: z.array(z.string()).min(5),
  requiredSkills: z.array(z.string()).min(5),
  niceToHaves: z.array(z.string()).optional().default([]),
  tooling: z.array(z.string()).optional().default([]),
  successMeasures: z.array(z.string()).optional().default([]),
});

function cap(s?: string) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      title = "",
      company = "",
      roleName = "",
      location = "remote",
      locationDetails = "",
      employmentType = "full-time",
      seniority = "mid",
      commImportance = 3,
      startDate = "",
      skills = [],

      // 💰 NEW
      salaryCurrency,
      monthlySalaryMin,
      monthlySalaryMax,
      hoursPerWeek,
    } = body || {};

    const compHint =
      monthlySalaryMin || monthlySalaryMax
        ? `Comp (monthly): ${salaryCurrency || ""} ${monthlySalaryMin ?? ""}${
            monthlySalaryMax ? `–${monthlySalaryMax}` : ""
          }`
        : "";

    const hoursHint = hoursPerWeek ? `Hours: ${hoursPerWeek}/week` : "";

    const audienceHints = [
      `Seniority: ${cap(seniority)}`,
      `Employment type: ${employmentType.replace("-", " ")}`,
      `Location: ${cap(location)}${
        locationDetails ? `, ${locationDetails}` : ""
      }`,
      startDate ? `Desired start: ${startDate}` : "",
      `Communication importance (1–5): ${commImportance}`,
      skills.length ? `Key skills to highlight: ${skills.join(", ")}` : "",
      roleName ? `Internal role family: ${roleName}` : "",
      compHint,
      hoursHint,
    ]
      .filter(Boolean)
      .join(" | ");

    // Load AI SDK lazily; return 501 if not installed
    const dynImport = (m: string) => (Function("return import(m)") as any)(m);
    let generateObject: any, google: any;
    try {
      ({ generateObject } = await dynImport("ai"));
      ({ google } = await dynImport("@ai-sdk/google"));
    } catch {
      return NextResponse.json(
        { ok: false, error: "AI SDK not installed on this deployment" },
        { status: 501 }
      );
    }

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: Obj,
      system: [
        "You generate crisp, business-grade job descriptions.",
        "Avoid markdown headings like ## or ###.",
        "Use short section labels followed by bullet points where applicable.",
        "Keep language inclusive and concrete; avoid fluff.",
      ].join("\n"),
      prompt: [
        `Job Title: ${title}`,
        `Company: ${company}`,
        audienceHints,
        "",
        "Write a concise 4–6 sentence Summary that candidates will read first.",
        "Then provide bullets for Responsibilities, Required Skills.",
        "Optional sections: Nice-to-haves, Tooling / Stack, How success is measured.",
        "Focus on clarity, outcomes, and measurable expectations.",
      ].join("\n"),
    });

    // Deterministic top meta + clean sections (no ##/###)
    const jdText = [
      `Job Title: ${title}`,
      `Company: ${company || "—"}`,
      `Location: ${cap(location)}${
        locationDetails ? `, ${locationDetails}` : ""
      }`,
      `Seniority: ${cap(seniority)}`,
      `Employment type: ${employmentType.replace("-", " ")}`,
      hoursPerWeek ? `Hours: ${hoursPerWeek}/week` : "",
      monthlySalaryMin || monthlySalaryMax
        ? `Monthly Salary Range: ${salaryCurrency || ""} ${
            monthlySalaryMin ?? ""
          }${monthlySalaryMax ? ` – ${monthlySalaryMax}` : ""}`
        : "",
      "",
      "Summary:",
      object.summary,
      "",
      "Responsibilities:",
      ...object.responsibilities.map((x: string) => `• ${x}`),
      "",
      "Required Skills:",
      ...object.requiredSkills.map((x: string) => `• ${x}`),
      object.niceToHaves.length
        ? ["", "Nice-to-haves:", ...object.niceToHaves.map((x: string) => `• ${x}`)]
        : [],
      object.tooling.length
        ? ["", "Tooling / Stack:", ...object.tooling.map((x: string) => `• ${x}`)]
        : [],
      object.successMeasures.length
        ? [
            "",
            "How success is measured:",
            ...object.successMeasures.map((x: string) => `• ${x}`),
          ]
        : [],
    ]
      .flat()
      .join("\n");

    return NextResponse.json({ ok: true, jdText }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: "AI JD failure" },
      { status: 500 }
    );
  }
}
