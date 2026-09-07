import { NextResponse } from "next/server";

export async function GET() {
  const config = {
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ? "SET (" + process.env.BETTER_AUTH_URL + ")" : "NOT SET ❌",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ? "SET (" + process.env.NEXT_PUBLIC_APP_URL + ")" : "NOT SET ❌",
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? "SET ✅ (length: " + process.env.BETTER_AUTH_SECRET.length + ")" : "NOT SET ❌",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "SET ✅ (ends with: ..." + process.env.GOOGLE_CLIENT_ID.slice(-10) + ")" : "NOT SET ❌",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "SET ✅ (ends with: ..." + process.env.GOOGLE_CLIENT_SECRET.slice(-8) + ")" : "NOT SET ❌",
    VERCEL_URL: process.env.VERCEL_URL || "NOT SET",
    NODE_ENV: process.env.NODE_ENV,
  };

  return NextResponse.json({
    status: "diagnostic",
    timestamp: new Date().toISOString(),
    environment: config,
  }, { status: 200 });
}
