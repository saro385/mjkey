import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { KeywordGenerationRequest, KeywordGenerationResponse, ApiConfig } from "@shared/schema";

interface UseKeywordGeneratorOptions {
  onProgress?: (keywords: string[]) => void;
  apiConfig: ApiConfig;
}

export function useKeywordGenerator({ onProgress, apiConfig }: UseKeywordGeneratorOptions) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Ready to generate");

  const mutation = useMutation({
    mutationFn: async (data: KeywordGenerationRequest) => {
      setProgress(0);
      setStatus("Generating keywords...");
      
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
      
      const apiUrl = import.meta.env.PROD ? "/.netlify/functions/keywords-generate" : "/api/keywords/generate";
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
      
      const result: KeywordGenerationResponse = await response.json();
      
      // Simulate progress updates
      for (let i = 1; i <= result.keywords.length; i++) {
        setProgress(i);
        onProgress?.(result.keywords.slice(0, i));
        if (i < result.keywords.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      setStatus(`Generated ${result.keywords.length} keywords`);
      return result;
    }
  });

  return {
    generateKeywords: mutation.mutateAsync,
    isGenerating: mutation.isPending,
    progress,
    status
  };
}
