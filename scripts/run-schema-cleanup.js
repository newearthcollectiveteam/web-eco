/**
 * Schema Cleanup & Optimization Migration
 * Adds performance indexes and missing constraints
 * Run with: node scripts/run-schema-cleanup.js
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import postgres from "postgres";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, "..", ".env") });

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!databaseUrl) {
    console.error("❌ DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  console.log("🔄 Connecting to database...");
  const sql = postgres(databaseUrl);

  try {
    // Read migration file
    const migrationPath = join(
      __dirname,
      "..",
      "migrations",
      "schema-cleanup-indexes.sql"
    );
    const migrationSQL = readFileSync(migrationPath, "utf8");

    console.log("📝 Running schema cleanup migration...");
    console.log("   - Adding composite unique constraints");
    console.log("   - Creating performance indexes");
    console.log("   - Adding table documentation");

    await sql.unsafe(migrationSQL);

    console.log("\n✅ Schema cleanup migration completed successfully!\n");
    console.log("Optimizations applied:");
    console.log("  ✓ Composite unique constraint on contact_source");
    console.log("  ✓ 20+ performance indexes added");
    console.log("  ✓ Table documentation comments added");
    console.log("\n🚀 Database is now fully optimized for production!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();
