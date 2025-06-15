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
    const { input, count } = body;
    const provider = event.headers['x-provider'];
    
    console.log('Request received:', { input, count, provider });
    
    if (!input || !count || !provider || !['gemini', 'openrouter'].includes(provider)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'Invalid request parameters' })
      };
    }

    const prompt = `Generate exactly ${count} unique, creative keywords related to "${input}".

Requirements:
- Each keyword should be unique and distinct from others
- Directly related to the concept of "${input}"
- Suitable for creative projects
- 1-3 words long
- No duplicates or very similar variations

Return exactly ${count} keywords, one per line, without numbers, bullets, or other formatting.

Example format:
keyword1
keyword2
keyword3`;

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

      console.log('Making Gemini API request...');
      
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
                parts: [{ text: prompt }]
              }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000,
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

      console.log('Making OpenRouter API request with model:', model);

      try {
        response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://heartfelt-tarsier-8400ca.netlify.app",
            "X-Title": "Keyword Generator"
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: "system",
                content: "You are a creative keyword generator. Generate unique, distinct keywords exactly as requested."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 1000,
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

    const keywords = generatedText!
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)
      .slice(0, count);

    console.log('Generated keywords:', keywords.length);

    const result = { keywords };
    
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
    console.error("Keyword generation error:", error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        message: error instanceof Error ? error.message : "Failed to generate keywords" 
      })
    };
  }
};