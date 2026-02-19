
import { pgTable, text, integer, timestamp, boolean, jsonb, uuid, pgEnum, index } from "drizzle-orm/pg-core";

// --- ENUMS ---
export const planEnum = pgEnum("plan", ["FREE", "PRO"]);
export const statusEnum = pgEnum("status", ["ACTIVE", "EXPIRED"]);
export const roleEnum = pgEnum("role", ["USER", "ADMIN"]);

// --- AUTH (Better-Auth Standard Schema) ---
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  firstName: text("firstName"),
  lastName: text("lastName"),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  role: text("role").default("USER"),
}, (table) => [
  index("user_email_idx").on(table.email),
]);

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => user.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
}, (table) => [
  index("session_user_idx").on(table.userId),
]);

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => user.id),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  idToken: text("idToken"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
}, (table) => [
  index("account_user_idx").on(table.userId),
]);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
});

// --- BUSINESS LOGIC ---

// 1. Subscriptions & Credits
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").notNull().references(() => user.id).unique(),
  plan: planEnum("plan").default("FREE"),
  creditsTotal: integer("creditsTotal").default(10), // Default free credits
  creditsUsed: integer("creditsUsed").default(0),
  status: statusEnum("status").default("ACTIVE"),
  expiresAt: timestamp("expiresAt"),
  cycleStart: timestamp("cycleStart").defaultNow(),
  cycleEnd: timestamp("cycleEnd"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
}, (table) => [
  index("sub_user_idx").on(table.userId),
]);

// 2. Credit Logs (Audit Trail)
export const creditLogs = pgTable("credit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").notNull().references(() => user.id),
  amount: integer("amount").notNull(), // Negative for usage, positive for top-up
  action: text("action").notNull(), // e.g., 'generate_curriculum', 'monthly_reset'
  metadata: jsonb("metadata"), // Extra details like which template was used
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => [
  index("credit_log_user_idx").on(table.userId),
]);

// --- APP FEATURES (PERSISTENCE) ---

// 3. Schedules (Calendar Events)
export const schedules = pgTable("schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").notNull().references(() => user.id),
  title: text("title").notNull(),
  date: timestamp("date").notNull(),
  startTime: text("startTime"), // "10:00"
  endTime: text("endTime"), // "11:00"
  type: text("type").default("online"), // online, offline, hybrid
  notes: text("notes"),
  color: text("color").default("blue"),
  participants: text("participants"), // JSON array or comma-separated
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => [
  index("schedule_user_idx").on(table.userId),
  index("schedule_date_idx").on(table.date),
]);

// 4. Workflows (Brainstorming Diagrams)
export const workflows = pgTable("workflows", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").notNull().references(() => user.id),
  title: text("title").notNull(),
  nodes: jsonb("nodes").default([]), // ReactFlow nodes
  edges: jsonb("edges").default([]), // ReactFlow edges
  status: text("status").default("Draft"), // Draft, Planning, In Progress
  color: text("color").default("blue"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
}, (table) => [
  index("workflow_user_idx").on(table.userId),
]);

// 5. Notes (Dashboard Scratchpad & Sticky Notes)
export const notes = pgTable("notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").notNull().references(() => user.id),
  title: text("title").default("Untitled"),
  content: text("content"),
  color: text("color").default("yellow"),
  tags: jsonb("tags"),
  isArchived: boolean("isArchived").default(false),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
}, (table) => [
  index("note_user_idx").on(table.userId),
]);

// 6. Documents (Generated Curriculums)
export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").notNull().references(() => user.id),
  title: text("title").notNull(),
  content: text("content").notNull(), // The actual generated content (Markdown/JSON)
  type: text("type").default("curriculum"),
  format: text("format").default("pdf"), // Planned export format
  fileUrl: text("fileUrl"), // For future file storage URL
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => [
  index("doc_user_idx").on(table.userId),
]);

// 7. Scripts (Generated AppScripts)
export const scripts = pgTable("scripts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").notNull().references(() => user.id),
  title: text("title").notNull(),
  code: text("code").notNull(), // The generated code
  description: text("description"), // Summary and installation guide
  language: text("language").default("javascript"),
  version: integer("version").default(1),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => [
  index("script_user_idx").on(table.userId),
]);
