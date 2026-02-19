
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
  },
  google: {
    url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    key: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  }
};

export async function callAI(
  messages: Message[], 
  model: string = "google/gemini-2.0-flash-001",
  fallbackModel: string = "openai/gpt-4o-mini",
  preferredProvider?: keyof typeof PROVIDERS
) {
  // If a provider is explicitly chosen, try it first
  if (preferredProvider && PROVIDERS[preferredProvider].key) {
    try {
      // For specific providers, we might need to map the model
      let targetModel = model;
      if (preferredProvider === "google" && !model.includes("gemini")) targetModel = "gemini-1.5-flash";
      if (preferredProvider === "groq") targetModel = "llama-3.3-70b-versatile";
      
      return await executeCall(messages, targetModel, preferredProvider);
    } catch (e) {
      console.warn(`[AI] Preferred provider ${preferredProvider} failed, falling back to default logic:`, e);
    }
  }

  // --- FALLBACK LOGIC ---
  
  // 1. OpenRouter (Primary)
  if (PROVIDERS.openrouter.key) {
    try {
      return await executeCall(messages, model, "openrouter");
    } catch (e) {
      console.warn(`[AI] OpenRouter Primary (${model}) failed:`, e);
    }

    // 2. OpenRouter (Fallback)
    try {
      return await executeCall(messages, fallbackModel, "openrouter");
    } catch (e) {
      console.warn(`[AI] OpenRouter Fallback (${fallbackModel}) failed:`, e);
    }
  }

  // 3. Google Gemini (Direct)
  if (PROVIDERS.google.key) {
    try {
      return await executeCall(messages, "gemini-1.5-flash", "google");
    } catch (e) {
      console.warn(`[AI] Google Gemini Direct failed:`, e);
    }
  }

  // 4. Groq (Final Fallback)
  if (PROVIDERS.groq.key) {
    try {
      return await executeCall(messages, "llama-3.3-70b-versatile", "groq");
    } catch (e) {
      console.error("[AI] Groq Final Error:", e);
    }
  }

  throw new Error("All AI providers and fallbacks failed. Please check your API keys.");
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
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to call ${providerKey} API (Status: ${response.status})`);
  }

  const data = await response.json();
  if (!data.choices?.[0]?.message?.content) {
    throw new Error(`Invalid response format from ${providerKey}`);
  }

  return data.choices[0].message.content;
}
