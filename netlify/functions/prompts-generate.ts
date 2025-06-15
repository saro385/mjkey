import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Provider, X-API-Key, X-Model'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Provider, X-API-Key, X-Model'
      },
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { keywords, type, count } = body;
    const provider = event.headers['x-provider'];
    
    console.log('Prompt request received:', { keywordsCount: keywords?.length, type, count, provider });
    
    if (!keywords || !type || !count || !provider || !['gemini', 'openrouter'].includes(provider)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'Invalid request parameters' })
      };
    }

    // Take only the number of keywords we need for prompts
    const selectedKeywords = keywords.slice(0, count);
    
    // Create a single comprehensive prompt
    const promptType = type === 'photography' ? 'photography' : 'vector art';
    const comprehensivePrompt = `Generate exactly ${selectedKeywords.length} unique, detailed ${promptType} prompts. Use these keywords in order: ${selectedKeywords.join(', ')}.

Requirements for each prompt:
- Use the keywords in the exact order provided: ${selectedKeywords.map((k, i) => `${i + 1}. ${k}`).join(', ')}
- Each prompt should be completely unique and different from the others
- ${type === 'photography' ? 'Include specific technical or artistic photography details (lighting, composition, camera settings, etc.)' : 'Include style, composition, or design details suitable for vector illustration'}
- Each prompt should end with a period
- Each prompt should be one complete sentence
- Focus on ${type === 'photography' ? 'professional photography techniques' : 'clean, scalable design elements'}

Format: Return exactly ${selectedKeywords.length} prompts, one per line, using each keyword once in the order provided. No numbering, bullets, or extra formatting.

Example format:
[Prompt using ${selectedKeywords[0]}].
${selectedKeywords[1] ? `[Prompt using ${selectedKeywords[1]}].` : ''}
${selectedKeywords[2] ? `[Prompt using ${selectedKeywords[2]}].` : ''}`;

    let response: Response;
    let generatedText: string;

    if (provider === "gemini") {
      const geminiApiKey = event.headers['x-api-key'];
      if (!geminiApiKey) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ message: 'Gemini API key required' })
        };
      }

      console.log('Making Gemini API request for prompts...');

      try {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: comprehensivePrompt }]
              }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2000,
                topP: 0.8,
                topK: 40
              }
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Gemini API Error:', response.status, errorText);
          throw new Error(`Gemini API error: ${response.status} - Please check your API key and try again`);
        }

        const data = await response.json();
        generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!generatedText) {
          throw new Error("No content generated from Gemini API");
        }
      } catch (fetchError) {
        console.error('Gemini fetch error:', fetchError);
        throw new Error(`Failed to connect to Gemini API: ${fetchError.message}`);
      }

    } else if (provider === "openrouter") {
      const authorization = event.headers.authorization;
      if (!authorization || !authorization.startsWith('Bearer ')) {
        return {
          statusCode: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ message: 'OpenRouter API key required' })
        };
      }

      const apiKey = authorization.replace('Bearer ', '');
      const model = event.headers['x-model'];
      
      if (!model) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ message: 'OpenRouter model selection required' })
        };
      }

      console.log('Making OpenRouter API request for prompts with model:', model);

      try {
        response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://heartfelt-tarsier-8400ca.netlify.app",
            "X-Title": "Prompt Generator"
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: "system",
                content: "You are a creative prompt generator. Generate unique, detailed prompts exactly as requested, using each keyword once in the specified order."
              },
              {
                role: "user",
                content: comprehensivePrompt
              }
            ],
            temperature: 0.7,
            max_tokens: 2000,
            top_p: 0.8
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('OpenRouter API Error:', response.status, errorText);
          throw new Error(`OpenRouter API error: ${response.status} - Please check your API key and model selection`);
        }

        const data = await response.json();
        generatedText = data.choices?.[0]?.message?.content;
        
        if (!generatedText) {
          throw new Error("No content generated from OpenRouter API");
        }
      } catch (fetchError) {
        console.error('OpenRouter fetch error:', fetchError);
        throw new Error(`Failed to connect to OpenRouter API: ${fetchError.message}`);
      }
    }

    // Parse the generated text into individual prompts
    const prompts = generatedText!
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0 && line.includes('.'))
      .slice(0, selectedKeywords.length);

    // Ensure we have the right number of prompts
    if (prompts.length < selectedKeywords.length) {
      // If we don't have enough prompts, create simple fallback prompts
      for (let i = prompts.length; i < selectedKeywords.length; i++) {
        const keyword = selectedKeywords[i];
        const fallbackPrompt = type === 'photography' 
          ? `A professional photograph featuring ${keyword} with dramatic lighting and artistic composition.`
          : `A clean vector illustration of ${keyword} with modern design elements and vibrant colors.`;
        prompts.push(fallbackPrompt);
      }
    }

    console.log('Generated prompts:', prompts.length);

    const result = { prompts: prompts.slice(0, selectedKeywords.length) };
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Provider, X-API-Key, X-Model'
      },
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error("Prompt generation error:", error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        message: error instanceof Error ? error.message : "Failed to generate prompts" 
      })
    };
  }
};