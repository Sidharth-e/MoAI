import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { OpenAIInstance } from '../services/openAI.js';
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
    const openai = OpenAIInstance();

    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-4.1',
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
