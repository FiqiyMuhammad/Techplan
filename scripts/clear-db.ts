import { db } from "../lib/db";
import { sql } from "drizzle-orm";
import {
  user,
  session,
  account,
  verification,
  subscriptions,
  creditLogs,
  schedules,
  workflows,
  notes,
  documents,
  scripts,
  todos,
} from "../lib/db/schema";

async function clearDatabase() {
  console.log("⏳ Clearing database...");

  try {
    // We use a raw SQL approach with CASCADE to handle foreign key dependencies easily
    // Note: Better-Auth tables follow its own logic, but TRUNCATE CASCADE is robust.
    
    await db.execute(sql`
      TRUNCATE TABLE 
        "user", 
        "session", 
        "account", 
        "verification", 
        "subscriptions", 
        "credit_logs", 
        "schedules", 
        "workflows", 
        "notes", 
        "documents", 
        "scripts", 
        "todos" 
      CASCADE;
    `);

    console.log("✅ Database cleared successfully!");
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

clearDatabase();
