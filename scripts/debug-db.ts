
import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();
const sql = postgres(process.env.DATABASE_URL!, { prepare: false });
async function main() {
  try {
    console.log("Listing all tables in public schema:");
    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log(tables.map(t => t.table_name));

    console.log("\nChecking columns for 'user' table:");
    const cols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user' 
      ORDER BY ordinal_position;
    `;
    console.table(cols);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
main();
