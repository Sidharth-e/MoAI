import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { OpenAIInstance } from "../services/openAI.js";
import { z } from "zod";

// Use backticks for string interpolation
const generateSystemMessage = (parsed_resume: string, parsed_jd: string) => `
        Generate a professional gap analysis summary comparing the resume and JD.

        Resume:
        ${parsed_resume}

        JD:
        ${parsed_jd}

        Highlight strengths, gaps, and whether the candidate is a good fit.
`;

export const summarizeGap = {
  name: "summarizeGap",
  schema: {
    resume: z.string(),
    jd: z.string(),
  },
  handler: async ({
    resume,
    jd,
  }: {
    resume: string;
    jd: string;
  }): Promise<CallToolResult> => {
    const openai = OpenAIInstance();

    const systemContent = generateSystemMessage(resume, jd);

    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        { role: "system", content: systemContent },
        {
          role: "user",
          content:
            "Based on the resume and job description, generate the gap analysis as instructed.",
        },
      ],
      temperature: 0.2,
    });

    const parsedOutput = chatResponse.choices[0].message.content;

    return {
      content: [
        {
          type: "text",
          text: parsedOutput || "No response from parser.",
        },
      ],
    };
  },
};
