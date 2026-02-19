
"use server"

import { db } from "@/lib/db";
import { schedules } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, sql } from "drizzle-orm";

export async function createSchedule(data: {
  title: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  type?: string;
  notes?: string;
  color?: string;
  participants?: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) throw new Error("Unauthorized");

  const [newSchedule] = await db.insert(schedules).values({
    userId: session.user.id,
    ...data
  }).returning();

  return newSchedule;
}

export async function getSchedules(date?: Date) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return [];

  if (date) {
    // Get schedules for a specific day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db.query.schedules.findMany({
      where: (schedules, { and, eq, between }) => and(
        eq(schedules.userId, session.user.id),
        between(schedules.date, startOfDay, endOfDay)
      ),
      orderBy: (schedules, { asc }) => [asc(schedules.startTime)]
    });
  }

  return await db.query.schedules.findMany({
    where: (schedules, { eq }) => eq(schedules.userId, session.user.id),
    orderBy: (schedules, { asc }) => [asc(schedules.date), asc(schedules.startTime)]
  });
}

export async function updateSchedule(id: string, data: Partial<typeof schedules.$inferInsert>) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) throw new Error("Unauthorized");

  const [updated] = await db.update(schedules)
    .set({ ...data })
    .where(and(eq(schedules.id, id), eq(schedules.userId, session.user.id)))
    .returning();

  return updated;
}

export async function deleteSchedule(id: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) throw new Error("Unauthorized");

  await db.delete(schedules)
    .where(and(eq(schedules.id, id), eq(schedules.userId, session.user.id)));

  return { success: true };
}
