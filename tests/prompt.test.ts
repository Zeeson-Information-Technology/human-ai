const assert = require('node:assert');
const { buildTurnPrompt } = require('../src/lib/llm/prompt');

{
  const sys = 'You are Zuri';
  const prompt = buildTurnPrompt({
    sys,
    jobContext: 'Role: Frontend Engineer',
    resumeSummary: 'Built dashboards',
    aiGuide: 'Focus on React, TypeScript',
    rubricHints: '- React (weight 40/100): hooks and state\n- TS (weight 30/100): generics',
    history: [
      { role: 'assistant', content: 'Tell me about a recent project' },
      { role: 'user', content: 'I built a dashboard with charts' },
    ],
    answer: 'It handled live updates',
  });

  assert(prompt.includes(sys), 'includes system');
  assert(prompt.includes('Job Context:'), 'includes ctx header');
  assert(prompt.includes('Resume Summary:'), 'includes resume header');
  assert(prompt.includes('Customization (admin guide):'), 'includes guide');
  assert(prompt.includes('Rubric hints:'), 'includes rubric');
  assert(prompt.includes('Interviewer: Tell me about a recent project'), 'maps assistant->Interviewer');
  assert(prompt.includes('Candidate: I built a dashboard with charts'), 'maps user->Candidate');
  assert(prompt.includes('Candidate: It handled live updates'), 'appends latest answer');
  assert(prompt.includes('Interviewer: Next question'), 'JSON instruction present');
}

console.log('prompt.test: OK');

