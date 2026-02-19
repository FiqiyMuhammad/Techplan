import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { user, session, account, verification } from "./db/schema";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    // Map Drizzle schema to better-auth
    provider: "pg", // Use postgres
    schema: { user: user, session: session, account: account, verification: verification }
  }),
  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: false,
      },
      lastName: {
        type: "string",
        required: false,
      },
    }
  },
  emailAndPassword: {
    enabled: true
  },
  socialProviders: {
     google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        mapProfileToUser: (profile) => {
          return {
            firstName: profile.given_name,
            lastName: profile.family_name,
          };
        },
     }
  },
  plugins: [
    nextCookies(), // Important for cookie management in Next 15/16
  ]
});
