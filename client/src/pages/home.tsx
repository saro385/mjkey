import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KeywordGenerator } from "@/components/keyword-generator";
import { PromptGenerator } from "@/components/prompt-generator";
import { SettingsModal } from "@/components/settings-modal";
import { useApiConfig } from "@/hooks/use-api-config";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"keywords" | "prompts">("keywords");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { config, isConfigured: apiConfigured } = useApiConfig();
  const isConfigured = Boolean(apiConfigured);

  const handleKeywordsGenerated = (generatedKeywords: string[]) => {
    setKeywords(generatedKeywords);
  };

  const handleCopyKeywords = () => {
    setActiveTab("prompts");
  };

  const handleBackToKeywords = () => {
    setActiveTab("keywords");
  };

  const handleReset = () => {
    setKeywords([]);
    setActiveTab("keywords");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.5 5.6L5.1 4.2c-.4-.2-.9-.2-1.3 0-.4.2-.6.5-.6.9v13.8c0 .4.2.7.6.9.2.1.4.1.6.1.2 0 .4 0 .6-.1l2.4-1.4 2.4 1.4c.2.1.4.1.6.1.2 0 .4 0 .6-.1l2.4-1.4 2.4 1.4c.4.2.9.2 1.3 0 .4-.2.6-.5.6-.9V5.1c0-.4-.2-.7-.6-.9-.4-.2-.9-.2-1.3 0L15.5 5.6 13.1 4.2c-.4-.2-.9-.2-1.3 0L9.4 5.6 7.5 5.6z"/>
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-slate-800">Keyword & Prompt Generator</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsOpen(true)}
              className="text-slate-600 hover:text-slate-800"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center space-x-1 bg-white rounded-lg p-1 shadow-sm border border-slate-200 w-fit mx-auto">
          <Button
            variant={activeTab === "keywords" ? "default" : "ghost"}
            onClick={() => setActiveTab("keywords")}
            className="px-6 py-2"
          >
            Keywords Generator
          </Button>
          <Button
            variant={activeTab === "prompts" ? "default" : "ghost"}
            onClick={() => setActiveTab("prompts")}
            className="px-6 py-2"
          >
            Prompts Generator
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 pb-12">
        {activeTab === "keywords" ? (
          <KeywordGenerator
            onKeywordsGenerated={handleKeywordsGenerated}
            onCopyKeywords={handleCopyKeywords}
            keywords={keywords}
            apiConfig={config}
            isConfigured={isConfigured}
          />
        ) : (
          <PromptGenerator
            keywords={keywords}
            onBackToKeywords={handleBackToKeywords}
            onReset={handleReset}
            apiConfig={config}
            isConfigured={isConfigured}
          />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </div>
  );
}