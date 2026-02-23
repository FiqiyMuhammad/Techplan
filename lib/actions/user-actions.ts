"use server";

import { db } from "@/lib/db";
import { user, workflows, documents, subscriptions, notes, creditLogs, scripts } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function updateProfile(userId: string, data: {
  firstName?: string;
  lastName?: string;
  image?: string;
}) {
  try {
    // 1. Fetch current user to preserve existing data
    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, userId)
    });

    if (!currentUser) {
      return { success: false, error: "User not found" };
    }

    // 2. Prepare update payload
    const fName = data.firstName !== undefined ? data.firstName : (currentUser.firstName || "");
    const lName = data.lastName !== undefined ? data.lastName : (currentUser.lastName || "");
    
    const updatePayload = {
      ...data,
      // Integrated name: always sync name from firstName and lastName
      name: `${fName} ${lName}`.trim() || currentUser.name || "User",
      updatedAt: new Date(),
    };

    await db.update(user)
      .set(updatePayload)
      .where(eq(user.id, userId));

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { success: false, error: "Failed to update profile details" };
  }
}

export async function getUsageStats() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  const userId = session.user.id;

  try {
    // Parallelize all independent database queries
    const [
      projectCountRes,
      docCountRes,
      scriptCountRes,
      subRes,
      recentWorkflowsRes,
      recentDocumentsRes,
      recentScriptsRes
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(workflows).where(eq(workflows.userId, userId)),
      db.select({ count: sql<number>`count(*)` }).from(documents).where(eq(documents.userId, userId)),
      db.select({ count: sql<number>`count(*)` }).from(scripts).where(eq(scripts.userId, userId)),
      db.select().from(subscriptions).where(eq(subscriptions.userId, userId)),
      db.select().from(workflows).where(eq(workflows.userId, userId)).limit(5).orderBy(sql`${workflows.createdAt} desc`),
      db.select().from(documents).where(eq(documents.userId, userId)).limit(5).orderBy(sql`${documents.createdAt} desc`),
      db.select().from(scripts).where(eq(scripts.userId, userId)).limit(5).orderBy(sql`${scripts.createdAt} desc`)
    ]);

    const projectCount = projectCountRes[0];
    const docCount = docCountRes[0];
    const scriptCount = scriptCountRes[0];
    let sub = subRes[0];

    // Auto-create subscription if not exists
    if (!sub) {
      const [newSub] = await db.insert(subscriptions).values({
        userId,
        plan: "FREE",
        creditsTotal: 100,
        creditsUsed: 0
      }).returning();
      sub = newSub;
    }

    return {
      success: true,
      data: {
        projects: Number(projectCount?.count || 0),
        documents: Number(docCount?.count || 0) + Number(scriptCount?.count || 0),
        subscription: sub,
        recentWorkflows: recentWorkflowsRes.map(w => ({ id: w.id, title: w.title, type: 'workflow', createdAt: w.createdAt })),
        recentDocuments: recentDocumentsRes.map(d => ({ id: d.id, title: d.title, type: 'document', createdAt: d.createdAt })),
        recentScripts: recentScriptsRes.map(s => ({ id: s.id, title: s.title, type: 'script', createdAt: s.createdAt }))
      }
    };
  } catch (error) {
    console.error("Failed to fetch usage stats:", error);
    return { success: false, error: "Failed to fetch stats" };
  }
}

