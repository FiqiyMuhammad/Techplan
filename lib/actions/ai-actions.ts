
"use server";

import { callAI, Message } from "@/lib/ai/client";
import { APPSCRIPT_SYSTEM_PROMPT, CURRICULUM_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { verifyAndDeductCredits } from "@/lib/actions/user-actions";

export async function generateAppScript(
  prompt: string, 
  history: Message[] = [],
  provider: "openrouter" | "google" | "groq" = "google",
  model: string = "google/gemini-2.0-flash-001"
) {
  const messages: Message[] = [
    { role: "system", content: APPSCRIPT_SYSTEM_PROMPT },
    ...history,
    { role: "user", content: prompt }
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
  const messages: Message[] = [
    { role: "system", content: CURRICULUM_SYSTEM_PROMPT },
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
