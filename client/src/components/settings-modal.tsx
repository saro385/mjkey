import { useState } from "react";
import { X, Download, Check, Eye, EyeOff, WandSparkles, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useApiConfig } from "@/hooks/use-api-config";
import { useToast } from "@/hooks/use-toast";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false);
  const { toast } = useToast();
  
  const {
    config,
    setConfig,
    models,
    fetchModels,
    isFetchingModels,
    isConfigured
  } = useApiConfig();

  const handleProviderChange = (provider: "gemini" | "openrouter") => {
    setConfig({ selectedProvider: provider });
  };

  const handleGeminiKeyChange = (key: string) => {
    setConfig({ geminiApiKey: key });
  };

  const handleOpenRouterKeyChange = (key: string) => {
    setConfig({ openRouterApiKey: key });
  };

  const handleModelChange = (model: string) => {
    setConfig({ openRouterModel: model });
  };

  const handleFetchModels = async () => {
    if (!config.openRouterApiKey?.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenRouter API key first",
        variant: "destructive"
      });
      return;
    }

    try {
      await fetchModels();
      toast({
        title: "Success",
        description: "Models fetched successfully!"
      });
    } catch (error) {
      toast({
        title: "Fetch Failed",
        description: error instanceof Error ? error.message : "Failed to fetch models",
        variant: "destructive"
      });
    }
  };

  const handleSaveConfig = () => {
    if (!isConfigured) {
      const providerName = config.selectedProvider === "gemini" ? "Gemini" : "OpenRouter";
      toast({
        title: "Configuration Incomplete",
        description: `Please complete ${providerName} configuration`,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "API configuration saved!"
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            API Configuration
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Provider Selection */}
          <div className="space-y-3">
            <Label>Select API Provider</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={config.selectedProvider === "gemini" ? "default" : "outline"}
                onClick={() => handleProviderChange("gemini")}
                className="h-16 flex-col space-y-2"
              >
                <WandSparkles className="w-5 h-5" />
                <span>Gemini</span>
              </Button>
              <Button
                variant={config.selectedProvider === "openrouter" ? "default" : "outline"}
                onClick={() => handleProviderChange("openrouter")}
                className="h-16 flex-col space-y-2"
              >
                <Network className="w-5 h-5" />
                <span>OpenRouter</span>
              </Button>
            </div>
          </div>

          {/* Gemini Configuration */}
          {config.selectedProvider === "gemini" && (
            <div className="space-y-2">
              <Label htmlFor="gemini-key">Gemini API Key</Label>
              <div className="relative">
                <Input
                  id="gemini-key"
                  type={showGeminiKey ? "text" : "password"}
                  placeholder="Enter your Gemini API key..."
                  value={config.geminiApiKey || ""}
                  onChange={(e) => handleGeminiKeyChange(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full w-10 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                >
                  {showGeminiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          {/* OpenRouter Configuration */}
          {config.selectedProvider === "openrouter" && (
            <div className="space-y-4">
              {/* API Key */}
              <div className="space-y-2">
                <Label htmlFor="openrouter-key">OpenRouter API Key</Label>
                <div className="relative">
                  <Input
                    id="openrouter-key"
                    type={showOpenRouterKey ? "text" : "password"}
                    placeholder="Enter your OpenRouter API key..."
                    value={config.openRouterApiKey || ""}
                    onChange={(e) => handleOpenRouterKeyChange(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full w-10 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowOpenRouterKey(!showOpenRouterKey)}
                  >
                    {showOpenRouterKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Fetch Models Button */}
              <Button 
                onClick={handleFetchModels}
                disabled={isFetchingModels}
                className="w-full bg-slate-600 hover:bg-slate-700"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                {isFetchingModels ? "Fetching..." : "Fetch Available Models"}
              </Button>

              {/* Model Selection */}
              <div className="space-y-2">
                <Label>Select Model</Label>
                <Select value={config.openRouterModel || ""} onValueChange={handleModelChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={models.length === 0 ? "No models loaded" : "Select a model..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {models.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No models loaded
                      </SelectItem>
                    ) : (
                      models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Save Configuration Button */}
          <Button 
            onClick={handleSaveConfig}
            disabled={!isConfigured}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <Check className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>

          {/* Status indicator */}
          <div className="text-center">
            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              isConfigured 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-amber-100 text-amber-700'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isConfigured ? 'bg-emerald-500' : 'bg-amber-500'
              }`}></div>
              <span>{isConfigured ? 'API Configured' : 'Configuration Required'}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