export async function verifyAndDeductCredits(amount: number = 10) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) throw new Error("Unauthorized");
  const userId = session.user.id;

  try {
    return await db.transaction(async (tx) => {
      // 1. Get or create subscription
      let [sub] = await tx.select().from(subscriptions).where(eq(subscriptions.userId, userId));
      
      if (!sub) {
        [sub] = await tx.insert(subscriptions).values({
          userId,
          creditsTotal: 100,
          creditsUsed: 0
        }).returning();
      }

      // 2. Check credits
      const remaining = (sub.creditsTotal || 0) - (sub.creditsUsed || 0);
      if (remaining < amount) {
        return { success: false, error: "Insufficient credits. Please upgrade your plan." };
      }

      // 3. Deduct (Atomic update)
      await tx.update(subscriptions)
        .set({ 
          creditsUsed: sql`${subscriptions.creditsUsed} + ${amount}`, 
          updatedAt: new Date() 
        })
        .where(eq(subscriptions.userId, userId));

      // 4. Log it
      await tx.insert(creditLogs).values({
        userId,
        amount: -amount,
        action: "ai_generation"
      });

      revalidatePath("/dashboard");
      return { success: true };
    });
  } catch (error) {
    console.error("Credit deduction failed:", error);
    return { success: false, error: "Failed to process credits" };
  }
}

export async function getResources() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  const userId = session.user.id;

  try {
    const ws = await db.select().from(workflows).where(eq(workflows.userId, userId)).orderBy(sql`${workflows.updatedAt} desc`);
    const docs = await db.select().from(documents).where(eq(documents.userId, userId)).orderBy(sql`${documents.updatedAt} desc`);
    const nts = await db.select().from(notes).where(eq(notes.userId, userId)).orderBy(sql`${notes.updatedAt} desc`);
    const scs = await db.select().from(scripts).where(eq(scripts.userId, userId)).orderBy(sql`${scripts.updatedAt} desc`);

    const allResources = [
      ...ws.map(w => ({ id: w.id, title: w.title, type: 'brainstorm' as const, updatedAt: w.updatedAt || w.createdAt, status: w.status || 'Active' })),
      ...docs.map(d => ({ id: d.id, title: d.title, type: 'curriculum' as const, updatedAt: d.updatedAt || d.createdAt, status: 'Completed' })),
      ...nts.map(n => ({ id: n.id, title: n.title || 'Untitled Note', type: 'note' as const, updatedAt: n.updatedAt || n.createdAt, status: n.isArchived ? 'Archived' : 'Draft' })),
      ...scs.map(s => ({ id: s.id, title: s.title, type: 'appscript' as const, updatedAt: s.updatedAt || s.createdAt, status: 'Script' }))
    ].sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime());

    return { success: true, data: allResources };
  } catch (error) {
    console.error("Failed to fetch resources:", error);
    return { success: false, error: "Failed to fetch resources" };
  }
}

export async function addCredits(amount: number) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) throw new Error("Unauthorized");
  const userId = session.user.id;

  try {
    return await db.transaction(async (tx) => {
      let [sub] = await tx.select().from(subscriptions).where(eq(subscriptions.userId, userId));
      
      if (!sub) {
        [sub] = await tx.insert(subscriptions).values({
          userId,
          creditsTotal: 100,
          creditsUsed: 0
        }).returning();
      }

      await tx.update(subscriptions)
        .set({ 
            creditsTotal: sql`${subscriptions.creditsTotal} + ${amount}`,
            updatedAt: new Date() 
        })
        .where(eq(subscriptions.userId, userId));

      await tx.insert(creditLogs).values({
        userId,
        amount: amount,
        action: "topup_simulation"
      });

      revalidatePath("/dashboard");
      return { success: true };
    });
  } catch (error) {
    console.error("Failed to add credits:", error);
    return { success: false, error: "Failed to process payment" };
  }
}

export async function deleteAllUserData() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  const userId = session.user.id;

  try {
    await db.delete(workflows).where(eq(workflows.userId, userId));
    await db.delete(documents).where(eq(documents.userId, userId));
    await db.delete(notes).where(eq(notes.userId, userId));
    await db.delete(scripts).where(eq(scripts.userId, userId));
    
    // We PRESERVE creditLogs, schedules, and todos as requested
    // This maintains the activity heatmap and personal task/calendar data

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete all data:", error);
    return { success: false, error: "Failed to delete all data" };
  }
}

