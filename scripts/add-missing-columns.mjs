import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables
config({ path: '.env' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: 'require' });

const missingColumns = [
  `ALTER TABLE "web-eco_questionnaire_response" ADD COLUMN IF NOT EXISTS "preferred_name" varchar(255)`,
  `ALTER TABLE "web-eco_questionnaire_response" ADD COLUMN IF NOT EXISTS "primary_role" varchar(500)`,
  `ALTER TABLE "web-eco_questionnaire_response" ADD COLUMN IF NOT EXISTS "skills" jsonb DEFAULT '[]'::jsonb`,
  `ALTER TABLE "web-eco_questionnaire_response" ADD COLUMN IF NOT EXISTS "website" varchar(500)`,
  `ALTER TABLE "web-eco_questionnaire_response" ADD COLUMN IF NOT EXISTS "new_earth_meaning" text`,
  `ALTER TABLE "web-eco_questionnaire_response" ADD COLUMN IF NOT EXISTS "unique_gift" text`,
  `ALTER TABLE "web-eco_questionnaire_response" ADD COLUMN IF NOT EXISTS "how_found_us" varchar(100)`,
  `ALTER TABLE "web-eco_questionnaire_response" ADD COLUMN IF NOT EXISTS "existing_connections" text`,
  `ALTER TABLE "web-eco_questionnaire_response" ADD COLUMN IF NOT EXISTS "engagement_styles" jsonb DEFAULT '[]'::jsonb`,
  `ALTER TABLE "web-eco_questionnaire_response" ADD COLUMN IF NOT EXISTS "profile_visibility" varchar(50)`,
  `ALTER TABLE "web-eco_questionnaire_response" ADD COLUMN IF NOT EXISTS "source" varchar(100) DEFAULT 'questionnaire'`,
];

async function addMissingColumns() {
  try {
    for (const stmt of missingColumns) {
      try {
        await sql.unsafe(stmt);
        console.log(`✓ Added column: ${stmt.match(/\"(\w+)\"/g)?.[1] || 'unknown'}`);
      } catch (err) {
        console.error(`✗ Failed:`, err.message);
      }
    }
    console.log('Done!');
  } finally {
    await sql.end();
  }
}

addMissingColumns();
