// ================================
// FILE: src/app/api/zuri/jobs/ai-jd/route.ts
// Generate a job description via AI SDK if available; otherwise use a
// deterministic, business-grade fallback template.
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

function formatLocation(kind?: string, details?: string) {
  const k = (kind || "").toLowerCase();
  const d = (details || "").trim();
  if (k === "remote") return d ? `Remote (${d})` : "Remote";
  if (k === "hybrid") return d ? `Hybrid - ${d}` : "Hybrid";
  if (k === "onsite") return d ? `On-site - ${d}` : "On-site";
  return [cap(k), d].filter(Boolean).join(" - ");
}

function locationPhrase(kind?: string, details?: string) {
  const k = (kind || "").toLowerCase();
  const d = (details || "").trim();
  if (k === "remote") return d ? `a remote role within ${d}` : "a remote role";
  if (k === "hybrid") return d ? `a hybrid role in ${d}` : "a hybrid role";
  if (k === "onsite") return d ? `an on-site role in ${d}` : "an on-site role";
  return d ? `a role in ${d}` : "the role";
}

function guessLanguageFromText(...parts: Array<string | string[] | undefined>) {
  const bank = ["yoruba", "hausa", "igbo", "swahili", "pidgin", "arabic", "french", "english"];
  const flat = parts
    .flatMap((p) => (Array.isArray(p) ? (p as string[]) : [p as any]))
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  for (const lang of bank) {
    if (flat.includes(lang)) return cap(lang);
  }
  return "the target language(s)";
}

function isAnnotatorRole(...parts: Array<string | undefined>) {
  const flat = parts.filter(Boolean).join(" ").toLowerCase();
  // include common typos/synonyms
  const re = /(annotator|anotator|annotation|linguist|labeler|labeller|labeling|labelling|transcriber|transcription|data\s*label)/i;
  return re.test(flat);
}

function presentEmploymentType(v?: string) {
  const k = (v || "").toLowerCase();
  if (k === "full-time") return "Full-time";
  if (k === "part-time") return "Part-time";
  if (k === "contract") return "Contract";
  if (k === "internship") return "Internship";
  return cap(k.replace("-", " "));
}

function fmtMoney(n?: number | string) {
  const num = typeof n === "string" ? Number(n) : n;
  if (num === undefined || num === null || Number.isNaN(num)) return "";
  try {
    return Number(num).toLocaleString("en-US");
  } catch {
    return String(num);
  }
}

function fmtStartDate(d?: string) {
  const s = (d || "").trim();
  if (!s) return "";
  const dt = new Date(s);
  if (isNaN(dt.getTime())) return s;
  try {
    return dt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
  } catch {
    return s;
  }
}

function titleCaseToken(token: string) {
  if (!token) return token;
  return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
}

