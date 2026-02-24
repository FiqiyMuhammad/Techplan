
import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();
const sql = postgres(process.env.DATABASE_URL!, { prepare: false });
async function main() {
  try {
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user';
    `;
    console.log('Columns in user table:', columns.map(c => c.column_name));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
main();
