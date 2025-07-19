import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { createAzureOpenAIClient } from '../services/aoai';
import { z } from 'zod';

const systemMessage = `You are a resume parser. Extract the following fields from the text:
- Name
- Education
- Skills
- Work experience (roles, companies, duration)
`;

export const parseResume = {
  name: 'parseResume',
  schema: {
    resume: z.string(),
  },
  handler: async ({ resume }: { resume: string }): Promise<CallToolResult> => {
    const {client,deployment} = createAzureOpenAIClient();

    const chatResponse = await client.chat.completions.create({
      model: deployment,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: resume },
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
