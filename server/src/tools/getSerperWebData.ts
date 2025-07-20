import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import axios from 'axios';

export const getSerperWebData = {
  name: 'getSerperWebData',
  schema: {
    query: z.string(),
  },
  handler: async ({ query }: { query: string }): Promise<CallToolResult> => {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
      return {
        content: [
          {
            type: 'text',
            text: 'Serper API key is not configured.',
          },
        ],
      };
    }
    try {
      const response = await axios.post(
        'https://google.serper.dev/search',
        { q: query },
        {
          headers: {
            'X-API-KEY': apiKey,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = response.data;
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Could not fetch web data. ${error.message}`,
          },
        ],
      };
    }
  },
}; 