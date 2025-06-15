import { z } from "zod";

export const keywordGenerationSchema = z.object({
  input: z.string().min(1, "Word or category is required"),
  count: z.number().min(1).max(200),
});

export const apiConfigSchema = z.object({
  selectedProvider: z.enum(["gemini", "openrouter"]),
  geminiApiKey: z.string().optional(),
  openRouterApiKey: z.string().optional(),
  openRouterModel: z.string().optional(),
});

export const promptGenerationSchema = z.object({
  keywords: z.array(z.string()).min(1, "At least one keyword is required"),
  type: z.enum(["photography", "vector"]),
  count: z.number().min(1).max(200),
});

export const openRouterModelsSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
});

export const openRouterConfigSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  model: z.string().min(1, "Model selection is required"),
});

export type KeywordGenerationRequest = z.infer<typeof keywordGenerationSchema>;
export type PromptGenerationRequest = z.infer<typeof promptGenerationSchema>;
export type OpenRouterModelsRequest = z.infer<typeof openRouterModelsSchema>;
export type OpenRouterConfig = z.infer<typeof openRouterConfigSchema>;
export type ApiConfig = z.infer<typeof apiConfigSchema>;

export interface KeywordGenerationResponse {
  keywords: string[];
}

export interface PromptGenerationResponse {
  prompts: string[];
}

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
}

export interface OpenRouterModelsResponse {
  models: OpenRouterModel[];
}
