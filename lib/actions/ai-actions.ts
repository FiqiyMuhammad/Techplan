
"use server";

import { callAI, Message } from "@/lib/ai/client";
import { APPSCRIPT_SYSTEM_PROMPT, CURRICULUM_SYSTEM_PROMPT, GEMINI_CURRICULUM_ENHANCER, GEMINI_APPSCRIPT_ENHANCER, GROQ_CURRICULUM_ENHANCER, GPT_APPSCRIPT_ENHANCER, GPT_CURRICULUM_ENHANCER, GROQ_APPSCRIPT_ENHANCER } from "@/lib/ai/prompts";
import { verifyAndDeductCredits } from "@/lib/actions/user-actions";

export async function generateAppScript(
  prompt: string, 
  history: Message[] = [],
  provider: "openrouter" | "google" | "groq" = "google",
  model: string = "google/gemini-2.0-flash-001",
  imageBase64?: string
) {
  let systemPrompt = APPSCRIPT_SYSTEM_PROMPT;
  if (provider === "google") systemPrompt += `\n\n${GEMINI_APPSCRIPT_ENHANCER}`;
  if (provider === "openrouter") systemPrompt += `\n\n${GPT_APPSCRIPT_ENHANCER}`;
  if (provider === "groq") systemPrompt += `\n\n${GROQ_APPSCRIPT_ENHANCER}`;

  let userContent: Message["content"] = prompt;
  if (imageBase64) {
    userContent = [
      { type: "text", text: prompt },
      { type: "image_url", image_url: { url: imageBase64 } }
    ];
  }

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: userContent }
  ];

  try {
    // 1. Determine Credits based on provider
    const costs = { openrouter: 15, google: 10, groq: 5 };
    const cost = costs[provider] || 10;

    // 2. Verify and Deduct
    const creditCheck = await verifyAndDeductCredits(cost);
    if (!creditCheck.success) {
      return { success: false, error: creditCheck.error };
    }

    const response = await callAI(messages, model, "openai/gpt-4o-mini", provider);
    return { success: true, content: response, creditsUsed: cost };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: errorMessage };
  }
}

export async function generateCurriculum(
  prompt: string, 
  history: Message[] = [],
  provider: "openrouter" | "google" | "groq" = "google",
  model: string = "google/gemini-2.0-flash-001"
) {
  let systemPrompt = CURRICULUM_SYSTEM_PROMPT;
  if (provider === "google") systemPrompt += `\n\n${GEMINI_CURRICULUM_ENHANCER}`;
  if (provider === "openrouter") systemPrompt += `\n\n${GPT_CURRICULUM_ENHANCER}`;
  if (provider === "groq") systemPrompt += `\n\n${GROQ_CURRICULUM_ENHANCER}`;

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: prompt }
  ];

  try {
    // 1. Determine Credits
    const costs = { openrouter: 15, google: 10, groq: 5 };
    const cost = costs[provider] || 10;

    // 2. Verify and Deduct
    const creditCheck = await verifyAndDeductCredits(cost);
    if (!creditCheck.success) {
      return { success: false, error: creditCheck.error };
    }

    const response = await callAI(messages, model, "openai/gpt-4o-mini", provider);
    return { success: true, content: response, creditsUsed: cost };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: errorMessage };
  }
}
