import { createOpenAI } from '@ai-sdk/openai';

export const aicredits = createOpenAI({
  baseURL: 'https://api.aicredits.in/v1',
  apiKey: process.env.AICREDITS_API_KEY!,
});
