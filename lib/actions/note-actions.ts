
"use server"

import { db } from "@/lib/db";
import { notes } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

export async function saveQuickNote(content: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // We'll treat the note with title 'Scratchpad' as the quick note
  const existingNote = await db.query.notes.findFirst({
    where: (notes, { and, eq }) => and(eq(notes.userId, userId), eq(notes.title, "Scratchpad"))
  });

  if (existingNote) {
    await db.update(notes)
      .set({ content, updatedAt: new Date() })
      .where(eq(notes.id, existingNote.id));
    return { success: true, id: existingNote.id };
  } else {
    const [newNote] = await db.insert(notes).values({
      userId,
      title: "Scratchpad",
      content,
      color: "yellow"
    }).returning();
    return { success: true, id: newNote.id };
  }
}

export async function getQuickNote() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    return null;
  }

  const userId = session.user.id;
  const note = await db.query.notes.findFirst({
    where: (notes, { and, eq }) => and(eq(notes.userId, userId), eq(notes.title, "Scratchpad"))
  });

  return note?.content || "";
}

// Support for other notes
export async function getNotes() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) return [];

    return await db.query.notes.findMany({
        where: (notes, { and, eq, ne }) => and(
            eq(notes.userId, session.user.id),
            ne(notes.title, "Scratchpad") // Exclude scratchpad from general notes
        ),
        orderBy: (notes, { desc }) => [desc(notes.updatedAt)]
    });
}

export async function saveNote(data: {
    id?: string;
    title: string;
    content: string;
    color?: string;
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) throw new Error("Unauthorized");

    if (data.id) {
        const [updated] = await db.update(notes)
            .set({ 
                title: data.title, 
                content: data.content, 
                color: data.color, 
                updatedAt: new Date() 
            })
            .where(and(eq(notes.id, data.id), eq(notes.userId, session.user.id)))
            .returning();
        return updated;
    } else {
        const [inserted] = await db.insert(notes).values({
            userId: session.user.id,
            title: data.title,
            content: data.content,
            color: data.color || 'yellow'
        }).returning();
        return inserted;
    }
}

export async function deleteNote(id: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) throw new Error("Unauthorized");

    await db.delete(notes)
        .where(and(eq(notes.id, id), eq(notes.userId, session.user.id)));

    return { success: true };
}
