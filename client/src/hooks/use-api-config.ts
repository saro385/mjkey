import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { ApiConfig, OpenRouterModelsResponse, OpenRouterModel } from "@shared/schema";

export function useApiConfig() {
  const [config, setConfigState] = useState<ApiConfig>({
    selectedProvider: "gemini",
    geminiApiKey: "",
    openRouterApiKey: "",
    openRouterModel: "",
  });
  const [models, setModels] = useState<OpenRouterModel[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem("api-config");
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfigState(parsed);
      } catch (error) {
        console.error("Failed to parse saved API config:", error);
      }
    }
  }, []);

  // Save to localStorage whenever config changes
  const setConfig = (newConfig: Partial<ApiConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfigState(updatedConfig);
    localStorage.setItem("api-config", JSON.stringify(updatedConfig));
  };

  const fetchModelsMutation = useMutation({
    mutationFn: async () => {
      if (!config.openRouterApiKey) {
        throw new Error("OpenRouter API key required");
      }
      
      const apiUrl = import.meta.env.PROD ? "/.netlify/functions/openrouter-models" : "/api/openrouter/models";
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: config.openRouterApiKey })
      });
      const result: OpenRouterModelsResponse = await response.json();
      setModels(result.models);
      return result;
    }
  });

  const isConfigured = () => {
    if (config.selectedProvider === "gemini") {
      return config.geminiApiKey && config.geminiApiKey.length > 0;
    } else if (config.selectedProvider === "openrouter") {
      return config.openRouterApiKey && 
             config.openRouterApiKey.length > 0 && 
             config.openRouterModel && 
             config.openRouterModel.length > 0;
    }
    return false;
  };

  return {
    config,
    setConfig,
    models,
    fetchModels: fetchModelsMutation.mutateAsync,
    isFetchingModels: fetchModelsMutation.isPending,
    isConfigured: isConfigured(),
  };
}