import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import axios from 'axios';

export const getFirecrawlWebsiteDetails = {
  name: 'getFirecrawlWebsiteDetails',
  schema: {
    url: z.string().url(),
  },
  handler: async ({ url }: { url: string }): Promise<CallToolResult> => {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      return {
        content: [
          {
            type: 'text',
            text: 'Firecrawl API key is not configured.',
          },
        ],
      };
    }
    try {
      const response = await axios.post(
        'https://api.firecrawl.dev/v1/scrape',
        { url },
        {
          headers: {
            'x-api-key': apiKey,
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
            text: `Could not fetch website details. ${error.message}`,
          },
        ],
      };
    }
  },
}; 