
"use server"

import { db } from "@/lib/db";
import { workflows } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

export async function getWorkflows() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return [];

  return await db.query.workflows.findMany({
    where: (workflows, { eq }) => eq(workflows.userId, session.user.id),
    orderBy: (workflows, { desc }) => [desc(workflows.updatedAt)]
  });
}

export async function saveWorkflow(data: {
  id?: string;
  title: string;
  nodes?: unknown;
  edges?: unknown;
  status?: string;
  color?: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) throw new Error("Unauthorized");

  if (data.id) {
    const [updated] = await db.update(workflows)
      .set({ 
        title: data.title, 
        nodes: data.nodes, 
        edges: data.edges, 
        status: data.status,
        color: data.color,
        updatedAt: new Date() 
      })
      .where(and(eq(workflows.id, data.id), eq(workflows.userId, session.user.id)))
      .returning();
    return updated;
  } else {
    const [inserted] = await db.insert(workflows).values({
      userId: session.user.id,
      title: data.title,
      nodes: data.nodes,
      edges: data.edges,
      status: data.status || 'Draft',
      color: data.color || 'blue'
    }).returning();
    return inserted;
  }
}

export async function deleteWorkflow(id: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) throw new Error("Unauthorized");

  await db.delete(workflows)
    .where(and(eq(workflows.id, id), eq(workflows.userId, session.user.id)));

  return { success: true };
}
