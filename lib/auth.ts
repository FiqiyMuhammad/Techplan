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
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            mapProfileToUser: (profile: any) => {
              return {
                firstName: profile.given_name,
                lastName: profile.family_name,
              };
            },
          },
        }
      : {}),
  },
  plugins: [
    nextCookies(),
  ],
  trustedOrigins: [
    "http://localhost:3000",
    "https://tedu-sigma.vercel.app",
    "https://techplan-seven.vercel.app",
    "https://techplan-farikhs-projects.vercel.app",
    "https://www.techplan-web.site",
    "https://techplan-web.site",
    ...(process.env.NEXT_PUBLIC_APP_URL ? [process.env.NEXT_PUBLIC_APP_URL] : []),
    ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
  ].filter(Boolean)
});
