import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { PromptGenerationRequest, PromptGenerationResponse, ApiConfig } from "@shared/schema";

interface UsePromptGeneratorOptions {
  apiConfig: ApiConfig;
}

export function usePromptGenerator({ apiConfig }: UsePromptGeneratorOptions) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Ready to generate");
  const [prompts, setPrompts] = useState<string[]>([]);

  const mutation = useMutation({
    mutationFn: async (data: PromptGenerationRequest) => {
      setProgress(0);
      setPrompts([]);
      setStatus("Generating prompts...");
      
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Provider": apiConfig.selectedProvider,
      };

      if (apiConfig.selectedProvider === "gemini" && apiConfig.geminiApiKey) {
        headers["X-API-Key"] = apiConfig.geminiApiKey;
      } else if (apiConfig.selectedProvider === "openrouter") {
        if (apiConfig.openRouterApiKey) {
          headers["Authorization"] = `Bearer ${apiConfig.openRouterApiKey}`;
        }
        if (apiConfig.openRouterModel) {
          headers["X-Model"] = apiConfig.openRouterModel;
        }
      }
      
      const apiUrl = import.meta.env.PROD ? "/.netlify/functions/prompts-generate" : "/api/prompts/generate";
      const response = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
        credentials: "include"
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `${response.status}: Request failed`);
      }
      
      const result: PromptGenerationResponse = await response.json();
      
      // Simulate progress updates
      for (let i = 1; i <= result.prompts.length; i++) {
        setProgress(i);
        setPrompts(result.prompts.slice(0, i));
        if (i < result.prompts.length) {
          await new Promise(resolve => setTimeout(resolve, 150));
        }
      }
      
      setStatus(`Generated ${result.prompts.length} prompts`);
      return result;
    }
  });

  return {
    generatePrompts: mutation.mutateAsync,
    isGenerating: mutation.isPending,
    progress,
    status,
    prompts
  };
}
