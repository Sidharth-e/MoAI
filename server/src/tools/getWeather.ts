import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

export const getWeather = {
  name: 'getWeather',
  schema: {
    city: z.string(),
  },
  handler: async ({ city }: { city: string }): Promise<CallToolResult> => {
    // Dummy weather data
    const weather = `The weather in ${city} is sunny, 25°C.`;
    return {
      content: [
        {
          type: 'text',
          text: weather,
        },
      ],
    };
  },
}; 