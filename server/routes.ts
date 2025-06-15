import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import {
  keywordGenerationSchema,
  promptGenerationSchema,
  openRouterModelsSchema,
  type KeywordGenerationResponse,
  type PromptGenerationResponse,
  type OpenRouterModelsResponse,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Unified keyword generation endpoint
  app.post("/api/keywords/generate", async (req, res) => {
    try {
      const { input, count } = keywordGenerationSchema.parse(req.body);
      const { authorization } = req.headers;
      const provider = req.headers['x-provider'] as string;
      
      if (!provider || !['gemini', 'openrouter'].includes(provider)) {
        return res.status(400).json({ 
          message: "API provider must be specified. Please configure in settings." 
        });
      }

      const prompt = `Generate exactly ${count} unique, creative keywords related to "${input}". 
      Each keyword should be:
      - Unique and distinct from others
      - Directly related to the concept of "${input}"
      - Suitable for creative projects
      - 1-3 words long
      
      Return only the keywords, one per line, without numbers, bullets, or other formatting.`;

      let response: Response;
      let generatedText: string;

      if (provider === "gemini") {
        const geminiApiKey = req.headers['x-api-key'] as string;
        if (!geminiApiKey) {
          return res.status(400).json({ 
            message: "Gemini API key required. Please configure in settings." 
          });
        }

        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: prompt }]
              }]
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Gemini API error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!generatedText) {
          throw new Error("No content generated from Gemini API");
        }

      } else if (provider === "openrouter") {
        if (!authorization || !authorization.startsWith('Bearer ')) {
          return res.status(401).json({ 
            message: "OpenRouter API key required. Please configure in settings." 
          });
        }

        const apiKey = authorization.replace('Bearer ', '');
        const model = req.headers['x-model'] as string;
        
        if (!model) {
          return res.status(400).json({ 
            message: "OpenRouter model selection required. Please select a model in settings." 
          });
        }

        response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "X-Title": "Keyword Generator"
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 1000
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        generatedText = data.choices?.[0]?.message?.content;
        
        if (!generatedText) {
          throw new Error("No content generated from OpenRouter API");
        }
      }

      const keywords = generatedText!
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0)
        .slice(0, count);

      const result: KeywordGenerationResponse = { keywords };
      res.json(result);
    } catch (error) {
      console.error("Keyword generation error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate keywords" 
      });
    }
  });

  // Prompt generation using selected API - ONE PROMPT PER KEYWORD
  app.post("/api/prompts/generate", async (req, res) => {
    try {
      const { keywords, type, count } = promptGenerationSchema.parse(req.body);
      const { authorization } = req.headers;
      const provider = req.headers['x-provider'] as string;
      
      if (!provider || !['gemini', 'openrouter'].includes(provider)) {
        return res.status(400).json({ 
          message: "API provider must be specified. Please configure in settings." 
        });
      }

      // Take only the number of keywords we need for prompts
      const selectedKeywords = keywords.slice(0, count);
      
      const promptTemplates = {
        photography: (keyword: string) => `Create 1 unique, detailed photography prompt using the keyword "${keyword}".

        The prompt should:
        - Be suitable for professional photography
        - Include specific technical or artistic details
        - End with a period
        - Be one complete sentence
        - Focus on composition, lighting, or subject matter
        - Use "${keyword}" as the main subject or theme
        
        Return only the single prompt, no numbering or bullets.`,
        
        vector: (keyword: string) => `Create 1 unique, detailed vector art prompt using the keyword "${keyword}".

        The prompt should:
        - Be suitable for vector illustration or graphic design
        - Include style, composition, or design details
        - End with a period
        - Be one complete sentence
        - Focus on clean, scalable design elements
        - Use "${keyword}" as the main subject or theme
        
        Return only the single prompt, no numbering or bullets.`
      };

      const allPrompts: string[] = [];

      // Generate one prompt for each keyword individually
      for (let i = 0; i < selectedKeywords.length; i++) {
        const keyword = selectedKeywords[i];
        const promptTemplate = promptTemplates[type](keyword);

        let response: Response;
        let generatedText: string;

        if (provider === "gemini") {
          const geminiApiKey = req.headers['x-api-key'] as string;
          if (!geminiApiKey) {
            return res.status(400).json({ 
              message: "Gemini API key required. Please configure in settings." 
            });
          }

          response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                contents: [{
                  parts: [{ text: promptTemplate }]
                }]
              }),
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API error: ${response.status} ${errorText}`);
          }

          const data = await response.json();
          generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (!generatedText) {
            throw new Error("No content generated from Gemini API");
          }

        } else if (provider === "openrouter") {
          if (!authorization || !authorization.startsWith('Bearer ')) {
            return res.status(401).json({ 
              message: "OpenRouter API key required. Please configure in settings." 
            });
          }

          const apiKey = authorization.replace('Bearer ', '');
          const model = req.headers['x-model'] as string;
          
          if (!model) {
            return res.status(400).json({ 
              message: "OpenRouter model selection required. Please select a model in settings." 
            });
          }

          response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "X-Title": "Prompt Generator"
            },
            body: JSON.stringify({
              model: model,
              messages: [
                {
                  role: "user",
                  content: promptTemplate
                }
              ],
              temperature: 0.7,
              max_tokens: 150
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
          }

          const data = await response.json();
          generatedText = data.choices?.[0]?.message?.content;
          
          if (!generatedText) {
            throw new Error("No content generated from OpenRouter API");
          }
        }

        // Clean and extract the single prompt
        const cleanPrompt = generatedText!
          .split('\n')
          .map((line: string) => line.trim())
          .filter((line: string) => line.length > 0)
          .find((line: string) => line.includes('.')) || generatedText!.trim();

        allPrompts.push(cleanPrompt);

        // Add a small delay between API calls to avoid rate limiting
        if (i < selectedKeywords.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      const result: PromptGenerationResponse = { prompts: allPrompts };
      res.json(result);
    } catch (error) {
      console.error("Prompt generation error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate prompts" 
      });
    }
  });

  // Fetch OpenRouter models
  app.post("/api/openrouter/models", async (req, res) => {
    try {
      const { apiKey } = openRouterModelsSchema.parse(req.body);
      
      const response = await fetch("https://openrouter.ai/api/v1/models", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const models = data.data?.map((model: any) => ({
        id: model.id,
        name: model.name || model.id,
        description: model.description
      })) || [];

      const result: OpenRouterModelsResponse = { models };
      res.json(result);
    } catch (error) {
      console.error("OpenRouter models fetch error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch OpenRouter models" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}