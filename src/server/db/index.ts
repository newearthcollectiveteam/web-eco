import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "~/env";
import * as schema from "./schema";

/**
 * Database client configuration
 * PostgreSQL via Supabase pooler
 */

// Lazy database connection - only created when first accessed
// This prevents build-time connection attempts in Vercel
let _db: ReturnType<typeof drizzle> | null = null;

function createDatabase() {
  const globalForDb = globalThis as unknown as {
    conn: ReturnType<typeof postgres> | undefined;
  };

  const conn =
    globalForDb.conn ??
    postgres(env.DATABASE_URL, {
      prepare: false,
    });
  if (env.NODE_ENV !== "production") globalForDb.conn = conn;

  return drizzle(conn, { schema });
}

// Type helper to get the database type with schema
type DatabaseType = ReturnType<typeof drizzle<typeof schema>>;

// Use a Proxy to lazily create the database connection only when accessed
export const db = new Proxy({} as DatabaseType, {
  get(_target, prop: string | symbol) {
    if (!_db) {
      _db = createDatabase();
    }
    return (_db as unknown as Record<string | symbol, unknown>)[prop];
  },
});
