import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { OpenAIInstance } from '../services/openAI.js';
import { z } from 'zod';

const systemMessage = `
        You are a JD parser. Extract the following fields from the text:
        - Job title
        - Responsibilities
        - Required skills
        - Preferred skills

`;

export const parseJD = {
  name: 'parseJD',
  schema: {
    jd: z.string(),
  },
  handler: async ({ jd }: { jd: string }): Promise<CallToolResult> => {
    const openai = OpenAIInstance();

    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: jd },
      ],
      temperature: 0.2,
    });

    const parsedOutput = chatResponse.choices[0].message.content;

    return {
      content: [
        {
          type: 'text',
          text: parsedOutput || 'No response from parser.',
        },
      ],
    };
  },
};
