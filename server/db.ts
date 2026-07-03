import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../shared/schema.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Minimal local .env loader so DATABASE_URL is available even without `dotenv`
try {
  const envPath = join(process.cwd(), '.env');
  if (existsSync(envPath)) {
    const text = readFileSync(envPath, 'utf8');
    for (const rawLine of text.split('\n')) {
      const line = rawLine.trim().replace(/\r$/, '');
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq <= 0) continue;
      const key = line.slice(0, eq).trim();
      const value = line.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
      if (key && !(key in process.env)) process.env[key] = value;
    }
  }
} catch {
  // ignore local loader errors
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL must be set. Follow instructions in README.md to setup your database.',
  );
}

export const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });
