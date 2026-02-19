
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
  try {
    console.log("🧹 Cleaning database...");

    // Order is important if not using CASCADE, but CASCADE is safer to ensure everything is cleared.
    // We'll list all tables from schema.ts
    const tables = [
      'session',
      'account',
      'verification',
      'subscriptions',
      'credit_logs',
      'schedules',
      'workflows',
      'notes',
      'documents',
      'scripts',
      'user'
    ];

    for (const table of tables) {
      console.log(`Clearing table: ${table}...`);
      await sql.unsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
    }

    console.log("✅ Database cleared successfully! Your app is now fresh and ready for new users.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error clearing database:", err);
    process.exit(1);
  }
}

main();
