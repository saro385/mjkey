import { useState } from "react";
import { WandSparkles, Network, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressCard } from "@/components/progress-card";
import { useKeywordGenerator } from "@/hooks/use-keyword-generator";
import { useToast } from "@/hooks/use-toast";
import type { ApiConfig } from "@shared/schema";

interface KeywordGeneratorProps {
  onKeywordsGenerated: (keywords: string[]) => void;
  onCopyKeywords: () => void;
  keywords: string[];
  apiConfig: ApiConfig;
  isConfigured: boolean;
}

export function KeywordGenerator({ 
  onKeywordsGenerated, 
  onCopyKeywords, 
  keywords,
  apiConfig,
  isConfigured
}: KeywordGeneratorProps) {
  const [input, setInput] = useState("");
  const [count, setCount] = useState(50);
  const { toast } = useToast();
  
  const {
    generateKeywords,
    isGenerating,
    progress,
    status
  } = useKeywordGenerator({
    onProgress: (generatedKeywords) => {
      onKeywordsGenerated(generatedKeywords);
    },
    apiConfig
  });

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a word or category",
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
      await generateKeywords({ input: input.trim(), count });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate keywords",
        variant: "destructive"
      });
    }
  };

  const handleCopyKeywords = async () => {
    if (keywords.length === 0) return;
    
    try {
      await navigator.clipboard.writeText(keywords.join('\n'));
      toast({
        title: "Copied!",
        description: "Keywords copied to clipboard"
      });
      onCopyKeywords();
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy keywords to clipboard",
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
            <CardTitle className="text-2xl">Keyword Generator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Word/Category Input */}
            <div className="space-y-2">
              <Label htmlFor="keyword-input">Word or Category</Label>
              <Input
                id="keyword-input"
                placeholder="e.g., nature, technology, abstract"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            {/* Keyword Count Input */}
            <div className="space-y-2">
              <Label htmlFor="keyword-count">Number of Keywords</Label>
              <Input
                id="keyword-count"
                type="number"
                min="1"
                max="200"
                value={count}
                onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={isGenerating}
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
                onClick={handleGenerate}
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
        title="Keywords generated"
        current={progress}
        total={count}
        status={status}
        nextStepTitle="Next Step"
        nextStepDescription="Copy keywords to use in prompt generation or continue with more keywords."
        nextStepButton={
          <Button 
            onClick={handleCopyKeywords}
            disabled={keywords.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            size="lg"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
            </svg>
            Copy Keywords
          </Button>
        }
      />

      {/* Generated Keywords Display */}
      <div className="lg:col-span-3 mt-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Keywords</CardTitle>
              <span className="text-sm text-slate-500">{keywords.length} keywords</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-50 rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
              {keywords.length === 0 ? (
                <div className="text-slate-500 text-center py-8">
                  <svg className="w-8 h-8 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  <p>Generated keywords will appear here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {keywords.map((keyword, index) => (
                    <div 
                      key={index}
                      className="px-3 py-2 bg-white rounded-md border border-slate-200 text-sm"
                    >
                      {keyword}
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