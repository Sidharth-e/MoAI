import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { createAzureOpenAIClient } from '../services/aoai';
import { z } from 'zod';

// Use backticks for string interpolation
const generateSystemMessage = (parsed_resume: string, parsed_jd: string) => `
Compare the following resume info to the job description info.

Resume:
${parsed_resume}

Job Description:
${parsed_jd}

List skills or experiences that MATCH and those that are MISSING (present in Job Description but not in Resume).
Respond as JSON: {"matched_skills": [], "missing_skills": [], "match_score": 0.0}
`;

export const matchResumeToJd = {
  name: 'matchResumeToJd',
  schema: {
    resume: z.string(),
    jd: z.string(),
  },
  handler: async ({ resume, jd }: { resume: string, jd: string }): Promise<CallToolResult> => {
    const {deployment,client} = createAzureOpenAIClient();

    const systemContent = generateSystemMessage(resume, jd);

    const chatResponse = await client.chat.completions.create({
      model: deployment,
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: 'Compare now.' },
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
