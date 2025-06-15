import { useState } from "react";
import { Camera, Square, ArrowLeft, WandSparkles, Network, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressCard } from "@/components/progress-card";
import { usePromptGenerator } from "@/hooks/use-prompt-generator";
import { useToast } from "@/hooks/use-toast";
import type { ApiConfig } from "@shared/schema";

interface PromptGeneratorProps {
  keywords: string[];
  onBackToKeywords: () => void;
  onReset: () => void;
  apiConfig: ApiConfig;
  isConfigured: boolean;
}

export function PromptGenerator({ 
  keywords, 
  onBackToKeywords, 
  onReset,
  apiConfig,
  isConfigured
}: PromptGeneratorProps) {
  const [promptType, setPromptType] = useState<"photography" | "vector">("photography");
  const [count, setCount] = useState(keywords.length || 50);
  const [keywordsList, setKeywordsList] = useState(keywords.join('\n'));
  const { toast } = useToast();
  
  const {
    generatePrompts,
    isGenerating,
    progress,
    status,
    prompts
  } = usePromptGenerator({ apiConfig });

  const handleGeneratePrompts = async () => {
    const keywordsArray = keywordsList
      .split('\n')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    if (keywordsArray.length === 0) {
      toast({
        title: "Keywords Required",
        description: "Please enter keywords",
        variant: "destructive"
      });
      return;
    }

    if (!isConfigured) {
      toast({
        title: "Configuration Required",
        description: "Please configure your API settings first",
        variant: "destructive"
      });
      return;
    }

    try {
      await generatePrompts({
        keywords: keywordsArray,
        type: promptType,
        count
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate prompts",
        variant: "destructive"
      });
    }
  };

  const handleCopyPrompts = async () => {
    if (prompts.length === 0) return;
    
    try {
      await navigator.clipboard.writeText(prompts.join('\n'));
      toast({
        title: "Copied!",
        description: "Prompts copied to clipboard"
      });
      
      // Reset and go back to keywords
      onReset();
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy prompts to clipboard",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Input Section */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Prompt Generator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Prompt Type Selection */}
            <div className="space-y-3">
              <Label>Prompt Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={promptType === "photography" ? "default" : "outline"}
                  onClick={() => setPromptType("photography")}
                  className="h-16 flex-col space-y-2"
                  disabled={isGenerating}
                >
                  <Camera className="w-5 h-5" />
                  <span>Photography</span>
                </Button>
                <Button
                  variant={promptType === "vector" ? "default" : "outline"}
                  onClick={() => setPromptType("vector")}
                  className="h-16 flex-col space-y-2"
                  disabled={isGenerating}
                >
                  <Square className="w-5 h-5" />
                  <span>Vector Art</span>
                </Button>
              </div>
            </div>

            {/* Prompt Count Input */}
            <div className="space-y-2">
              <Label htmlFor="prompt-count">Number of Prompts</Label>
              <Input
                id="prompt-count"
                type="number"
                min="1"
                max="200"
                value={count}
                onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={isGenerating}
              />
            </div>

            {/* Keywords Input */}
            <div className="space-y-2">
              <Label htmlFor="keywords-list">Keywords (one per line)</Label>
              <Textarea
                id="keywords-list"
                rows={8}
                placeholder="Enter keywords, one per line..."
                value={keywordsList}
                onChange={(e) => setKeywordsList(e.target.value)}
                disabled={isGenerating}
                className="resize-none"
              />
            </div>

            {/* Generate Button */}
            <div className="space-y-3">
              {!isConfigured && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-amber-700">
                    Please configure your API settings first
                  </span>
                </div>
              )}
              
              <Button 
                onClick={handleGeneratePrompts}
                disabled={isGenerating || !isConfigured}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {apiConfig.selectedProvider === "gemini" ? (
                  <WandSparkles className="w-4 h-4 mr-2" />
                ) : (
                  <Network className="w-4 h-4 mr-2" />
                )}
                {isGenerating ? "Generating..." : 
                 `Generate with ${apiConfig.selectedProvider === "gemini" ? "Gemini" : "OpenRouter"}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress & Results Section */}
      <ProgressCard
        title="Prompts generated"
        current={progress}
        total={count}
        status={status}
        nextStepTitle="Final Step"
        nextStepDescription="Copy generated prompts to clipboard."
        nextStepButton={
          <Button 
            onClick={handleCopyPrompts}
            disabled={prompts.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            size="lg"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
            </svg>
            Copy Prompts
          </Button>
        }
        backButton={
          <Button 
            onClick={onBackToKeywords}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Keywords
          </Button>
        }
      />

      {/* Generated Prompts Display */}
      <div className="lg:col-span-3 mt-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Prompts</CardTitle>
              <span className="text-sm text-slate-500">{prompts.length} prompts</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-50 rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
              {prompts.length === 0 ? (
                <div className="text-slate-500 text-center py-8">
                  <svg className="w-8 h-8 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                  </svg>
                  <p>Generated prompts will appear here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {prompts.map((prompt, index) => (
                    <div 
                      key={index}
                      className="px-3 py-2 bg-white rounded-md border border-slate-200 text-sm"
                    >
                      {prompt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}