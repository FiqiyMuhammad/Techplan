
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

async function main() {
  try {
    console.log('Dropping username column from user table...');
    await sql`ALTER TABLE "user" DROP COLUMN IF EXISTS "username";`;
    console.log('Username column dropped successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error dropping column:', err);
    process.exit(1);
  }
}

main();
