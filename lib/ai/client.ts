
export interface Message {
  role: "user" | "assistant" | "system";
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

const getProviders = () => ({
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
});

export async function callAI(
  messages: Message[], 
  model: string = "gemini-3.6-flash",
  fallbackModel: string = "openai/gpt-4o-mini",
  preferredProvider?: "openrouter" | "groq" | "google"
) {
  const providers = getProviders();

  // If a provider is explicitly chosen, try it first
  if (preferredProvider && providers[preferredProvider].key) {
    try {
      let targetModel = model;
      if (preferredProvider === "google") {
        targetModel = "gemini-3.6-flash";
      }
      if (preferredProvider === "groq") {
        targetModel = "llama-3.3-70b-versatile";
      }
      if (preferredProvider === "openrouter" && !model.includes("/")) {
        targetModel = fallbackModel;
      }
      
      return await executeCall(messages, targetModel, preferredProvider);
    } catch (e) {
      console.warn(`[AI] Preferred provider ${preferredProvider} failed, falling back to default logic:`, e);
    }
  }

  // --- FALLBACK LOGIC ---
  
  // 1. Google Gemini (Primary Direct)
  if (providers.google.key) {
    try {
      return await executeCall(messages, "gemini-3.6-flash", "google");
    } catch (e) {
      console.warn(`[AI] Google Gemini (gemini-3.6-flash) failed:`, e);
    }

    try {
      return await executeCall(messages, "gemini-3.7-flash", "google");
    } catch (e) {
      console.warn(`[AI] Google Gemini (gemini-3.7-flash) fallback failed:`, e);
    }
  }

  // 2. OpenRouter (Secondary)
  if (providers.openrouter.key) {
    try {
      return await executeCall(messages, fallbackModel, "openrouter");
    } catch (e) {
      console.warn(`[AI] OpenRouter Fallback (${fallbackModel}) failed:`, e);
    }
  }

  // 3. Groq (Final Fallback)
  if (providers.groq.key) {
    try {
      return await executeCall(messages, "llama-3.3-70b-versatile", "groq");
    } catch (e) {
      console.error("[AI] Groq Final Error:", e);
    }
  }

  throw new Error("All AI providers and fallbacks failed. Please check your API keys.");
}

async function executeCall(messages: Message[], model: string, providerKey: "openrouter" | "groq" | "google") {
  const providers = getProviders();
  const provider = providers[providerKey];
  
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
      temperature: 0.3,
      max_tokens: 6000,
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
