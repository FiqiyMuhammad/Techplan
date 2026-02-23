"use server"

import { db } from "@/lib/db";
import { todos } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getTodos() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) return [];

    try {
        return await db.query.todos.findMany({
            where: eq(todos.userId, session.user.id),
            orderBy: [desc(todos.createdAt)]
        });
    } catch (error) {
        console.error("Error fetching todos:", error);
        return [];
    }
}

export async function addTodo(task: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) throw new Error("Unauthorized");

    const [newTodo] = await db.insert(todos).values({
        userId: session.user.id,
        task,
    }).returning();

    revalidatePath("/dashboard");
    return newTodo;
}

export async function toggleTodo(id: string, isCompleted: boolean) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) throw new Error("Unauthorized");

    await db.update(todos)
        .set({ isCompleted, updatedAt: new Date() })
        .where(and(eq(todos.id, id), eq(todos.userId, session.user.id)));

    revalidatePath("/dashboard");
}

export async function deleteTodo(id: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) throw new Error("Unauthorized");

    await db.delete(todos)
        .where(and(eq(todos.id, id), eq(todos.userId, session.user.id)));

    revalidatePath("/dashboard");
}

export async function updateTodoTask(id: string, task: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) throw new Error("Unauthorized");

    await db.update(todos)
        .set({ task, updatedAt: new Date() })
        .where(and(eq(todos.id, id), eq(todos.userId, session.user.id)));

    revalidatePath("/dashboard");
}
