import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../shared/schema.ts';

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Follow instructions in README.md to setup your database.",
  );
}

export const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });
