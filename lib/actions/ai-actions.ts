
"use server";

import { callAI, Message } from "@/lib/ai/client";
import { APPSCRIPT_SYSTEM_PROMPT, CURRICULUM_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { verifyAndDeductCredits } from "@/lib/actions/user-actions";

export async function generateAppScript(prompt: string, history: Message[] = []) {
  const messages: Message[] = [
    { role: "system", content: APPSCRIPT_SYSTEM_PROMPT },
    ...history,
    { role: "user", content: prompt }
  ];

  try {
    // 1. Verify and Deduct
    const creditCheck = await verifyAndDeductCredits(10);
    if (!creditCheck.success) {
      return { success: false, error: creditCheck.error };
    }

    const response = await callAI(messages, "google/gemini-2.0-flash-001");
    return { success: true, content: response };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: errorMessage };
  }
}

export async function generateCurriculum(prompt: string, history: Message[] = []) {
  const messages: Message[] = [
    { role: "system", content: CURRICULUM_SYSTEM_PROMPT },
    ...history,
    { role: "user", content: prompt }
  ];

  try {
    // 1. Verify and Deduct
    const creditCheck = await verifyAndDeductCredits(10);
    if (!creditCheck.success) {
      return { success: false, error: creditCheck.error };
    }

    const response = await callAI(messages, "google/gemini-2.0-flash-001");
    return { success: true, content: response };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: errorMessage };
  }
}
