import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import axios from 'axios';

export const getWeather = {
  name: 'getWeather',
  schema: {
    city: z.string(),
  },
  handler: async ({ city }: { city: string }): Promise<CallToolResult> => {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return {
        content: [
          {
            type: 'text',
            text: 'Weather API key is not configured.',
          },
        ],
      };
    }
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather`,
        {
          params: {
            q: city,
            appid: apiKey,
            units: 'metric',
          },
        }
      );
      const data = response.data;
      const weather = `The weather in ${city} is ${data.weather[0].description}, ${data.main.temp}°C.`;
      return {
        content: [
          {
            type: 'text',
            text: weather,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Could not fetch weather for ${city}. ${(error.response && error.response.data && error.response.data.message) ? error.response.data.message : error.message}`,
          },
        ],
      };
    }
  },
}; 