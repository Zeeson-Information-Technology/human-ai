export const careers = [
  {
    slug: "proposal-writer-intern",
    title: "Proposal Writer Intern",
    type: "Internship",
    location: "Remote",
    status: "Open",
    summary:
      "Support proposal drafting, formatting, content coordination, and response development across active client opportunities.",
    headline: "Grow into proposal writing through real client work.",
    intro:
      "This internship is designed for someone who wants hands-on exposure to proposal, bid, and RFP work. You will support live opportunities while learning how strong responses are structured, written, reviewed, and finalized.",
    whoWeAre:
      "Euman Intelligence is a proposal intelligence company. We support clients across proposals, bids, and RFPs by combining human judgment with AI-enabled structure and execution. Our work is remote, collaborative, deadline-driven, and focused on helping global clients respond with more clarity.",
    responsibilities: [
      "Support drafting, editing, and formatting of proposal content and response sections.",
      "Help organize client inputs, supporting documents, and source materials for active opportunities.",
      "Assist with compliance checks, content updates, and version control during reviews.",
      "Join internal coordination sessions and help capture action items, gaps, and next steps.",
      "Contribute to maintaining clear, readable, evaluator-friendly proposal language.",
    ],
    qualifications: [
      "Strong written English and clear business communication.",
      "Careful attention to detail and comfort working with structured documents.",
      "Ability to follow guidance, incorporate feedback, and work independently in a remote setup.",
      "Interest in proposal writing, tender responses, consulting, or professional services work.",
      "Basic familiarity with Word, Google Docs, and spreadsheet-based trackers is helpful.",
    ],
    whatToSend: [
      "Your resume",
      "A short cover letter explaining why you are interested in proposal work",
      "Any writing sample that shows clarity, structure, or business writing ability, if available",
    ],
  },
  {
    slug: "proposal-manager-intern",
    title: "Proposal Manager Intern",
    type: "Internship",
    location: "Remote",
    status: "Open",
    summary:
      "Support work planning, tracker management, review coordination, and deadline follow-through across proposal engagements.",
    headline: "Learn how proposal work is coordinated from signal to submission.",
    intro:
      "This role is for someone who is naturally organized and wants experience supporting the management side of proposals and bids. You will help keep response work moving across deadlines, inputs, reviews, and stakeholder follow-up.",
    whoWeAre:
      "Euman Intelligence is a proposal intelligence company supporting global clients through structured RFP, tender, and bid work. We blend human coordination and judgment with AI-enabled efficiency to reduce friction in the response process.",
    responsibilities: [
      "Support workbench and tracker updates across active opportunities.",
      "Help follow up on content inputs, reviewer comments, and outstanding dependencies.",
      "Assist with document organization, review scheduling, and deadline visibility.",
      "Capture meeting notes, status updates, and open actions clearly and reliably.",
      "Support proposal leads in keeping workstreams structured and moving forward.",
    ],
    qualifications: [
      "Strong organizational habits and comfort managing details across multiple tasks.",
      "Clear written communication and confidence following up professionally.",
      "Ability to work remotely with discipline and dependable responsiveness.",
      "Interest in operations, project coordination, proposal management, or client delivery.",
      "Comfort with spreadsheets, trackers, and task coordination tools is useful.",
    ],
    whatToSend: [
      "Your resume",
      "A short cover letter explaining why you are interested in proposal coordination or management",
      "Any example of school, volunteer, or work experience where you kept people or tasks organized, if available",
    ],
  },
  {
    slug: "junior-proposal-writer",
    title: "Junior Proposal Writer",
    type: "Full-time",
    location: "Remote",
    status: "Open",
    summary:
      "Contribute to structured RFP and bid responses, build response sections, and work closely with senior reviewers and client-facing leads.",
    headline: "Write clearer, stronger responses for real opportunities.",
    intro:
      "This role is for someone who already has a foundation in writing, business communication, or professional services work and wants to grow into a stronger proposal writer. You will contribute directly to response development across live client opportunities.",
    whoWeAre:
      "Euman Intelligence helps businesses navigate proposals, bids, and RFPs through a model that combines human judgment with AI-enabled execution. We work with distributed teams and global clients, and we care deeply about clarity, structure, and follow-through.",
    responsibilities: [
      "Draft and refine response sections, executive summaries, and supporting proposal language.",
      "Translate source material, client notes, and reviewer comments into clear written responses.",
      "Support compliance alignment so responses reflect the structure and requirements of the opportunity.",
      "Work with senior reviewers and proposal leads to strengthen clarity, consistency, and evidence.",
      "Help maintain high writing standards across multiple active opportunities.",
    ],
    qualifications: [
      "Strong writing ability with clear, structured, professional language.",
      "Ability to work from source material and shape it into concise response content.",
      "Comfort receiving editorial feedback and improving drafts through review cycles.",
      "Reliable remote work habits and the ability to manage deadlines with care.",
      "Prior exposure to proposals, grants, tenders, business writing, consulting, or client delivery is valuable.",
    ],
    whatToSend: [
      "Your resume",
      "A cover letter showing why you are interested in this role",
      "A writing sample relevant to business, proposals, reports, or structured communication",
    ],
  },
] as const;

export type CareerSlug = (typeof careers)[number]["slug"];

export function getCareer(slug: string) {
  return careers.find((career) => career.slug === slug);
}
