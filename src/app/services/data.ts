export const services = [
  {
    slug: "bid-qualification",
    title: "Bid qualification",
    navLabel: "Bid Qualification",
    summary:
      "Review requirements, timelines, fit, and delivery expectations so pursuit decisions are made with clarity early.",
    eyebrow: "Early pursuit intelligence",
    headline: "Know whether an opportunity deserves the work.",
    body:
      "We help teams read the opportunity before the response machine starts. The focus is fit, risk, timelines, mandatory requirements, delivery confidence, and the questions that need answers before committing serious effort.",
    outcomes: [
      "Clear bid / no-bid considerations",
      "Early risk, gap, and dependency review",
      "Buyer priorities and evaluation signals",
      "Practical recommendation on the response path",
    ],
    bestFor: [
      "A new RFP has arrived and the team is unsure whether to pursue.",
      "The opportunity looks attractive but requirements, timeline, or fit are unclear.",
      "Leadership needs a quick, structured view before committing internal effort.",
    ],
    inputs: [
      "RFP, RFS, tender notice, or portal listing",
      "Known client context and current relationship notes",
      "Capacity, delivery, pricing, and strategic concerns",
    ],
  },
  {
    slug: "response-development",
    title: "Response development",
    navLabel: "Response Development",
    summary:
      "Draft executive summaries, response sections, and value-led narratives that speak to buyer priorities.",
    eyebrow: "Proposal writing and shaping",
    headline: "Turn scattered inputs into a clear response.",
    body:
      "We shape the response around what the buyer needs to understand: the problem, the approach, the evidence, and the reason to trust the team. AI can support structure and speed, but the narrative is led by human proposal judgment.",
    outcomes: [
      "Executive summaries and response sections",
      "Value-led positioning and buyer-focused language",
      "Content shaping from SME and client inputs",
      "Cleaner drafts that move review forward",
    ],
    bestFor: [
      "The team has strong substance but needs help turning it into evaluator-ready language.",
      "SME notes, old content, and buyer requirements are scattered across different sources.",
      "The response needs a clearer story, stronger evidence, or better executive-level framing.",
    ],
    inputs: [
      "RFP requirements and evaluation criteria",
      "Existing company content, past proposals, or capability notes",
      "SME, delivery, pricing, and client stakeholder input",
    ],
  },
  {
    slug: "compliance-tracking",
    title: "Compliance tracking",
    navLabel: "Compliance Tracking",
    summary:
      "Translate instructions into a clear response structure so mandatory requirements do not get lost.",
    eyebrow: "Requirement control",
    headline: "Keep mandatory requirements visible until submission.",
    body:
      "RFPs often fail in the details: forms, attachments, mandatory statements, evaluation criteria, and submission instructions. We help convert those requirements into a practical response checklist and review path.",
    outcomes: [
      "Compliance matrix and instruction tracking",
      "Mandatory criteria and attachment review",
      "Submission requirement checks",
      "Cleaner last-mile review before packaging",
    ],
    bestFor: [
      "The RFP has many instructions, forms, attachments, or mandatory criteria.",
      "The team is worried about missing a requirement close to submission.",
      "Multiple contributors need a shared view of what must be answered or attached.",
    ],
    inputs: [
      "RFP instructions, addenda, forms, and schedules",
      "Draft response documents and attachment list",
      "Submission portal requirements and deadline details",
    ],
  },
  {
    slug: "expert-input-capture",
    title: "Expert input capture",
    navLabel: "Expert Input Capture",
    summary:
      "Bring technical, commercial, and delivery perspectives into the response without creating noise or delay.",
    eyebrow: "Human intelligence collection",
    headline: "Capture the knowledge behind the proposal.",
    body:
      "Strong responses depend on the people who understand delivery, pricing, operations, risk, technology, and customer context. We help collect that intelligence in a structured way so it can be used in the proposal.",
    outcomes: [
      "Structured SME questions and review notes",
      "Client and stakeholder clarification support",
      "Technical and delivery input synthesis",
      "Reusable intelligence for future pursuits",
    ],
    bestFor: [
      "The response depends on expert knowledge that is not yet documented.",
      "Technical, delivery, commercial, or operational teams need to contribute without slowing the process.",
      "The proposal needs credible detail from people who understand the work deeply.",
    ],
    inputs: [
      "Opportunity brief and known gaps",
      "SME names, roles, and available source material",
      "Technical notes, project examples, or delivery assumptions",
    ],
  },
  {
    slug: "review-and-refinement",
    title: "Review and refinement",
    navLabel: "Review & Refinement",
    summary:
      "Strengthen clarity, consistency, evidence, and evaluator-readability before final packaging.",
    eyebrow: "Response quality improvement",
    headline: "Make the response easier to evaluate and trust.",
    body:
      "Before submission, the response needs more than proofreading. It needs clarity, consistency, evidence, alignment to scoring criteria, and a final check that the buyer can understand the value quickly.",
    outcomes: [
      "Evaluator-readability review",
      "Clarity, consistency, and evidence checks",
      "Theme and differentiation refinement",
      "Final response improvement before submission",
    ],
    bestFor: [
      "A draft exists but needs sharper positioning, clearer language, or stronger proof.",
      "The response was assembled by several contributors and needs one consistent voice.",
      "The team wants a final quality pass before approvals, packaging, or submission.",
    ],
    inputs: [
      "Current proposal draft and compliance matrix",
      "Buyer scoring criteria and response instructions",
      "Known win themes, differentiators, and evidence sources",
    ],
  },
  {
    slug: "cross-market-readiness",
    title: "Cross-market readiness",
    navLabel: "Cross-Market Readiness",
    summary:
      "Support opportunities across global buyer environments, including current focus areas in Canada, the US, and the UK.",
    eyebrow: "Market-aware response support",
    headline: "Adapt the response to the buyer environment.",
    body:
      "Different markets and buyers expect different levels of structure, evidence, governance, and formality. We help teams prepare responses that fit the opportunity context without overcomplicating the work.",
    outcomes: [
      "Canada, US, and UK response awareness",
      "Public and private sector tender expectations",
      "Framework and formal tender language support",
      "Cross-functional readiness for global opportunities",
    ],
    bestFor: [
      "The opportunity is in a market where tender expectations are unfamiliar.",
      "The client needs support adapting language, structure, or evidence to the buyer environment.",
      "The response involves public-sector, framework, or enterprise procurement expectations.",
    ],
    inputs: [
      "RFP source country, buyer type, and procurement context",
      "Client service model, qualifications, and past performance evidence",
      "Required certifications, governance language, or delivery assumptions",
    ],
  },
] as const;

export type ServiceSlug = (typeof services)[number]["slug"];

export function getService(slug: string) {
  return services.find((service) => service.slug === slug);
}
