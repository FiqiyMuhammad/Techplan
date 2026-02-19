
"use server"

import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

export async function getDocuments(type?: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return [];

  return await db.query.documents.findMany({
    where: (documents, { and, eq }) => and(
        eq(documents.userId, session.user.id),
        type ? eq(documents.type, type) : undefined
    ),
    orderBy: (documents, { desc }) => [desc(documents.createdAt)]
  });
}

export async function saveDocument(data: {
  title: string;
  content: string;
  type?: string;
  format?: string;
  fileUrl?: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) throw new Error("Unauthorized");

  const [inserted] = await db.insert(documents).values({
    userId: session.user.id,
    ...data
  }).returning();

  return inserted;
}

export async function deleteDocument(id: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) throw new Error("Unauthorized");

  await db.delete(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, session.user.id)));

  return { success: true };
}
