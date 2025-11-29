import postgres from 'postgres';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '../.env') });

const sql = postgres(process.env.DATABASE_URL);

async function runMigration() {
  try {
    console.log('🔄 Adding questionnaire field to waitlist_intake table...');

    const migrationSQL = readFileSync(
      join(__dirname, '../migrations/add-questionnaire-field.sql'),
      'utf-8'
    );

    await sql.unsafe(migrationSQL);

    console.log('✅ Migration completed successfully!');
    console.log('📋 Added willing_to_fill_questionnaire field');

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await sql.end();
    process.exit(1);
  }
}

runMigration();
