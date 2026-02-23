
"use server"

import { db } from "@/lib/db";
import { scripts } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

export async function getScripts() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return [];

  return await db.query.scripts.findMany({
    where: (scripts, { eq }) => eq(scripts.userId, session.user.id),
    orderBy: (scripts, { desc }) => [desc(scripts.createdAt)]
  });
}

export async function saveScript(data: {
  title: string;
  code: string;
  description?: string;
  language?: string;
  version?: number;
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) throw new Error("Unauthorized");

  const [inserted] = await db.insert(scripts).values({
    userId: session.user.id,
    ...data
  }).returning();

  return inserted;
}

export async function deleteScript(id: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) throw new Error("Unauthorized");

  await db.delete(scripts)
    .where(and(eq(scripts.id, id), eq(scripts.userId, session.user.id)));

  return { success: true };
}

export async function updateScript(id: string, data: {
  title?: string;
  code?: string;
  description?: string;
  version?: number;
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) throw new Error("Unauthorized");

  await db.update(scripts)
    .set({
      ...(data.title && { title: data.title }),
      ...(data.code && { code: data.code }),
      ...(data.description && { description: data.description }),
      ...(data.version && { version: data.version }),
      updatedAt: new Date(),
    })
    .where(and(eq(scripts.id, id), eq(scripts.userId, session.user.id)));

  return { success: true };
}
