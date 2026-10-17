import { apiFetch } from './client';

export interface AiClassificationResponse {
  tags: string[];
  category: string;
  confidence: number;
  engine: 'gemini-api' | 'local-nlp';
}

export const aiApi = {
  suggestTags: async (title: string, content: string) => {
    return apiFetch<AiClassificationResponse>('/ai/suggest-tags', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    });
  },
};