function normalizeTitleText(t?: string) {
  const raw = (t || "").trim();
  if (!raw) return "";
  let s = raw;
  // Targeted corrections for common roles/typos
  s = s.replace(/\banotator\b/gi, "Annotator");
  s = s.replace(/\bannotator\b/gi, "Annotator");
  s = s.replace(/\btranscriber\b/gi, "Transcriber");
  s = s.replace(/\bdevops\b/gi, "DevOps");
  // Title-case words, preserving hyphens
  s = s
    .split(/\s+/)
    .map((w) => w.split("-").map(titleCaseToken).join("-"))
    .join(" ");
  return s.replace(/\s+/g, " ").trim();
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

      // Optional comp/hours hints
      salaryCurrency,
      monthlySalaryMin,
      monthlySalaryMax,
      hoursPerWeek,
    } = body || {};

    const compHint =
      monthlySalaryMin || monthlySalaryMax
        ? `Comp (monthly): ${salaryCurrency || ""} ${monthlySalaryMin ?? ""}${
            monthlySalaryMax ? ` - ${monthlySalaryMax}` : ""
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
      `Communication importance (1-5): ${commImportance}`,
      Array.isArray(skills) && (skills as string[]).length
        ? `Key skills to highlight: ${(skills as string[]).join(", ")}`
        : "",
      roleName ? `Internal role family: ${roleName}` : "",
      compHint,
      hoursHint,
    ]
      .filter(Boolean)
      .join(" | ");

    // Attempt AI SDK; fall back if not installed
    const dynImport = (m: string) => (Function("return import(m)") as any)(m);
    let generateObject: any = null;
    let google: any = null;
    try {
      ({ generateObject } = await dynImport("ai"));
      ({ google } = await dynImport("@ai-sdk/google"));
    } catch {
      // ignore; fallback below
    }

    let object: z.infer<typeof Obj>;
    const normalizedRole = normalizeTitleText(title || roleName || "");
    if (generateObject && google) {
      const out = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: Obj,
        system: [
          "You generate crisp, business-grade job descriptions.",
          "Avoid markdown headings like ## or ###.",
          "Use short section labels followed by bullet points where applicable.",
          "Keep language inclusive and concrete; avoid fluff.",
        ].join("\n"),
        prompt: [
          `Job Title: ${normalizedRole || title}`,
          `Company: ${company}`,
          `Location: ${formatLocation(location, locationDetails)}`,
          audienceHints,
          "",
          "Write a concise 4-6 sentence Summary that candidates will read first.",
          "Then provide bullets for Responsibilities, Required Skills.",
          "Optional sections: Nice-to-haves, Tooling / Stack, How success is measured.",
          "Focus on clarity, outcomes, and measurable expectations.",
          title.toLowerCase().includes("annotator") || (roleName || "").toLowerCase().includes("annotator")
            ? `Tailor to a language data Annotator role; include tasks like transcription (with diacritics when applicable), entity tagging, intent/slot labeling, guideline refinement, QA and inter-annotator agreement.`
            : "",
        ].join("\n"),
      });
      object = out.object as z.infer<typeof Obj>;
    } else {
      // Deterministic fallback (no external dependencies)
      const skillList = Array.isArray(skills) ? (skills as string[]) : [];
      const role = normalizedRole || title || roleName || "Role";
      const comp = company || "Company";
      const locString = formatLocation(location, locationDetails);
      const locPhrase = locationPhrase(location, locationDetails);

      const roleLc = role.toLowerCase();
      const annotator = isAnnotatorRole(role, roleName);
      const langLabel = guessLanguageFromText(title, roleName, skills);

      let resp: string[];
      let reqSkills: string[];
      let nice: string[];
      let tools: string[];
      let success: string[];

      if (annotator) {
        resp = [
          `Annotate ${langLabel} text and audio for tasks such as transcription (with diacritics where applicable), entity tagging, intent/slot labeling, normalization, and quality grading`,
          "Apply and refine annotation guidelines; flag edge cases and ambiguous examples",
          "Perform linguistic QA and help resolve disagreements to improve inter-annotator agreement",
          "Run calibration sessions and adjudicate disagreements; version and maintain guidelines",
          "Curate balanced datasets and track data lineage and sampling coverage (domain/dialect/register)",
          `Collaborate with ML and QA on data quality needs, error analysis, and sampling strategy at ${comp}`,
          "Ensure data privacy and PII redaction; handle sensitive content appropriately",
          "For audio: perform basic segmentation and phonetic review using ELAN/Praat (as needed)",
        ];
        const languageWords = [
          "yoruba",
          "hausa",
          "igbo",
          "swahili",
          "pidgin",
          "arabic",
          "french",
          "english",
          "language",
        ];
        const extraSkills = skillList
          .filter(Boolean)
          .filter((x) => {
            const s = String(x).toLowerCase();
            return !languageWords.some((w) => s.includes(w));
          })
          .slice(0, Math.max(0, 7 - 5));

        reqSkills = [
          `${langLabel} proficiency and strong written English`,
          "Experience with data annotation and following/writing guidelines",
          "High attention to detail and consistency",
          "Ability to communicate issues and propose fixes",
          "Comfort with basic spreadsheets or scripts for data handling",
          ...extraSkills,
        ];
        nice = [
          "Familiarity with dialectal variation and normalization",
          "Experience with ASR/NLU/NMT datasets or QA",
          "Prior work improving inter-annotator agreement",
        ];
        // Build tools: default labeling tools + filter out language-only items
        const extraTools = skillList
          .filter(Boolean)
          .filter((x) => {
            const s = String(x).toLowerCase();
            return !languageWords.some((w) => s.includes(w));
          })
          .slice(0, 3);
        tools = [
          "Label Studio",
          "Prodigy",
          "Doccano",
          "ELAN",
          "Praat",
          "Google Sheets",
          "Jira",
          ...extraTools,
        ];
        success = [
          "Inter-annotator agreement (e.g., Cohen's kappa) ≥ 0.75",
          "QA pass rate ≥ 95% with strong precision/recall",
          "Consistent throughput meets targets; rework ≤ 3%",
        ];
      } else {
        reqSkills = (
          skillList.length >= 5
            ? skillList
            : [
                "Strong communication",
                "Problem-solving",
                "Collaboration",
                "Time management",
                "Ownership mindset",
              ]
        ).slice(0, 7);
        resp = [
          `Design, build, and maintain ${role.toLowerCase()} deliverables aligned to business outcomes`,
          `Collaborate with cross-functional partners across ${comp} to deliver on priorities`,
          "Drive high-quality, well-documented work with clear acceptance criteria",
          "Continuously improve processes, tooling, and team workflows",
          "Communicate status, risks, and trade-offs with stakeholders",
          "Mentor peers and contribute to a positive team culture",
        ];
        nice = [
          "Experience in an early-stage/startup environment",
          "Contributions to open-source or community initiatives",
          "Familiarity with modern DevOps/SRE practices",
        ];
        tools = skillList.slice(0, 6);
        success = [
          "Measurable impact on key KPIs within 90 days",
          "On-time delivery of roadmap items with high quality",
          "Clear stakeholder satisfaction and minimal rework",
        ];
      }
      object = {
        summary: `${comp} is hiring a ${cap(seniority)} ${role} (${presentEmploymentType(employmentType)}). This is ${locPhrase}. You will collaborate across teams to produce high-quality outcomes. We value clear communication, pragmatic problem-solving, and a bias for action. This role blends hands-on execution with thoughtful planning and continuous improvement.`,
        responsibilities: resp,
        requiredSkills: reqSkills,
        niceToHaves: nice,
        tooling: tools,
        successMeasures: success,
      } as z.infer<typeof Obj>;
    }

    // Deterministic top meta + clean sections (no markdown headings)
    const jdText = [
      `Job Title: ${normalizedRole || title}`,
      `Company: ${company || "-"}`,
      `Location: ${formatLocation(location, locationDetails)}`,
      `Seniority: ${cap(seniority)}`,
      `Employment type: ${presentEmploymentType(employmentType)}`,
      hoursPerWeek ? `Hours: ${hoursPerWeek}/week` : "",
      startDate ? `Target start: ${fmtStartDate(startDate)}` : "",
      monthlySalaryMin || monthlySalaryMax
        ? `Monthly Salary Range: ${salaryCurrency || ""} ${fmtMoney(monthlySalaryMin)}${
            monthlySalaryMax ? ` - ${fmtMoney(monthlySalaryMax)}` : ""
          } /month`
        : "",
      "",
      "Summary:",
      object.summary,
      "",
      "Responsibilities:",
      ...object.responsibilities.map((x: string) => `- ${x}`),
      "",
      "Required Skills:",
      ...object.requiredSkills.map((x: string) => `- ${x}`),
      object.niceToHaves.length
        ? [
            "",
            "Nice-to-haves:",
            ...object.niceToHaves.map((x: string) => `- ${x}`),
          ]
        : [],
      object.tooling.length
        ? [
            "",
            "Tooling / Stack:",
            ...object.tooling.map((x: string) => `- ${x}`),
          ]
        : [],
      object.successMeasures.length
        ? [
            "",
            "How success is measured:",
            ...object.successMeasures.map((x: string) => `- ${x}`),
          ]
        : [],
    ]
      .flat()
      .join("\n");

    return NextResponse.json({ ok: true, jdText }, { status: 200 });
  } catch (e) {
    console.error("AI JD generation error", e);
    return NextResponse.json(
      { ok: false, error: "AI JD failure" },
      { status: 500 }
    );
  }
}
