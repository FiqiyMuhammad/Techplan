
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
  try {
    console.log("Checking user table columns...");
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user';
    `;
    console.log("Existing columns:", columns.map(c => c.column_name));

    const existingNames = columns.map(c => c.column_name);

    if (!existingNames.includes('firstName')) {
      console.log("Adding firstName column...");
      await sql`ALTER TABLE "user" ADD COLUMN "firstName" TEXT;`;
    }
    if (!existingNames.includes('lastName')) {
      console.log("Adding lastName column...");
      await sql`ALTER TABLE "user" ADD COLUMN "lastName" TEXT;`;
    }


    console.log("Checking schedules table columns...");
    const scheduleCols = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'schedules';
    `;
    if (!scheduleCols.map(c => c.column_name).includes('color')) {
      console.log("Adding color column to schedules...");
      await sql`ALTER TABLE "schedules" ADD COLUMN "color" TEXT DEFAULT 'blue';`;
    }

    console.log("Database updated successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error updating database:", err);
    process.exit(1);
  }
}

main();
