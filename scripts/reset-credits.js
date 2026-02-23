
const postgres = require('postgres');
require('dotenv').config();

const sql = postgres(process.env.DATABASE_URL);

async function reset() {
  try {
    console.log("Resetting credits...");
    await sql`UPDATE subscriptions SET "creditsUsed" = 0, "creditsTotal" = 100`;
    console.log("Credits reset successfully to 100/100!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

reset();
