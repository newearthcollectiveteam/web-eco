/**
 * Migration runner for consent tracking
 * Run with: node scripts/run-consent-migration.js
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import postgres from 'postgres';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env') });

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('🔄 Connecting to database...');
  const sql = postgres(databaseUrl);

  try {
    // Read migration file
    const migrationPath = join(__dirname, '..', 'migrations', 'add-consent-tracking.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('📝 Running consent tracking migration...');
    await sql.unsafe(migrationSQL);

    console.log('✅ Consent tracking migration completed successfully!');
    console.log('\nNew fields added to contacts:');
    console.log('  - email_consent (boolean)');
    console.log('  - sms_consent (boolean)');
    console.log('  - consent_granted_at (timestamp)');
    console.log('  - consent_ip_address (varchar)');
    console.log('  - unsubscribed_email (boolean)');
    console.log('  - unsubscribed_sms (boolean)');
    console.log('  - unsubscribed_at (timestamp)');
    console.log('  - unsubscribe_token (varchar, unique)');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();
