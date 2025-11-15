const assert = require("node:assert");
const { InterviewTurnSchema } = require("../src/lib/llm/provider-test-shim");

// Happy-path: a complete, well-formed interview turn
{
  const valid = {
    text: "Tell me about a time you led a team?",
    followups: ["What was the hardest part?"],
    endInterview: false,
  };

  const parsed = InterviewTurnSchema.parse(valid);
  assert.equal(parsed.text, valid.text, "text should round-trip");
  assert.deepEqual(
    parsed.followups,
    valid.followups,
    "followups should round-trip"
  );
  assert.strictEqual(
    parsed.endInterview,
    false,
    "endInterview should be preserved when provided"
  );
}

// Validation: text is required and must be a string
{
  let threw = false;
  try {
    InterviewTurnSchema.parse({ followups: ["missing text field"] });
  } catch {
    threw = true;
  }
  assert(threw, "schema should reject objects without text");
}

console.log("interview-turn.test: OK");
