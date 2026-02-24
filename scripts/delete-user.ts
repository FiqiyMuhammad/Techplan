
import "dotenv/config";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = postgres(databaseUrl);

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Please provide an email address as an argument.");
    console.log("Usage: npx tsx scripts/delete-user.ts user@example.com");
    process.exit(1);
  }

  try {
    console.log(`Searching for user with email: ${email}...`);
    const users = await sql`SELECT id FROM "user" WHERE email = ${email}`;

    if (users.length === 0) {
      console.error(`User with email ${email} not found.`);
      process.exit(1);
    }

    const userId = users[0].id;
    console.log(`User found with ID: ${userId}. Starting deletion process...`);

    console.log("- Deleting sessions...");
    await sql`DELETE FROM "session" WHERE "userId" = ${userId}`;

    console.log("- Deleting accounts...");
    await sql`DELETE FROM "account" WHERE "userId" = ${userId}`;

    console.log("- Deleting subscriptions...");
    await sql`DELETE FROM "subscriptions" WHERE "userId" = ${userId}`;

    console.log("- Deleting credit logs...");
    await sql`DELETE FROM "credit_logs" WHERE "userId" = ${userId}`;

    console.log("- Deleting documents...");
    await sql`DELETE FROM "documents" WHERE "userId" = ${userId}`;

    console.log("- Deleting scripts...");
    await sql`DELETE FROM "scripts" WHERE "userId" = ${userId}`;

    console.log("- Deleting notes...");
    await sql`DELETE FROM "notes" WHERE "userId" = ${userId}`;

    console.log("- Deleting schedules...");
    await sql`DELETE FROM "schedules" WHERE "userId" = ${userId}`;

    console.log("- Deleting workflows...");
    await sql`DELETE FROM "workflows" WHERE "userId" = ${userId}`;

    console.log("- Deleting todos...");
    await sql`DELETE FROM "todos" WHERE "userId" = ${userId}`;

    console.log("- Deleting user record...");
    await sql`DELETE FROM "user" WHERE id = ${userId}`;

    console.log("------------------------------------------");
    console.log(`SUCCESS: User ${email} and all associated data have been permanently deleted.`);
    process.exit(0);
  } catch (error) {
    console.error("ERROR: An error occurred during the deletion process:");
    console.error(error);
    process.exit(1);
  }
}

main();
