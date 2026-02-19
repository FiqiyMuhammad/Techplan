
export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

const PROVIDERS = {
  openrouter: {
    url: "https://openrouter.ai/api/v1/chat/completions",
    key: process.env.OPENROUTER_API_KEY,
  },
  groq: {
    url: "https://api.groq.com/openai/v1/chat/completions",
    key: process.env.GROQ_API_KEY,
  }
};

export async function callAI(
  messages: Message[], 
  model: string = "google/gemini-2.0-flash-001",
  fallbackModel: string = "openai/gpt-4o-mini"
) {
  // First attempt with primary model
  try {
    return await executeCall(messages, model, "openrouter");
  } catch {
    console.warn(`Primary model (${model}) failed, trying fallback (${fallbackModel})...`);
    
    // Attempt with fallback model on OpenRouter
    try {
      return await executeCall(messages, fallbackModel, "openrouter");
    } catch (openrouterFallbackError) {
      console.warn(`OpenRouter fallback (${fallbackModel}) failed, checking Groq...`);
      
      // Final attempt with Groq if key exists
      if (PROVIDERS.groq.key) {
        try {
          return await executeCall(messages, "llama-3.3-70b-versatile", "groq");
        } catch (groqError) {
          console.error("Groq AI Error:", groqError);
          throw new Error("All AI models (Primary, Secondary, and Groq) failed.");
        }
      }
      
      throw new Error(`AI Request failed: ${openrouterFallbackError instanceof Error ? openrouterFallbackError.message : "Reason unknown"}`);
    }
  }
}

async function executeCall(messages: Message[], model: string, providerKey: keyof typeof PROVIDERS) {
  const provider = PROVIDERS[providerKey];
  
  if (!provider.key) {
    throw new Error(`API key for ${providerKey} is not defined in .env`);
  }

  const response = await fetch(provider.url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${provider.key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "Tedu AI",
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `Failed to call ${providerKey} API`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
