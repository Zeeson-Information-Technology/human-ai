// src/lib/llm/tools.ts
import { tool } from 'ai';
import { z } from 'zod';

export const interviewTools = {
  getInterviewQuestion: tool({
    description: 'Get the next interview question to ask the candidate. Use the context from the conversation, the job description, and the candidate\'s resume to formulate a relevant question.',
    parameters: z.object({
      jobContext: z.string().describe('The context of the job the candidate is interviewing for.'),
      resumeSummary: z.string().describe("The candidate's resume summary."),
      history: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })).describe('The history of the conversation so far.'),
      answer: z.string().describe("The candidate's last answer."),
    }),
    execute: async ({ jobContext, resumeSummary, history, answer }) => {
      // For now, this is a placeholder.
      // In the future, this could call a separate LLM or use a question bank.
      console.log("Executing getInterviewQuestion tool");
      return {
        text: "This is a placeholder question from the getInterviewQuestion tool. What is your greatest weakness?",
        followups: ["Can you give an example?"]
      };
    },
  }),
};
