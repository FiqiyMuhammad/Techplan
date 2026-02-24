import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing');
}

// For query purposes
const client = postgres(process.env.DATABASE_URL, { 
  prepare: false,
  connect_timeout: 10,
});
export const db = drizzle(client, { schema });
