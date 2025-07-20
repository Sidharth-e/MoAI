import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import axios from 'axios';
import FirecrawlApp, { ScrapeResponse } from '@mendable/firecrawl-js';

export const getFirecrawlWebsiteDetails = {
  name: 'getFirecrawlWebsiteDetails',
  schema: {
    url: z.string().url().optional(),
    urls: z.array(z.string().url()).optional(),
    prompt: z.string().optional(),
    schema: z.object({}).passthrough().optional(),
  },
  handler: async (params: {
    url?: string;
    urls?: string[];
    prompt?: string;
    schema?: object;
  }): Promise<CallToolResult> => {
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
    const { url, urls, prompt, schema } = params;
    try {
      // If prompt and schema are provided, use /extract endpoint
      if ((prompt && schema) && (urls || url)) {
        const urlList = urls || (url ? [url] : []);
        const response = await axios.post(
          'https://api.firecrawl.dev/v1/extract',
          { urls: urlList, prompt, schema },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
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
      } else if (url) {
        // Use Firecrawl SDK for scraping markdown/html
        const app = new FirecrawlApp({ apiKey });
        const scrapeResult = await app.scrapeUrl(url, { formats: ['markdown', 'html'] }) as ScrapeResponse;
        if (!scrapeResult.success) {
          return {
            content: [
              {
                type: 'text',
                text: `Failed to scrape: ${scrapeResult.error}`,
              },
            ],
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(scrapeResult, null, 2),
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: 'text',
              text: 'You must provide either a url or urls.',
            },
          ],
        };
      }
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Could not fetch website details. ${error?.response?.data?.message || error.message}`,
          },
        ],
      };
    }
  },
}; 