
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

async function testConnection() {
  try {
    console.log("Testing DB connection...");
    const result = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`;
    console.log("Tables found:", result.map(r => r.table_name));
    process.exit(0);
  } catch (err) {
    console.error("DB Connection Error:", err);
    process.exit(1);
  }
}

testConnection();
