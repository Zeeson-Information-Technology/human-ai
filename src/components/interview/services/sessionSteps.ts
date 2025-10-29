export async function appendAIStep(
  sessionId: string,
  token: string,
  qText: string,
  followupHint?: string
) {
  try {
    await fetch(
      `/api/zuri/sessions/${encodeURIComponent(
        sessionId
      )}/append-step?t=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qText, followupHint, source: "ai" }),
      }
    );
  } catch {}
}
export async function finalizeSession(sessionId: string, token: string) {
  try {
    await fetch(
      `/api/zuri/sessions/${encodeURIComponent(
        sessionId
      )}/finalize?t=${encodeURIComponent(token)}`,
      { method: "POST" }
    );
  } catch {}
}
