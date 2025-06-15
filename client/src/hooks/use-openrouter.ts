import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { OpenRouterModelsRequest, OpenRouterModelsResponse, OpenRouterModel } from "@shared/schema";

export function useOpenRouter() {
  const [apiKey, setApiKeyState] = useState("");
  const [selectedModel, setSelectedModelState] = useState("");
  const [models, setModels] = useState<OpenRouterModel[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem("openrouter-api-key");
    const savedModel = localStorage.getItem("openrouter-model");
    
    if (savedApiKey) setApiKeyState(savedApiKey);
    if (savedModel) setSelectedModelState(savedModel);
  }, []);

  // Save API key to localStorage
  const setApiKey = (key: string) => {
    setApiKeyState(key);
    if (key) {
      localStorage.setItem("openrouter-api-key", key);
    } else {
      localStorage.removeItem("openrouter-api-key");
    }
  };

  // Save selected model to localStorage
  const setSelectedModel = (model: string) => {
    setSelectedModelState(model);
    if (model) {
      localStorage.setItem("openrouter-model", model);
    } else {
      localStorage.removeItem("openrouter-model");
    }
  };

  const fetchModelsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/openrouter/models", { apiKey });
      const result: OpenRouterModelsResponse = await response.json();
      setModels(result.models);
      return result;
    }
  });

  const confirmModel = () => {
    // Model is already saved to localStorage via setSelectedModel
    // This is just for UI feedback
  };

  return {
    apiKey,
    setApiKey,
    selectedModel,
    setSelectedModel,
    models,
    fetchModels: fetchModelsMutation.mutateAsync,
    isFetchingModels: fetchModelsMutation.isPending,
    confirmModel
  };
}
