import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { createAzureOpenAIClient } from '../services/aoai';
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
     const {client,deployment} = createAzureOpenAIClient();

    const chatResponse = await client.chat.completions.create({
      model: deployment,
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
