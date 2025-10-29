// src/lib/llm/prompt.ts
export function buildTurnPrompt({
  sys,
  jobContext,
  resumeSummary,
  aiGuide,
  rubricHints,
  history,
  answer,
}: {
  sys: string;
  jobContext: string;
  resumeSummary: string;
  aiGuide?: string;
  rubricHints?: string;
  history: Array<{ role: "assistant" | "user"; content: string }>;
  answer: string;
}) {
  const customization = aiGuide ? `\nCustomization (admin guide):\n${aiGuide}` : "";
  const rubric = rubricHints ? `\nRubric hints:\n${rubricHints}` : "";
  const ctx = `Job Context:\n${jobContext}${rubric}\n\nResume Summary:\n${resumeSummary}${customization}`;
  const turns = history
    .map((h) => `${h.role === "assistant" ? "Interviewer" : "Candidate"}: ${h.content}`)
    .join("\n");
  const prompt =
    `${sys}\n\n${ctx}\n\n${turns}\nCandidate: ${answer}\n\n` +
    `Interviewer: Next question and optional brief follow-ups (pure JSON): ` +
    `{"text": "...", "followups": ["...", "..."]}`;
  return prompt;
}

