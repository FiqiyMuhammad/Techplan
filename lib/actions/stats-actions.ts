
"use server"

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { count, eq } from "drizzle-orm";
import { documents, scripts } from "@/lib/db/schema";

export async function getDashboardStats() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    return {
      success: false,
      error: "Unauthorized"
    };
  }

  const userId = session.user.id;

  try {
    // Count Curriculums
    const [currCount] = await db
      .select({ value: count() })
      .from(documents)
      .where(eq(documents.userId, userId));

    // Count Scripts
    const [scriptCount] = await db
      .select({ value: count() })
      .from(scripts)
      .where(eq(scripts.userId, userId));

    const totalGenerated = currCount.value + scriptCount.value;
    
    // Hypothetical stats: 
    // 1 Curriculum saves ~4 hours
    // 1 Script saves ~2 hours
    const estimatedHoursSaved = (currCount.value * 4) + (scriptCount.value * 2);
    
    // Hypothetical cost: Gemini Flash is cheap, Groq is free.
    // Let's say we saved them ~Rp 500,000 in professional service fees per item.
    const moneySaved = totalGenerated * 250000; 

    return {
      success: true,
      data: {
        curriculums: currCount.value,
        scripts: scriptCount.value,
        total: totalGenerated,
        hoursSaved: estimatedHoursSaved,
        moneySaved: moneySaved
      }
    };
  } catch (error) {
    console.error("Stats Error:", error);
    return { success: false, error: "Failed to fetch stats" };
  }
}

export async function getActivityData() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return { success: false, error: "Unauthorized" };
  const userId = session.user.id;

  try {
    // Get activity from documents, scripts, and workflows
    const docs = await db.query.documents.findMany({
      where: (documents, { eq }) => eq(documents.userId, userId),
      columns: { createdAt: true }
    });

    const scs = await db.query.scripts.findMany({
      where: (scripts, { eq }) => eq(scripts.userId, userId),
      columns: { createdAt: true }
    });

    const wfs = await db.query.workflows.findMany({
      where: (workflows, { eq }) => eq(workflows.userId, userId),
      columns: { createdAt: true }
    });

    // Combine and group by date (YYYY-MM-DD)
    const counts: Record<string, number> = {};
    
    [...docs, ...scs, ...wfs].forEach(item => {
      if (!item.createdAt) return;
      const date = new Date(item.createdAt).toISOString().split('T')[0];
      counts[date] = (counts[date] || 0) + 1;
    });

    return {
      success: true,
      data: counts
    };
  } catch (error) {
    console.error("Activity Data Error:", error);
    return { success: false, error: "Failed to fetch activity data" };
  }
}
