
import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();
const sql = postgres(process.env.DATABASE_URL!, { prepare: false });
async function main() {
  try {
    console.log('Attempting to drop "username" column...');
    await sql`ALTER TABLE "user" DROP COLUMN "username";`;
    console.log('Success.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}
main();
